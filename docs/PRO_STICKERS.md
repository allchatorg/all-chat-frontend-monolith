# allchat Pro character reactions

The message reaction picker includes **Emoji** and **allchat Pro** tabs. Everyone
can use standard emoji, browse the 17 transparent characters, and view reactions
on messages. Active Pro members can add character reactions in public rooms and
private conversations. Locked characters open the existing allchat Pro dialog.
Badge visibility does not affect access.

The character tab supports name and mood search, keyboard focus, and hover/focus
previews. Selecting a character adds a reaction directly to the message. Reaction
chips show the character image and count, toggle the viewer's membership, and
support tooltips and the reacting-users panel. Members can remove their own
reactions after Pro expires; adding one always requires current Pro access.

## Reaction contract

Existing reaction endpoints and fields are preserved. A custom reaction uses the
same reserved token in `emoji` and `emojiId`, for example `allchat:pepe`. The server
validates matching, known tokens and the current subscription when adding a
reaction. Unicode emoji keep their existing behavior. Detail request paths
URI-encode the reaction identity.

The client resolves character images only through the local catalog in
`src/features/stickers/catalog.ts`. Incoming tokens cannot select arbitrary image
URLs. Room access applies to reaction changes and user details. Changes are
serialized per message and idempotent; user previews do not modify stored
membership. Public and private chats receive the existing live reaction updates.

Messages, replies, edit history, and promotions have no standalone sticker fields.
The composer continues to preserve failed drafts, block duplicate pending sends,
and retain reply state until a send succeeds.

## Assets and deployment

All 17 PNG assets remain in `public/stickers/pro/`. Their README preserves the
original artwork prompts and generation workflow. The local catalog and backend
allowlist use the same character IDs, including both Chad variants.

Deploy the matching `feature/pro-stickers` backend before the frontend. Reactions
use the existing database schema; no sticker-message migration is needed. No
additional billing configuration or environment variables are required.

## Verification

```sh
npm run test:reactions
npx tsc --noEmit
npm run build
```

Verify all 17 catalog entries and transparent assets, ordinary emoji, free and
active/expired Pro access, hidden badges, invalid tokens, removal after expiry,
encoded details requests, counts, and reload/live-update persistence. Backend
tests cover private-room access, concurrent/idempotent changes, and non-mutating
user previews. Browser checks cover desktop/mobile layout, search, keyboard
access, locked previews, upgrade behavior, and failed reaction requests without
sending test reactions to actual conversations.
