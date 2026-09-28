# allchat Pro stickers, emojis, and reactions

The composer has separate emoji and sticker buttons that open one shared picker
on the requested tab. Users can switch between **Emoji** and **Stickers** without
closing it. Emoji are inserted into the draft; stickers are sent as standalone
messages and preserve any text or attachment draft. All 17 transparent characters,
including locked ones, live in the same searchable sticker catalog. On mobile,
the message options expose both choices and open the same picker.

Everyone can use standard emoji and browse stickers and custom emojis. Active
allchat Pro members can send stickers, insert custom emojis into messages, and
add character reactions in public rooms and private conversations. Locked
stickers and emojis open the existing allchat Pro dialog. Badge
visibility does not affect access. Search, keyboard focus, and hover/focus previews
are available in the sticker tab.

The Emoji tab uses our own browser powered by `@emoji-mart/data`. One search
covers native characters and custom emojis. Categories include Recent, allchat Pro,
and the standard emoji groups; skin tones, keyboard navigation, and previews are
available. The same 17 artwork files demonstrate both small inline emojis and
standalone stickers. Successful, permitted selections update recents; locked
choices, failed selections, and reaction removals do not. The reaction picker
uses only this emoji browser. Editing a message exposes Emoji without Stickers.
Emoji previews show their typing codes. The chat composer converts Unicode
shortcodes such as `:smile:` and `:wave::skin-tone-4:`, including Emoji Mart aliases,
while custom emojis use their canonical `:allchat:pepe:` codes. Codes within URLs
stay literal.

## Inline emoji contract

Custom emojis are atomic inline editor nodes serialized into the existing
`content` string as `:allchat:pepe:`. Native emojis remain Unicode. Rendering and
pasted image markup resolve only local catalog IDs, never supplied image URLs.
Complete unknown identities show unavailable placeholders. Tokens inside URLs
remain literal; inserting an emoji directly after a URL adds a separating space.

New sends require current Pro access for every custom emoji. On edits, an expired
member can retain, move, or remove existing per-ID counts, but cannot increase a
count or introduce another ID. Failed sends and edits retain the draft. Reading
existing emojis requires no subscription and respects normal redaction rules.

Each custom emoji counts as one chat character using a U+FFFC placeholder in
chat-visible text and backend `content_plain`; the account-specific visible limit
is 500 for Basic and 2,500 for Pro. The separate raw limits are 2,000 for Basic and
10,000 for Pro. Replies and compact previews show readable names. Message history and
chat search results render the inline images. Formatting, greentext, and clipboard
serialization preserve their identities. Advertising keeps its original marker
parsing, rendering, character counting, and pricing.

## Message contract

Create-message requests, messages, and reply previews support an optional
`stickerId`, using a short catalog ID such as `pepe`. Sticker messages have empty
`content` and no attachments; they may reply to another message. The server
validates the ID, room access, and current Pro subscription. Sending a sticker
keeps the current text and attachments and clears reply state only after success.
A failed send keeps the picker open so the user can retry.

Chat messages and search results show transparent sticker artwork. Replies and
conversation previews use readable sticker names. Unknown IDs show an unavailable
placeholder and never resolve arbitrary image URLs. Redacted content never renders
sticker artwork. Deleted stickers are hidden from regular viewers; authorized
staff can see retained artwork for moderation, matching the existing deleted text
and attachment policy. Standalone stickers cannot be edited or promoted, and do
not produce edit-history entries.

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

Selecting a character in the reaction picker adds a reaction to that message.
Reaction chips show the character image and count, toggle the viewer's membership,
and support tooltips and the reacting-users panel. Members can remove their own
reactions after Pro expires; adding one requires current Pro access.

## Assets and deployment

All 17 PNG assets remain in `public/stickers/pro/`. Their README preserves the
original artwork prompts and generation workflow. The local catalog and backend
allowlist use the same character IDs, including both Chad variants.

Follow the combined migration order in the backend `docs/allchat-pro.md` guide.
Deploy the matching backend and its sticker-message database migration before the
frontend. Inline emojis and reactions use their existing fields and require no
additional migration. The existing sticker migration is
`all-chat-monolith/docs/sql/sticker-messages.sql`. No additional billing
configuration or environment variables are required.

## Verification

```sh
npx tsc --noEmit --incremental false
npm run build
```

Compile the backend with `./mvnw -pl chat,ads -am -Dmaven.test.skip=true compile`.
Review entitlement checks, expiry edits, token recognition outside URLs, format
roundtrips, inline rendering, and redaction. Do not add tests unless the user
explicitly requests them; verification for paid emojis uses compilation, builds,
and code review without manual site interactions.
