import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
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

const utils = {cn: (...values) => twMerge(clsx(values))};
const catalog = await loadModule('../src/features/stickers/catalog.ts');
const tabs = await loadModule('../src/components/ui/tabs.tsx', {'@/lib/utils': utils});
const button = await loadModule('../src/components/ui/button.tsx', {'@/lib/utils': utils});
const customEmoji = await loadModule('../src/features/stickers/customEmoji.ts', {'./catalog': catalog});
const shortcodes = await loadModule('../src/features/stickers/emojiShortcodes.ts', {'./customEmoji': customEmoji});
const {EmojiBrowser} = await loadModule('../src/features/stickers/EmojiBrowser.tsx', {
    '@/lib/utils': utils,
    '@/components/ui/button': button,
    './catalog': catalog,
    './emojiShortcodes': shortcodes,
});
let emojiTree;
function CaptureEmojiBrowser(props) {
    emojiTree = EmojiBrowser(props);
    return emojiTree;
}
const {ExpressionPicker} = await loadModule('../src/features/stickers/ExpressionPicker.tsx', {
    '@/lib/utils': utils,
    '@/components/ui/tabs': tabs,
    '@/components/ui/button': button,
    './catalog': catalog,
    './EmojiBrowser': {EmojiBrowser: CaptureEmojiBrowser},
});

function renderPicker(overrides = {}) {
    const events = [];
    const props = {tab: 'stickers', onTabChange: value => events.push(['tab', value]), mode: 'message',
        proActive: false, onEmojiSelect: value => events.push(['emoji', value]),
        onStickerSelect: value => events.push(['sticker', value.id]), onUpgrade: () => events.push(['upgrade']),
        ...overrides};
    let tree;
    // Capture the real component's handlers while React supplies its normal hook lifecycle.
    function Capture() {
        tree = ExpressionPicker(props);
        return tree;
    }
    const markup = renderToStaticMarkup(React.createElement(Capture));
    return {markup, tree, emojiTree, events};
}

function elements(tree, matches) {
    if (!React.isValidElement(tree)) return [];
    return [...(matches(tree) ? [tree] : []), ...React.Children.toArray(tree.props.children)
        .flatMap(child => elements(child, matches))];
}

function stickerButton(tree, name) {
    return elements(tree, element => element.type === 'button' && element.props.title === name)[0];
}

test('one Stickers tab exposes every locked sticker and selection opens the upgrade flow', () => {
    const {markup, tree, events} = renderPicker();
    assert.equal((markup.match(/role="tab"/g) ?? []).length, 2);
    assert.match(markup, />Emoji<\/button>/);
    assert.match(markup, />Stickers<\/button>/);
    for (const sticker of catalog.PRO_REACTIONS) {
        assert.ok(markup.includes(`aria-label="${sticker.name} sticker, unlock with allchat Pro"`));
        assert.ok(markup.includes(`src="${sticker.src}"`));
    }
    stickerButton(tree, 'Pepe').props.onClick();
    assert.deepEqual(events, [['upgrade']]);
});

test('unlocked message stickers send their catalog identity and never appear selected', () => {
    const {markup, tree, events} = renderPicker({proActive: true});
    assert.match(markup, /aria-label="Send Pepe sticker"/);
    assert.match(markup, /Select to send this sticker\./);
    assert.doesNotMatch(markup, /unlock with allchat Pro|aria-pressed=/);
    stickerButton(tree, 'Pepe').props.onClick();
    assert.deepEqual(events, [['sticker', 'pepe']]);
});

test('expired Pro users can remove a selected reaction but cannot add or send it again', () => {
    const selectedStickerTokens = new Set(['allchat:pepe']);
    const reaction = renderPicker({mode: 'reaction', selectedStickerTokens});
    assert.match(reaction.markup, /aria-label="Remove Pepe reaction" aria-pressed="true"/);
    stickerButton(reaction.tree, 'Pepe').props.onClick();
    stickerButton(reaction.tree, 'Wojak').props.onClick();
    assert.deepEqual(reaction.events, [['sticker', 'pepe'], ['upgrade']]);

    const message = renderPicker({selectedStickerTokens});
    assert.match(message.markup, /aria-label="Pepe sticker, unlock with allchat Pro"/);
    stickerButton(message.tree, 'Pepe').props.onClick();
    assert.deepEqual(message.events, [['upgrade']]);
});

test('pending selection disables sticker and emoji buttons for keyboard users', async () => {
    const stickers = renderPicker({proActive: true, pending: true});
    assert.match(stickers.markup, /aria-busy="true"/);
    assert.equal(stickerButton(stickers.tree, 'Pepe').props.disabled, true);
    stickerButton(stickers.tree, 'Pepe').props.onClick();
    assert.deepEqual(stickers.events, []);

    const emoji = renderPicker({tab: 'emoji', proActive: true, pending: true});
    assert.match(emoji.markup, /disabled="" aria-label="Insert/);
    const grid = elements(emoji.emojiTree, element => Array.isArray(element.props.section?.entries))[0];
    await grid.props.onSelect({key: 'unicode:+1:👍', selection: {kind: 'unicode', native: '👍', id: '+1'}});
    assert.deepEqual(emoji.events, []);
});

test('the shared picker preserves native emoji identities and controlled tab switching', async () => {
    const {tree, emojiTree, events} = renderPicker({tab: 'emoji'});
    const grid = elements(emojiTree, element => Array.isArray(element.props.section?.entries))[0];
    await grid.props.onSelect({key: 'unicode:female-technologist:👩🏽‍💻', name: 'Female technologist',
        selection: {kind: 'unicode', native: '👩🏽‍💻', id: 'female-technologist'}});
    tree.props.onValueChange('stickers');
    assert.deepEqual(events, [['emoji', {kind: 'unicode', native: '👩🏽‍💻', id: 'female-technologist'}], ['tab', 'stickers']]);
});
