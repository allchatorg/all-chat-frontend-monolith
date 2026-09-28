const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const modules = new Map();
let lookup = async () => ({data: []});

// Compile the real pure TypeScript modules without requiring a browser or a new runner.
function loadSource(filename) {
    filename = path.resolve(filename);
    if (modules.has(filename)) return modules.get(filename).exports;
    const compiled = new Module(filename, module);
    modules.set(filename, compiled);
    compiled.filename = filename;
    compiled.paths = module.paths;
    compiled.require = name => {
        if (name === '@/lib/api') return {post: (...args) => lookup(...args)};
        if (name.startsWith('@/')) return loadSource(path.join(root, 'src', name.slice(2)) + '.ts');
        if (name.startsWith('.')) return loadSource(path.resolve(path.dirname(filename), name) + '.ts');
        return require(name);
    };
    compiled._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true},
    }).outputText, filename);
    return compiled.exports;
}

const presets = loadSource(path.join(root, 'src/lib/fontPresets.ts'));
const fonts = loadSource(path.join(root, 'src/lib/fontStore.ts'));
const badges = loadSource(path.join(root, 'src/lib/proBadgeStore.ts'));
const custom = (fontRevision = 1) => ({usernameFont: 'INTER', messageFont: 'OPEN_SANS', fontRevision});
const defaults = fontRevision => ({usernameFont: 'DEFAULT', messageFont: 'DEFAULT', fontRevision});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

test.beforeEach(() => {
    badges.clearProBadgeStore();
    lookup = async () => ({data: []});
});

test('preset CSS only selects bundled fonts and leaves default typography inherited', () => {
    assert.match(presets.fontPresetStyle('INTER').fontFamily, /--font-pro-inter/);
    assert.match(presets.fontPresetStyle('OPEN_SANS').fontFamily, /--font-pro-open-sans/);
    for (const invalid of ['DEFAULT', undefined, null, 'url(https://example.com/font)', {}, 'COMIC_SANS']) {
        assert.deepEqual(presets.fontPresetStyle(invalid), {});
    }
});

test('new author data repaints every mounted earlier message for that author only', () => {
    let first = 0, second = 0, other = 0;
    const unsubscribe = [fonts.subscribeFonts(7, () => first++), fonts.subscribeFonts(7, () => second++),
        fonts.subscribeFonts(8, () => other++)];
    fonts.applyFontUpdate({userId: 7, ...custom()});
    assert.deepEqual([first, second, other], [1, 1, 0]);
    assert.deepEqual(fonts.getFontSnapshot(7), custom());
    unsubscribe.forEach(fn => fn());
    fonts.applyFontUpdate({userId: 7, ...custom(2)});
    assert.deepEqual([first, second, other], [1, 1, 0]);
});

test('older and duplicate responses preserve the latest snapshot and its reference', () => {
    fonts.applyFontUpdate({userId: 7, ...custom(5)});
    const latest = fonts.getFontSnapshot(7);
    fonts.applyFontUpdate({userId: 7, ...defaults(4)});
    fonts.applyFontUpdate({userId: 7, ...custom(5)});
    assert.equal(fonts.getFontSnapshot(7), latest);
});

test('expiry wins at equal revision and a stale active response cannot restore custom fonts', () => {
    fonts.applyFontUpdate({userId: 7, ...custom(5)});
    fonts.applyFontUpdate({userId: 7, ...defaults(5)});
    fonts.applyFontUpdate({userId: 7, ...custom(5)});
    assert.deepEqual(fonts.getFontSnapshot(7), defaults(5));
    fonts.applyFontUpdate({userId: 7, ...custom(6)});
    assert.deepEqual(fonts.getFontSnapshot(7), custom(6));
});

test('missing legacy fields and malformed snapshots never overwrite a valid selection', () => {
    fonts.applyFontUpdate({userId: 7, ...custom(5)});
    for (const update of [
        {userId: 7}, {userId: 7, fontRevision: 6}, {userId: 7, usernameFont: 'DEFAULT', fontRevision: 6},
        {userId: 7, ...custom(6), messageFont: 'arbitrary CSS'}, {userId: 7, ...custom(-1)},
        {userId: 7, ...custom(Number.MAX_SAFE_INTEGER + 1)}, {userId: 0, ...custom(8)},
    ]) fonts.applyFontUpdate(update);
    assert.deepEqual(fonts.getFontSnapshot(7), custom(5));
    assert.equal(fonts.getFontSnapshot(0), undefined);
});

test('owner font merging is independent from badge revision and preserves new account fields', () => {
    const current = {...custom(5), proBadgeRevision: 1, username: 'before'};
    const result = presets.mergeOwnerFonts(current, {...defaults(3), proBadgeRevision: 9, username: 'after'});
    assert.deepEqual(result, {...custom(5), proBadgeRevision: 9, username: 'after'});
    assert.deepEqual(presets.mergeOwnerFonts(current, {username: 'legacy'}), {...custom(5), username: 'legacy'});
});

test('HTTP or socket DTO ingestion finds unmounted messages, replies, users and reactions', () => {
    fonts.ingestFontSnapshots({content: [{id: 1, senderId: 7, senderUsernameFont: 'INTER',
        senderMessageFont: 'OPEN_SANS', senderFontRevision: 4,
        replyTo: {id: 2, senderId: 8, senderUsernameFont: 'OPEN_SANS', senderMessageFont: 'DEFAULT', senderFontRevision: 2},
        reactions: [{users: [{id: 9, username: 'reader', ...custom(3)}]}]}]});
    assert.deepEqual(fonts.getFontSnapshot(7), custom(4));
    assert.deepEqual(fonts.getFontSnapshot(8), {usernameFont: 'OPEN_SANS', messageFont: 'DEFAULT', fontRevision: 2});
    assert.deepEqual(fonts.getFontSnapshot(9), custom(3));
});

test('clearing a session clears all fonts and ignores its delayed HTTP responses', () => {
    fonts.applyFontUpdate({userId: 7, ...custom(5)});
    const oldSession = fonts.getFontStoreGeneration();
    badges.clearProBadgeStore();
    fonts.ingestFontSnapshots([{userId: 7, ...custom(8)}], oldSession);
    assert.equal(fonts.getFontSnapshot(7), undefined);
    fonts.ingestFontSnapshots([{userId: 7, ...custom(9)}]);
    assert.deepEqual(fonts.getFontSnapshot(7), custom(9));
});

test('duplicate badge revision still ingests a newer independent font revision', () => {
    badges.applyProBadgeUpdate({userId: 7, proBadgeVisible: false, proBadgeRevision: 9, ...custom(1)});
    badges.applyProBadgeUpdate({userId: 7, proBadgeVisible: false, proBadgeRevision: 9, ...custom(2)});
    assert.deepEqual(fonts.getFontSnapshot(7), custom(2));
    assert.equal(badges.getProBadge(7).proBadgeVisible, false);
});

test('cold identity views share batched lookup and reconnect refresh repairs missed updates', async () => {
    let revision = 1;
    const batches = [];
    lookup = async (url, ids) => {
        assert.equal(url, '/pro/badges');
        batches.push(ids);
        return {data: ids.map(userId => ({userId, proBadgeVisible: false, proBadgeRevision: 0, ...custom(revision)}))};
    };
    const unregister = [badges.subscribeProBadge(7, () => {}), badges.subscribeProBadge(8, () => {})];
    await pause(80);
    assert.deepEqual(batches, [[7, 8]]);
    assert.deepEqual(fonts.getFontSnapshot(7), custom(1));
    revision = 4;
    badges.refreshRegisteredProBadges();
    await pause(80);
    assert.deepEqual(fonts.getFontSnapshot(7), custom(4));
    assert.deepEqual(fonts.getFontSnapshot(8), custom(4));
    unregister.forEach(fn => fn());
});

test('an outstanding batch lookup cannot refill the cache after an account switch', async () => {
    let resolveLookup;
    lookup = () => new Promise(resolve => {resolveLookup = resolve;});
    const unregister = badges.subscribeProBadge(7, () => {});
    await pause(80);
    badges.clearProBadgeStore();
    resolveLookup({data: [{userId: 7, proBadgeVisible: true, proBadgeRevision: 3, ...custom(3)}]});
    await pause(0);
    assert.equal(fonts.getFontSnapshot(7), undefined);
    unregister();
});
