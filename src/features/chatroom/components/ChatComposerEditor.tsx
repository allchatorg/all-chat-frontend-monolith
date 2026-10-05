import React, {useEffect, useRef} from "react";
import {EditorContent, useEditor, type Editor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {Placeholder} from "@tiptap/extensions";
import {Slice} from "@tiptap/pm/model";
import type {Node as ProseMirrorNode} from "@tiptap/pm/model";
import {cn} from "@/lib/utils";
import {docToMarkers} from "@/features/chatroom/utils/messageMarkers";
import {Greentext} from "@/features/chatroom/utils/greentextExtension";
import {CustomEmoji} from "@/features/chatroom/utils/customEmojiExtension";

// Transactions dispatched by the dictation helpers carry this meta flag so
// ChatInput can tell user edits (which commit the interim tail) apart from
// dictation updates (which must keep it replaceable).
export const DICTATION_META = "dictation";

interface ChatComposerEditorProps {
    placeholder: string;
    style?: React.CSSProperties;
    editable: boolean;
    onSerializedChange: (serialized: string, isDictation: boolean) => void;
    onTextActivity?: (hasContent: boolean) => void;
    onEnter: () => void;
    onEscape: () => boolean;
    onReady: (editor: Editor) => void;
}

// WYSIWYG replacement for the composer textarea with bold, italic and greentext. The rich
// document never leaves this component — every update is serialized to the
// **bold**/*italic* marker string that the rest of the app (and the backend)
// works with.
export const ChatComposerEditor: React.FC<ChatComposerEditorProps> = ({
                                                                          placeholder,
                                                                          style,
                                                                          editable,
                                                                          onSerializedChange,
                                                                          onTextActivity,
                                                                          onEnter,
                                                                          onEscape,
                                                                          onReady,
                                                                      }) => {
    const placeholderRef = useRef(placeholder);
    placeholderRef.current = placeholder;
    const onEnterRef = useRef(onEnter);
    onEnterRef.current = onEnter;
    const onEscapeRef = useRef(onEscape);
    onEscapeRef.current = onEscape;
    const onSerializedChangeRef = useRef(onSerializedChange);
    onSerializedChangeRef.current = onSerializedChange;
    const onTextActivityRef = useRef(onTextActivity);
    onTextActivityRef.current = onTextActivity;

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: false,
                bulletList: false,
                code: false,
                codeBlock: false,
                dropcursor: false,
                gapcursor: false,
                heading: false,
                horizontalRule: false,
                link: false,
                listItem: false,
                listKeymap: false,
                orderedList: false,
                strike: false,
                trailingNode: false,
                underline: false,
            }),
            Placeholder.configure({
                placeholder: () => placeholderRef.current,
            }),
            Greentext,
            CustomEmoji,
        ],
        enableInputRules: false,
        enablePasteRules: false,
        immediatelyRender: false,
        editorProps: {
            // Join copied paragraphs to the text at the cursor instead of
            // inserting a separate block. Internal line breaks and marks stay intact.
            transformPasted: (slice) => Slice.maxOpen(slice.content),
            clipboardTextSerializer: slice => docToMarkers({
                type: 'doc',
                content: slice.content.firstChild?.isInline
                    ? [{type: 'paragraph', content: slice.content.toJSON()}]
                    : slice.content.toJSON(),
            }),
            attributes: {
                role: "textbox",
                "aria-label": "Message",
                "aria-multiline": "true",
                class: cn(
                    // One line matches the 40px action buttons for every font.
                    // Wrapped text and hard breaks grow naturally up to five lines, then scroll.
                    "composer-editor min-h-10 max-h-[5lh] w-full overflow-y-auto rounded-lg border-0",
                    "bg-transparent px-1 py-0 text-base leading-10 lg:px-2 lg:text-sm",
                    "whitespace-pre-wrap [word-break:break-word] outline-none"
                ),
            },
            handleKeyDown: (view, event) => {
                // Enter commits an IME composition before it can submit a message.
                if (view.composing || event.isComposing || event.keyCode === 229) return false;
                if (event.key === "Enter" && !event.shiftKey) {
                    onEnterRef.current();
                    return true;
                }
                if (event.key === "Escape") {
                    return onEscapeRef.current();
                }
                return false;
            },
        },
        onUpdate: ({editor, transaction}) => {
            onSerializedChangeRef.current(
                docToMarkers(editor.getJSON()),
                transaction.getMeta(DICTATION_META) === true
            );
            // Compare content, ignoring marks/selection. Emoji identity still counts as text activity.
            const activityText = (doc: ProseMirrorNode) => doc.textBetween(0, doc.content.size, '\n', node =>
                node.type.name === 'customEmoji' ? `:allchat:${node.attrs.id}:` : '\n');
            const current = activityText(editor.state.doc);
            if (current !== activityText(transaction.before)) onTextActivityRef.current?.(Boolean(current.trim()));
        },
    });

    useEffect(() => {
        if (editor) onReady(editor);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    useEffect(() => {
        editor?.setEditable(editable);
    }, [editor, editable]);

    return (
        <EditorContent
            editor={editor}
            style={style}
            className={cn(
                "chat-composer flex-1 min-w-0",
                !editable && "cursor-not-allowed opacity-50 [&_*]:pointer-events-none"
            )}
        />
    );
};
