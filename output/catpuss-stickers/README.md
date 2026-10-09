# All Chat Catpuss stickers

25 VIP stickers / custom emojis / reactions in the style of the client's three kawaii-cat
samples (cheering, typing, heart hug). They replace the earlier meme pack.

- `cat-art.cjs` — the vector cat and its shared parts (eyes, mouths, brows, paws, props, effects).
- `variants.cjs` — one entry per sticker: catalog ID, display name, search tags and pose spec.
- `build.cjs` — renders everything:

  ```bash
  node output/catpuss-stickers/build.cjs
  ```

  writes `svg/<id>.svg`, `public/stickers/vip/<id>.png` (512 × 512 RGBA, rendered at 2× and
  downsampled), `preview.png` and `manifest.json`. For quick iteration,
  `node output/catpuss-stickers/build.cjs --sheet /tmp/sheet.png catpuss-cheer catpuss-love` renders only a
  contact sheet.

When adding or renaming a sticker, update `src/features/stickers/catalog.ts` and the backend
allowlist `all-chat-monolith/chat/src/main/java/com/mk3/chatapp/utils/VipCharacterCatalog.java`.
