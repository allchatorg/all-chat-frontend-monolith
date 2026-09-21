import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
async function loadModule(path, dependencies = {}) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    const {outputText} = ts.transpileModule(source, {
        compilerOptions: {target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
    });
    const module = {exports: {}};
    new Function('require', 'module', 'exports', outputText)(
        name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name), module, module.exports,
    );
    return module.exports;
}

const catalog = await loadModule('../src/features/stickers/catalog.ts');
const markers = await loadModule('../src/features/chatroom/utils/messageMarkers.ts');
const {getMessagePreview} = await loadModule('../src/features/chatroom/utils/messagePreview.ts', {
    './messageMarkers': markers,
    '@/features/stickers/catalog': catalog,
});
const reducers = await loadModule('../src/redux/messages/messageReducers.ts');
const {StickerMessage} = await loadModule('../src/features/stickers/StickerMessage.tsx', {'./catalog': catalog});
let staffViewer = false;
const roleAccess = {useRoleAccess: () => ({isPrincipal: () => true, isStaffMember: () => staffViewer})};
const {default: ReplyPreview} = await loadModule('../src/features/chatroom/components/ReplyPreview.tsx', {
    '@/features/stickers/catalog': catalog,
    '@/features/chatroom/utils/messageMarkers': markers,
    '@/features/pro/useProDialog': {useProDialog: () => () => {}},
    '@/lib/hooks/useRoleAccess': roleAccess,
    '@/lib/utils': {cn: (...classes) => classes.filter(Boolean).join(' ')},
    '@/components/UserName': {UserName: ({username}) => React.createElement('span', null, username)},
});

// Exercise the common room/private/search/history renderer with inert app providers.
const {default: MessageItem} = await loadModule('../src/features/chatroom/components/MessageItem.tsx', {
    'react-redux': {useDispatch: () => () => {}},
    '@/features/chatroom/components/ChatUserName': {ChatUserName: () => null},
    '@/redux/settings/settingsSlice': {setActiveRightSidebar: () => ({type: 'test'})},
    '@/features/chatroom/components/VideoLinkPreview': {VideoLinkPreview: () => null},
    '@/features/chatroom/components/FormattedMessageText': {FormattedMessageText: ({text}) => text},
    '@/features/chatroom/utils/messageMarkers': markers,
    '@/features/chatroom/utils/messageTextColor': {getMessageTextColor: () => '#fff'},
    '@/lib/hooks/useAttachmentHook': {useAttachmentHook: () => ({unblurredAttachments: new Set()})},
    '@/lib/utils/urlThumbnailExtractionUtils': {isSupportedVideoPlatform: () => false},
    '@/features/chatroom/components/RestrictedContentBox': {RestrictedContentBox: () => null},
    '@/features/chatroom/components/AttachmentBox': {default: () => null},
    '@/components/providers/MediaOverlayProvider': {useMediaOverlay: () => ({})},
    '@/lib/utils': {removeDuplicateStrings: values => [...new Set(values)]},
    '@/lib/hooks/useTimeFormatSetting': {useFormatMessageDate: () => ({formatMessageDate: () => '12:00'})},
    '@/features/chatroom/components/EditHistoryButton': {EditHistoryButton: () => 'Edit history'},
    '@/lib/hooks/useIsMobile': {useIsMobile: () => false},
    '@/features/chatroom/components/ReactionButton': {ReactionButton: ({reaction}) => `Reaction ${reaction.emoji}`},
    '@/lib/hooks/useRoleAccess': roleAccess,
    '@/features/stickers/StickerMessage': {StickerMessage},
});

const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
const stickerMessage = {
    id: 10, content: '', stickerId: 'pepe', createdAt: '2026-09-21T10:00:00Z',
    senderId: 1, senderUsername: 'Alice', chatRoomId: 3, chatRoomName: 'general',
    color: '#222', deleted: false, attachments: [], reactions: [],
};
const replyTo = {id: 10, senderId: 1, senderUsername: 'Alice', content: '',
    stickerId: 'pepe', deleted: false, hasAttachment: false};

test('only exact short catalog IDs resolve standalone stickers', () => {
    for (const sticker of catalog.PRO_REACTIONS) {
        assert.equal(catalog.getSticker(sticker.id), sticker);
        assert.equal(catalog.getStickerLabel(sticker.id), `${sticker.name} sticker`);
    }
    for (const id of [undefined, null, '', 'Pepe', ' pepe', 'pepe ', 'allchat:pepe', 'chad_1',
        '../pepe', '__proto__', '/stickers/pro/pepe.png', 'https://example.com/pepe.png']) {
        assert.equal(catalog.getSticker(id), undefined, String(id));
        assert.equal(catalog.getStickerLabel(id), 'Unavailable sticker');
    }
});

test('sticker artwork has a readable label and no arbitrary URL can become its source', () => {
    const known = render(StickerMessage, {stickerId: 'pepe'});
    assert.match(known, /src="\/stickers\/pro\/pepe.png"/);
    assert.match(known, /alt="Pepe sticker"/);
    assert.match(known, /width="160"/);
    const unknown = render(StickerMessage, {stickerId: 'https://example.com/secret.png'});
    assert.match(unknown, /Unavailable sticker/);
    assert.doesNotMatch(unknown, /<img|example.com/);
    const deleted = render(StickerMessage, {stickerId: 'pepe', deleted: true});
    assert.match(deleted, /Message removed/);
    assert.doesNotMatch(deleted, /<img|Pepe|pepe.png/);
});

test('conversation previews label known, unknown, ordinary, deleted, and redacted messages', () => {
    assert.equal(getMessagePreview(stickerMessage), 'Pepe sticker');
    assert.equal(getMessagePreview({...stickerMessage, stickerId: 'invalid'}), 'Unavailable sticker');
    assert.equal(getMessagePreview({...stickerMessage, deleted: true}), 'Message deleted');
    assert.equal(getMessagePreview({...stickerMessage, content: null}), 'Message deleted');
    assert.equal(getMessagePreview({content: '**hello**'}), 'hello');
    assert.equal(getMessagePreview({content: '', attachments: [{}]}), 'Attachment');
    assert.equal(getMessagePreview(null, 'No messages'), 'No messages');
});

test('room, private, search, and history message bodies show stickers and keep reaction summaries', () => {
    for (const viewMode of ['chat', 'search']) {
        const markup = render(MessageItem, {message: {...stickerMessage, reactions: [{emoji: '👍'}]},
            viewMode, handleMessageClick: () => {}, showReactions: true});
        assert.match(markup, /alt="Pepe sticker"/);
        assert.match(markup, /Reaction 👍/);
        assert.doesNotMatch(markup, /Edit history/);
        const unknown = render(MessageItem, {message: {...stickerMessage, stickerId: 'invalid'},
            viewMode, handleMessageClick: () => {}});
        assert.match(unknown, /Unavailable sticker/);
        assert.doesNotMatch(unknown, /<img/);
    }
});

test('regular viewers never see deleted or redacted sticker artwork in either renderer', () => {
    for (const viewMode of ['chat', 'search']) {
        for (const patch of [{deleted: true}, {deleted: true, stickerId: null}, {content: null}]) {
            const markup = render(MessageItem, {message: {...stickerMessage, ...patch},
                viewMode, handleMessageClick: () => {}});
            assert.match(markup, /Message removed/);
            assert.doesNotMatch(markup, /<img|Pepe sticker|pepe.png/);
        }
    }
});

test('reply previews show readable sticker names and conceal deleted or redacted originals', () => {
    assert.match(render(ReplyPreview, {replyTo}), /Pepe sticker/);
    assert.match(render(ReplyPreview, {replyTo: {...replyTo, stickerId: 'invalid'}}), /Unavailable sticker/);
    for (const patch of [{content: null}, {deleted: true}]) {
        const markup = render(ReplyPreview, {replyTo: {...replyTo, ...patch}, onJump: () => {}});
        assert.match(markup, /Message removed/);
        assert.doesNotMatch(markup, /Pepe|Jump to replied message/);
    }
});

test('authorized staff can review retained deleted stickers, while redaction always conceals them', () => {
    staffViewer = true;
    try {
        for (const viewMode of ['chat', 'search']) {
            const markup = render(MessageItem, {message: {...stickerMessage, deleted: true},
                viewMode, handleMessageClick: () => {}});
            assert.match(markup, /Pepe sticker/);
            const redacted = render(MessageItem, {message: {...stickerMessage, deleted: true, content: null},
                viewMode, handleMessageClick: () => {}});
            assert.doesNotMatch(redacted, /<img|Pepe sticker/);
        }
        assert.match(render(ReplyPreview, {replyTo: {...replyTo, deleted: true}}), /Pepe sticker/);
        assert.doesNotMatch(render(ReplyPreview, {replyTo: {...replyTo, deleted: true, content: null}}), /Pepe sticker/);
    } finally {
        staffViewer = false;
    }
});

test('live reply updates carry sticker metadata and redaction cannot be undone by a late edit', () => {
    const reply = {...stickerMessage, id: 20, stickerId: null, content: 'A reply', replyTo};
    const [updated] = reducers.patchReplyPreviewsForEditedMessage([reply], {...stickerMessage, stickerId: 'gondola'});
    assert.equal(updated.replyTo.stickerId, 'gondola');
    assert.equal(reply.replyTo.stickerId, 'pepe');
    const [deleted] = reducers.patchReplyPreviewsForDeletedMessage([updated], 10, false);
    assert.equal(deleted.replyTo.content, null);
    assert.equal(deleted.replyTo.stickerId, null);
    assert.equal(reducers.patchReplyPreviewsForEditedMessage([deleted], stickerMessage)[0], deleted);
    const [retained] = reducers.patchReplyPreviewsForDeletedMessage([reply], 10, true);
    const markup = render(ReplyPreview, {replyTo: retained.replyTo});
    assert.match(markup, /Message removed/);
    assert.doesNotMatch(markup, /Pepe/);
});
