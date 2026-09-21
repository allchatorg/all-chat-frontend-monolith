import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Run the pure TypeScript helpers with Node's test runner, without a browser.
async function loadModule(path) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    const {outputText} = ts.transpileModule(source, {
        compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020},
    });
    return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const {PRO_STICKERS, getStickerById} = await loadModule('../src/features/stickers/catalog.ts');
const {patchReplyPreviewsForEditedMessage, patchReplyPreviewsForDeletedMessage} =
    await loadModule('../src/redux/messages/messageReducers.ts');

test('the full pack resolves to local PNG assets without accepting paths or URLs', async () => {
    const expectedIds = ['wojak', 'soyjak', 'chud', 'chad-1', 'chad-2', 'virgin', 'doomer',
        'coomer', 'bloomer', 'zoomer', 'npc', 'grug', 'pepe', 'apu-apustaja', 'honkler', 'spurdo', 'gondola'];
    assert.deepEqual(PRO_STICKERS.map(sticker => sticker.id), expectedIds);
    for (const sticker of PRO_STICKERS) {
        assert.equal(getStickerById(sticker.id), sticker);
        assert.equal(sticker.src, `/stickers/pro/${sticker.id}.png`);
        const png = await readFile(new URL(`../public${sticker.src}`, import.meta.url));
        assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        // True-color alpha or grayscale alpha; palette output must include tRNS.
        const colorType = png[25];
        assert.ok([4, 6].includes(colorType) || (colorType === 3 && png.includes(Buffer.from('tRNS'))),
            `${sticker.id} must support transparency`);
    }
    for (const input of [undefined, null, '', '__proto__', '../pepe', 'https://example.com/sticker.png']) {
        assert.equal(getStickerById(input), undefined);
    }
});

const reply = {
    id: 20,
    content: 'A reply',
    replyTo: {id: 10, content: 'old caption', stickerId: 'pepe', deleted: false, hasAttachment: true},
};

test('caption edits keep the sticker in reply previews and remove stale attachments', () => {
    const edited = {id: 10, content: '', stickerId: 'pepe', attachments: []};
    const [updated] = patchReplyPreviewsForEditedMessage([reply], edited);
    assert.equal(updated.replyTo.content, '');
    assert.equal(updated.replyTo.stickerId, 'pepe');
    assert.equal(updated.replyTo.hasAttachment, false);
    assert.equal(updated.replyTo.attachmentName, null);
    assert.equal(reply.replyTo.content, 'old caption');
});

test('deleting a parent hides its sticker from regular viewers immediately', () => {
    const [updated] = patchReplyPreviewsForDeletedMessage([reply], 10, false);
    assert.equal(updated.replyTo.deleted, true);
    assert.equal(updated.replyTo.content, null);
    assert.equal(updated.replyTo.stickerId, null);
    const [afterEdit] = patchReplyPreviewsForEditedMessage([updated], {
        id: 10, content: 'later edit', stickerId: 'wojak', attachments: [],
    });
    assert.equal(afterEdit.replyTo.content, null);
    assert.equal(afterEdit.replyTo.stickerId, null);
});

test('staff can retain a deleted parent sticker and unrelated replies are untouched', () => {
    const [updated] = patchReplyPreviewsForDeletedMessage([reply], 10, true);
    assert.equal(updated.replyTo.deleted, true);
    assert.equal(updated.replyTo.stickerId, 'pepe');
    assert.equal(patchReplyPreviewsForDeletedMessage([reply], 99, false)[0], reply);
});
