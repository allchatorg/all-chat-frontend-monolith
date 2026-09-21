import {Node} from '@tiptap/core';
import {Fragment, Mark, Slice, type Node as ProseMirrorNode, type Schema} from '@tiptap/pm/model';
import {Plugin, TextSelection} from '@tiptap/pm/state';
import {getSticker} from '@/features/stickers/catalog';
import {markersToDoc} from '@/features/chatroom/utils/messageMarkers';
import {findUnicodeEmojiShortcodes} from '@/features/stickers/emojiShortcodes';
import {
    CUSTOM_EMOJI_TOKEN_PATTERN,
    getCustomEmojiLabel,
    isCustomEmojiId,
    toCustomEmojiToken,
} from '@/features/stickers/customEmoji';

// Keep clipboard token recognition consistent with chat's wire-format URL spans.
const URL_PATTERN = /https?:\/\/[^\s]+/g;

type InlineToken = {from: number; to: number} & ({customEmojiId: string} | {native: string});

function findInlineTokens(text: string): InlineToken[] {
    const custom = Array.from(text.matchAll(CUSTOM_EMOJI_TOKEN_PATTERN), match => ({
        from: match.index,
        to: match.index + match[0].length,
        customEmojiId: match[1],
    }));
    // A Unicode code must not reuse any part of a canonical custom token,
    // including the closing colon shared by strings such as :allchat:pepe:smile:.
    const unicode = findUnicodeEmojiShortcodes(text).filter(candidate =>
        !custom.some(token => candidate.from < token.to && candidate.to > token.from)
    );
    let end = 0;
    return [...custom, ...unicode].sort((a, b) => a.from - b.from).filter(token => {
        if (token.from < end) return false;
        end = token.to;
        return true;
    });
}

function tokenNode(token: InlineToken, schema: Schema, marks: readonly Mark[]): ProseMirrorNode {
    return 'customEmojiId' in token
        ? schema.nodes.customEmoji.create({id: token.customEmojiId}, null, marks)
        : schema.text(token.native, marks);
}

function replaceInlineTokens(fragment: Fragment, schema: Schema): Fragment {
    const visibleText = fragment.textBetween(0, fragment.size, '', leaf =>
        leaf.type.name === 'hardBreak' ? '\n' : '\uFFFC'
    );
    const urls = Array.from(visibleText.matchAll(URL_PATTERN), match => ({
        start: match.index,
        end: match.index + match[0].replace(/\*+$/, '').length,
    }));
    const nodes: ProseMirrorNode[] = [];

    fragment.forEach((node, offset) => {
        if (!node.isText || !node.text) {
            nodes.push(node);
            return;
        }
        let cursor = 0;
        for (const match of findInlineTokens(node.text)) {
            const start = offset + match.from;
            const end = offset + match.to;
            if (urls.some(url => start < url.end && end > url.start)) continue;
            if (match.from > cursor) nodes.push(schema.text(node.text.slice(cursor, match.from), node.marks));
            nodes.push(tokenNode(match, schema, node.marks));
            cursor = match.to;
        }
        if (cursor < node.text.length) nodes.push(schema.text(node.text.slice(cursor), node.marks));
    });
    return Fragment.fromArray(nodes);
}

function replacePastedTokens(fragment: Fragment, schema: Schema): Fragment {
    if (fragment.firstChild?.isInline) return replaceInlineTokens(fragment, schema);
    const nodes: ProseMirrorNode[] = [];
    fragment.forEach(node => {
        nodes.push(node.isLeaf ? node : node.copy(replacePastedTokens(node.content, schema)));
    });
    return Fragment.fromArray(nodes);
}

/** Inline atoms use catalog artwork; pasted HTML cannot provide an image URL. */
export const CustomEmoji = Node.create({
    name: 'customEmoji',
    inline: true,
    group: 'inline',
    atom: true,
    draggable: false,
    selectable: true,

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-allchat-emoji'),
                rendered: false,
            },
        };
    },

    parseHTML() {
        return [{
            tag: '[data-allchat-emoji]',
            getAttrs: element => {
                const id = element.getAttribute('data-allchat-emoji');
                return isCustomEmojiId(id) ? {id} : false;
            },
        }];
    },

    renderHTML({node}) {
        const id = isCustomEmojiId(node.attrs.id) ? node.attrs.id : null;
        const emoji = getSticker(id);
        const label = getCustomEmojiLabel(id);
        const attributes = {
            ...(id ? {'data-allchat-emoji': id} : {}),
            contenteditable: 'false',
            role: 'img',
            'aria-label': label,
            title: label,
            class: 'inline-flex h-[1.4em] w-[1.4em] shrink-0 items-center justify-center align-middle',
        };
        return emoji
            ? ['span', attributes, ['img', {
                src: emoji.src,
                alt: label,
                width: 24,
                height: 24,
                draggable: 'false',
                class: 'h-full w-full object-contain',
            }]]
            : ['span', attributes, '◇'];
    },

    // Tiptap's clipboard serializer uses this for plain-text copy, preserving IDs.
    renderText({node}) {
        return toCustomEmojiToken(node.attrs.id);
    },

    addProseMirrorPlugins() {
        return [new Plugin({
            props: {
                handleTextInput: (view, from, to, text) => {
                    if (view.composing || !text.endsWith(':')) return false;
                    const transaction = view.state.tr.insertText(text, from, to);
                    const cursor = transaction.selection.$from;
                    const parentText = cursor.parent.textBetween(0, cursor.parent.content.size, '', leaf =>
                        leaf.type.name === 'hardBreak' ? '\n' : '\uFFFC'
                    );
                    const match = findInlineTokens(parentText.slice(0, cursor.parentOffset))
                        .find(token => token.to === cursor.parentOffset);
                    if (!match || Array.from(parentText.matchAll(URL_PATTERN)).some(url =>
                        match.from < url.index + url[0].length && match.to > url.index
                    )) return false;

                    let marks: readonly Mark[] | undefined;
                    let sameTextStyle = true;
                    cursor.parent.nodesBetween(match.from, match.to, node => {
                        if (!node.isText || (marks && !Mark.sameSet(marks, node.marks))) sameTextStyle = false;
                        marks ??= node.marks;
                    });
                    if (!sameTextStyle || !marks) return false;
                    const start = cursor.start() + match.from;
                    const replacement = tokenNode(match, view.state.schema, marks);
                    transaction.replaceWith(start, cursor.start() + match.to, replacement);
                    transaction.setSelection(TextSelection.near(transaction.doc.resolve(start + replacement.nodeSize)));
                    transaction.ensureMarks(marks);
                    view.dispatch(transaction.scrollIntoView());
                    return true;
                },
                clipboardTextParser: (text, context, _plainText, view) => {
                    const doc = view.state.schema.nodeFromJSON(markersToDoc(text, {customEmojis: true}));
                    const paragraphs: ProseMirrorNode[] = [];
                    doc.forEach(paragraph => {
                        const children: ProseMirrorNode[] = [];
                        paragraph.forEach(child => {
                            const marks = context.marks().reduce((current, mark) => mark.addToSet(current), child.marks);
                            children.push(child.mark(marks));
                        });
                        paragraphs.push(paragraph.copy(Fragment.fromArray(children)));
                    });
                    return Slice.maxOpen(Fragment.fromArray(paragraphs));
                },
                // Runs after the normal clipboard parser, retaining rich-text marks,
                // current typing marks for plain text, and already-parsed emoji atoms.
                transformPasted: slice => new Slice(
                    replacePastedTokens(slice.content, this.editor.schema),
                    slice.openStart,
                    slice.openEnd,
                ),
            },
        })];
    },
});
