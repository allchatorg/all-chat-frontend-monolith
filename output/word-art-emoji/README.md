# All Chat word-art emoji

Free custom emojis anyone can send inline or use as a reaction (no VIP needed). They share the
`:allchat:<id>:` wire format with the Catapuss set but are listed in their own "allchat" section.

- `build.cjs` — monoline bubble lettering (gradient fill, 3D extrusion, dark outline, white sticker
  edge) plus the emoji list (`EMOJIS`: catalog ID, display name, search tags, rows of text).

  ```bash
  node output/word-art-emoji/build.cjs
  ```

  writes `svg/<id>.svg`, `public/emoji/<id>.png` (512 × 512 RGBA) and `preview.png`. Only the
  letters `h` and `a` are drawn so far; add glyph skeletons to `GLYPHS` for new words.

When adding an emoji, update `FREE_EMOJIS` in `src/features/stickers/catalog.ts` and `FREE_EMOJI_IDS`
in `all-chat-monolith/chat/src/main/java/com/mk3/chatapp/utils/VipCharacterCatalog.java`.
