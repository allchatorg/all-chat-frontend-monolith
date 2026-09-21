import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import test from 'node:test';
import {inflateSync} from 'node:zlib';
import {createAsyncThunk} from '@reduxjs/toolkit';
import ts from 'typescript';

// Exercise the production helpers/reducer with Node, without loading the application or a browser.
const require = createRequire(import.meta.url);
async function loadModule(path, dependencies = {}) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    const {outputText} = ts.transpileModule(source, {
        compilerOptions: {target: ts.ScriptTarget.ES2021, module: ts.ModuleKind.CommonJS},
    });
    const module = {exports: {}};
    new Function('require', 'module', 'exports', outputText)(
        name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name), module, module.exports,
    );
    return module.exports;
}

const {PRO_REACTIONS, getCustomReaction, getReactionLabel, isCustomReactionToken, toCustomReactionToken} =
    await loadModule('../src/features/stickers/catalog.ts');
const messageReducers = await loadModule('../src/redux/messages/messageReducers.ts');
const {addReactionRequestToMessage, removeReactionRequestFromMessage, addChatRoomReaction,
    removeChatRoomReaction, patchReplyPreviewsForEditedMessage, patchReplyPreviewsForDeletedMessage} = messageReducers;
// Reducer tests only require lifecycle actions. No network thunk body is executed.
const thunks = Object.fromEntries(['createChatRoomThunk', 'fetchJoinedUserChatRoomsThunk',
    'fetchMessageReactionDetailsThunk', 'joinChatRoomThunk', 'leaveChatRoomThunk']
    .map(name => [name, createAsyncThunk(`test/${name}`, async () => undefined)]));
const {default: uiReducer, setMessageReactions, setSelectedReaction, updateOpenMessageReactions,
    resetChatRoomUiStateOnRoomChange} = await loadModule('../src/redux/chatRoom/chatRoomUiSlice.ts', {
    '@/redux/messages/messageReducers': messageReducers,
    '@/redux/chatRoom/chatRoomThunk': thunks,
});

// Decode RGBA scanlines to verify actual transparent pixels, rather than only an alpha-capable header.
function pngAlphaRange(png) {
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    assert.equal(width, 320);
    assert.equal(height, 320);
    assert.equal(png[24], 8);
    assert.equal(png[25], 6);
    assert.equal(png[28], 0);
    const chunks = [];
    for (let offset = 8; offset < png.length;) {
        const length = png.readUInt32BE(offset);
        if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + length));
        offset += length + 12;
    }
    const rows = inflateSync(Buffer.concat(chunks)), stride = width * 4;
    let previous = Buffer.alloc(stride), cursor = 0, min = 255, max = 0;
    for (let y = 0; y < height; y++) {
        const filter = rows[cursor++], current = Buffer.alloc(stride);
        assert.ok(filter <= 4);
        for (let x = 0; x < stride; x++) {
            const left = x >= 4 ? current[x - 4] : 0, up = previous[x], diagonal = x >= 4 ? previous[x - 4] : 0;
            const prediction = left + up - diagonal;
            const paeth = Math.abs(prediction - left) <= Math.abs(prediction - up) && Math.abs(prediction - left) <= Math.abs(prediction - diagonal)
                ? left : Math.abs(prediction - up) <= Math.abs(prediction - diagonal) ? up : diagonal;
            const correction = [0, left, up, Math.floor((left + up) / 2), paeth][filter];
            current[x] = (rows[cursor++] + correction) & 255;
            if (x % 4 === 3) { min = Math.min(min, current[x]); max = Math.max(max, current[x]); }
        }
        previous = current;
    }
    return {min, max};
}

test('all 17 canonical character identities resolve to visible local artwork with transparency', async () => {
    assert.deepEqual(PRO_REACTIONS.map(reaction => reaction.id), ['wojak', 'soyjak', 'chud', 'chad-1', 'chad-2',
        'virgin', 'doomer', 'coomer', 'bloomer', 'zoomer', 'npc', 'grug', 'pepe', 'apu-apustaja', 'honkler', 'spurdo', 'gondola']);
    for (const reaction of PRO_REACTIONS) {
        const token = toCustomReactionToken(reaction.id);
        assert.equal(token, `allchat:${reaction.id}`);
        assert.equal(getCustomReaction(token), reaction);
        assert.equal(isCustomReactionToken(token), true);
        assert.equal(getReactionLabel(token, token), reaction.name);
        assert.equal(reaction.src, `/stickers/pro/${reaction.id}.png`);
        assert.deepEqual(pngAlphaRange(await readFile(new URL(`../public${reaction.src}`, import.meta.url))), {min: 0, max: 255});
    }
});

test('aliases, paths, URLs, unknown identities, and noncanonical casing cannot resolve artwork', () => {
    for (const input of [undefined, null, '', 'pepe', 'chad_1', 'allchat:chad_1', 'allchat:unknown', 'allchat:Pepe',
        'ALLCHAT:pepe', ' allchat:pepe', 'allchat:pepe ', 'allchat:%70epe', 'allchat:../pepe', '__proto__',
        '/stickers/pro/pepe.png', 'https://example.com/pepe.png', 'allchat:https://example.com/pepe.png']) {
        assert.equal(getCustomReaction(input), undefined, String(input));
    }
    assert.equal(isCustomReactionToken('allchat:unknown'), true);
    assert.equal(getReactionLabel('allchat:unknown', 'allchat:unknown'), 'Unavailable reaction');
});

test('ordinary emoji retain their native identities and readable labels', () => {
    for (const emoji of ['👍', '😂', '❤️', '👩🏽‍💻']) {
        assert.equal(getCustomReaction(emoji), undefined);
        assert.equal(isCustomReactionToken(emoji), false);
        assert.equal(getReactionLabel(emoji), emoji);
    }
    assert.equal(getReactionLabel('👍', '+1'), '+1');
    assert.equal(getReactionLabel('😂', 'joy'), 'joy');
    assert.equal(getReactionLabel('👍', 'allchat:unknown'), 'Unavailable reaction');
});

const token = 'allchat:pepe';
const alice = {id: 1, username: 'Alice'}, bob = {id: 2, username: 'Bob'};
const reaction = (overrides = {}) => ({id: 40, messageId: 10, emoji: token, emojiId: token,
    usersCount: 1, reactedByCurrentUser: true, users: [alice], ...overrides});
const event = (overrides = {}) => ({reactionId: 40, chatroomId: 3, messageId: 10, responseType: 'ADD',
    emoji: token, emojiId: token, reactedBy: bob, ...overrides});
const message = (reactions = [reaction()]) => ({id: 10, content: 'Hello', reactions});

test('another user adding a custom reaction preserves the current user selection and increments the count', () => {
    const original = message();
    const updated = addReactionRequestToMessage(original, event(), false);
    assert.equal(updated.reactions[0].usersCount, 2);
    assert.equal(updated.reactions[0].reactedByCurrentUser, true);
    assert.deepEqual(updated.reactions[0].users.map(user => user.id), [1, 2]);
    assert.equal(original.reactions[0].usersCount, 1);
});

test('another user removing a reaction preserves selection even when the current user is absent from the limited preview', () => {
    const updated = removeReactionRequestFromMessage(message([reaction({usersCount: 4, users: [bob]})]), event({responseType: 'REMOVE'}), false);
    assert.equal(updated.reactions[0].usersCount, 3);
    assert.equal(updated.reactions[0].reactedByCurrentUser, true);
    assert.deepEqual(updated.reactions[0].users, []);
});

test('own removal clears selection without requiring a users preview', () => {
    const updated = removeReactionRequestFromMessage(message([reaction({usersCount: 2, users: undefined})]), event({responseType: 'REMOVE', reactedBy: alice}), true);
    assert.equal(updated.reactions[0].usersCount, 1);
    assert.equal(updated.reactions[0].reactedByCurrentUser, false);
    assert.deepEqual(updated.reactions[0].users, []);
});

test('removing the final member removes the reaction and removing an absent identity is harmless', () => {
    const updated = removeReactionRequestFromMessage(message(), event({responseType: 'REMOVE', reactedBy: alice}), true);
    assert.deepEqual(updated.reactions, []);
    assert.equal(removeReactionRequestFromMessage(updated, event({responseType: 'REMOVE'}), false), updated);
});

test('duplicate delivery of a known member or an already-selected own add does not inflate counts', () => {
    const original = message();
    const added = addReactionRequestToMessage(original, event(), false);
    assert.equal(addReactionRequestToMessage(added, event(), false), added);
    const summary = message([reaction({users: undefined})]);
    assert.equal(addReactionRequestToMessage(summary, event({reactedBy: alice}), true), summary);
});

test('custom and Unicode reactions coexist and changes target only the matching identity', () => {
    const thumbsUp = reaction({id: 50, emoji: '👍', emojiId: '+1', usersCount: 5, reactedByCurrentUser: false, users: undefined});
    const added = addReactionRequestToMessage(message([thumbsUp]), event({reactedBy: alice}), true);
    assert.equal(added.reactions[0], thumbsUp);
    assert.equal(added.reactions[1].emoji, token);
    assert.equal(added.reactions[1].emojiId, token);
    assert.equal(added.reactions[1].usersCount, 1);
    assert.equal(added.reactions[1].reactedByCurrentUser, true);
    assert.deepEqual(added.reactions[1].users.map(user => user.id), [1]);
    const removed = removeReactionRequestFromMessage(added, event({reactedBy: alice, responseType: 'REMOVE'}), true);
    assert.deepEqual(removed.reactions, [thumbsUp]);
});

test('room routing ignores mismatched rooms and messages and updates only the addressed message', () => {
    const otherMessage = {...message(), id: 11}, room = {id: 3, messages: [message(), otherMessage]};
    assert.equal(addChatRoomReaction(room, event({chatroomId: 4}), false), room);
    assert.equal(removeChatRoomReaction(room, event({chatroomId: 4}), false), room);
    assert.deepEqual(addChatRoomReaction(room, event({messageId: 999}), false), room);
    assert.deepEqual(removeChatRoomReaction(room, event({messageId: 999}), false), room);
    const added = addChatRoomReaction(room, event(), false);
    assert.equal(added.messages[0].reactions[0].usersCount, 2);
    assert.equal(added.messages[1], otherMessage);
    assert.equal(removeChatRoomReaction(added, event({responseType: 'REMOVE'}), false).messages[0].reactions[0].usersCount, 1);
});

function selectedState(selected = reaction()) {
    let state = uiReducer(undefined, {type: 'test/init'});
    state = uiReducer(state, setMessageReactions([selected]));
    return uiReducer(state, setSelectedReaction(selected));
}
const details = thunks.fetchMessageReactionDetailsThunk;

test('reaction details ignore stale requests and preserve own selection from the current summary', () => {
    let state = selectedState();
    state = uiReducer(state, details.pending('old', {messageId: 10, emoji: token}));
    state = uiReducer(state, details.pending('new', {messageId: 10, emoji: token}));
    const stale = reaction({usersCount: 90});
    state = uiReducer(state, details.fulfilled(stale, 'old', {messageId: 10, emoji: token}));
    assert.equal(state.messageReactionsState.selectedReaction.usersCount, 1);
    state = uiReducer(state, details.fulfilled(reaction({reactedByCurrentUser: false}), 'new', {messageId: 10, emoji: token}));
    assert.equal(state.messageReactionsState.selectedReaction.reactedByCurrentUser, true);
});

test('a live membership change invalidates an older details snapshot and allows a refreshed snapshot', () => {
    let state = selectedState();
    state = uiReducer(state, details.pending('before-event', {messageId: 10, emoji: token}));
    state = uiReducer(state, updateOpenMessageReactions({reactionRequest: event(), reactedByCurrentUser: false}));
    assert.equal(state.messageReactionsState.detailsRevision, 1);
    state = uiReducer(state, details.fulfilled(reaction(), 'before-event', {messageId: 10, emoji: token}));
    assert.equal(state.messageReactionsState.selectedReaction.usersCount, 2);
    assert.deepEqual(state.messageReactionsState.selectedReaction.users.map(user => user.id), [1, 2]);
    state = uiReducer(state, details.pending('after-event', {messageId: 10, emoji: token}));
    const refreshed = reaction({usersCount: 2, users: [alice, bob], reactedByCurrentUser: false});
    state = uiReducer(state, details.fulfilled(refreshed, 'after-event', {messageId: 10, emoji: token}));
    assert.equal(state.messageReactionsState.selectedReaction.usersCount, 2);
    assert.equal(state.messageReactionsState.selectedReaction.reactedByCurrentUser, true);
    assert.deepEqual(state.messageReactionsState.selectedReaction.users, [alice, bob]);
});

test('changing selection or room prevents in-flight details from replacing the newly selected reaction', () => {
    let state = selectedState();
    state = uiReducer(state, details.pending('first', {messageId: 10, emoji: token}));
    const nextReaction = reaction({emoji: '👍', emojiId: '+1'});
    state = uiReducer(state, setSelectedReaction(nextReaction));
    state = uiReducer(state, details.fulfilled(reaction(), 'first', {messageId: 10, emoji: token}));
    assert.equal(state.messageReactionsState.selectedReaction.emoji, '👍');
    state = uiReducer(state, resetChatRoomUiStateOnRoomChange());
    state = uiReducer(state, details.fulfilled(reaction(), 'first', {messageId: 10, emoji: token}));
    assert.equal(state.messageReactionsState, null);
});

test('the open reacting-users panel receives live membership, counts, and final removal', () => {
    let state = selectedState();
    state = uiReducer(state, updateOpenMessageReactions({reactionRequest: event(), reactedByCurrentUser: false}));
    assert.equal(state.messageReactionsState.selectedReaction.usersCount, 2);
    assert.equal(state.messageReactionsState.messageReactions[0].usersCount, 2);
    assert.deepEqual(state.messageReactionsState.selectedReaction.users.map(user => user.id), [1, 2]);
    const unrelated = uiReducer(state, updateOpenMessageReactions({reactionRequest: event({messageId: 999}), reactedByCurrentUser: false}));
    assert.equal(unrelated, state);
    state = uiReducer(state, updateOpenMessageReactions({reactionRequest: event({responseType: 'REMOVE'}), reactedByCurrentUser: false}));
    assert.equal(state.messageReactionsState.selectedReaction.reactedByCurrentUser, true);
    state = uiReducer(state, updateOpenMessageReactions({reactionRequest: event({responseType: 'REMOVE', reactedBy: alice}), reactedByCurrentUser: true}));
    assert.equal(state.messageReactionsState.selectedReaction.usersCount, 0);
    assert.equal(state.messageReactionsState.selectedReaction.reactedByCurrentUser, false);
    assert.deepEqual(state.messageReactionsState.selectedReaction.users, []);
    assert.deepEqual(state.messageReactionsState.messageReactions, []);
});

const reply = {id: 20, content: 'A reply', replyTo: {id: 10, content: 'old caption', deleted: false,
    hasAttachment: true, attachmentName: 'before.png'}};

test('ordinary reply edits refresh text and attachments without introducing sticker fields', () => {
    const [updated] = patchReplyPreviewsForEditedMessage([reply], {id: 10, content: 'edited', attachments: []});
    assert.equal(updated.replyTo.content, 'edited');
    assert.equal(updated.replyTo.hasAttachment, false);
    assert.equal(updated.replyTo.attachmentName, null);
    assert.equal(Object.hasOwn(updated.replyTo, 'stickerId'), false);
    assert.equal(reply.replyTo.content, 'old caption');
    const [withAttachment] = patchReplyPreviewsForEditedMessage([updated], {id: 10, content: 'new caption', attachments: [{name: 'after.png'}]});
    assert.equal(withAttachment.replyTo.hasAttachment, true);
    assert.equal(withAttachment.replyTo.attachmentName, 'after.png');
});

test('deleted reply previews stay hidden after later edits and staff retain text', () => {
    const [removed] = patchReplyPreviewsForDeletedMessage([reply], 10, false);
    assert.equal(removed.replyTo.deleted, true);
    assert.equal(removed.replyTo.content, null);
    assert.equal(patchReplyPreviewsForEditedMessage([removed], {id: 10, content: 'later', attachments: []})[0], removed);
    const [retained] = patchReplyPreviewsForDeletedMessage([reply], 10, true);
    assert.equal(retained.replyTo.deleted, true);
    assert.equal(retained.replyTo.content, 'old caption');
    assert.equal(patchReplyPreviewsForDeletedMessage([reply], 99, false)[0], reply);
    assert.equal(patchReplyPreviewsForEditedMessage([reply], {id: 99, content: 'unrelated', attachments: []})[0], reply);
});


test('hovering another message clears old details and live events cannot contaminate its reaction list', () => {
    let state = selectedState();
    state = uiReducer(state, details.pending('previous-message', {messageId: 10, emoji: token}));
    const nextMessageReaction = reaction({messageId: 20});
    state = uiReducer(state, setMessageReactions([nextMessageReaction]));
    assert.equal(state.messageReactionsState.selectedReaction, undefined);
    state = uiReducer(state, details.fulfilled(reaction(), 'previous-message', {messageId: 10, emoji: token}));
    assert.equal(state.messageReactionsState.selectedReaction, undefined);
    state = uiReducer(state, updateOpenMessageReactions({reactionRequest: event(), reactedByCurrentUser: false}));
    assert.equal(state.messageReactionsState.messageReactions[0].usersCount, 1);
    state = uiReducer(state, updateOpenMessageReactions({reactionRequest: event({messageId: 20}), reactedByCurrentUser: false}));
    assert.equal(state.messageReactionsState.messageReactions[0].usersCount, 2);
});
