# allchat Pro stickers

The composer includes a searchable, responsive sticker picker with 17 transparent
character stickers. Free users can browse and preview the pack, then open the
existing allchat Pro dialog. Active Pro users can attach one sticker, optionally
add a caption or attachment, and send it to a public room or private conversation.
Badge visibility does not affect access.

The picker supports keyboard focus, Escape, character names and mood search, a
preview footer, and a removable composer preview. Failed sends preserve the
draft. The composer blocks duplicate sends while a request is pending.

## Message contract

`CreateMessageRequest`, `Message`, and reply previews use an optional `stickerId`.
The server validates the ID and current subscription on every send. The client
resolves IDs through `src/features/stickers/catalog.ts`; incoming values cannot
select arbitrary image URLs. Editing a caption preserves its original sticker.

Stickers render without a bubble/background in chat, search, history, report
details, and promoted-message previews. Deleted reply parents follow the existing
visibility rules. Private conversation and moderation lists show sticker names
when no caption exists.

## Assets

PNG assets live in `public/stickers/pro/`. Their README records the artwork prompt
set and generation workflow. The catalog and backend allowlist must use the same
IDs. Both Chad variants have separate entries.

## Deployment

Deploy the matching `feature/pro-stickers` backend first. In
`all-chat-monolith`, apply `docs/sql/pro-stickers.sql` after the existing Pro SQL
migration and before starting a backend that validates its database schema.
The migration adds nullable sticker columns to messages and edit history.
No additional billing configuration or environment variables are needed.

## Verification

```sh
npm run test:stickers
npx tsc --noEmit
npm run build
```

The regression tests cover catalog asset resolution and transparent PNG support,
unknown IDs, reply edits, and immediate sticker redaction for deleted parents.
Browser checks use local simulated accounts and sends to verify locked previews,
search, hidden-badge Pro access, sticker-only sending, failed-send draft retention,
and responsive layout without sending test messages to actual conversations.
