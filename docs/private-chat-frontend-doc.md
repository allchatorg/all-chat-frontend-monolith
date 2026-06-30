# Private Chat — Frontend Integration Guide

> Backend version: `feature/private-chat`
> Audience: frontend engineers integrating private (1:1) DMs.

This document covers the REST endpoints, WebSocket subscription, request/response shapes, expected error codes, and
end-to-end flows. Public chat behavior is unchanged — anything you already do for public rooms still works the same way.

---

## 1. Auth & gating

- **All private-chat endpoints require an authenticated session.** Use whichever cookie / token mechanism you already
  use for the public chat.
- **Only users with `claimed == true` may use private chat.** Unclaimed users and guests get `403 Forbidden` from every
  private endpoint and from `/api/v1/users/search`.
- The user's `claimed` flag is available from `GET /api/v1/users/me` (`UserDTO.claimed`) — gate your UI off of it. If
  `claimed === false`, hide the DM button and the user-search box.

---

## 2. REST endpoints

All paths are relative to the API base. All bodies are JSON unless noted. Pagination uses standard Spring `Page<T>`
shape (`{ content, totalElements, totalPages, number, size, ... }`).

### 2.1 Search users (`GET /api/v1/users/search`)

Used to populate the "Start a new chat" picker.

**Query params**

| Param  | Type   | Required | Default | Notes                                       |
|--------|--------|----------|---------|---------------------------------------------|
| `q`    | string | yes      | —       | Prefix match on username, case-insensitive. |
| `page` | int    | no       | 0       | Zero-indexed.                               |
| `size` | int    | no       | 20      | Max 50.                                     |

**Response** — `Page<UserMinimalDTO>`

```json
{
  "content": [
    { "id": 42, "username": "alice" },
    { "id": 17, "username": "alex" }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "number": 0,
  "size": 20
}
```

**Filtering rules (server-side, you don't need to re-filter):**

- excludes the requester themselves
- excludes banned users
- excludes deleted accounts
- excludes unclaimed users
- excludes users blocked by you, and users who have blocked you

**Errors**

| Status | When                              |
|--------|-----------------------------------|
| 400    | `size` ≤ 0 or > 50, or `page` < 0 |
| 403    | requester is not claimed          |

If `q` is blank/empty, an empty page is returned (200).

---

### 2.2 Create or get a private chat (`POST /api/v1/private-chats`)

Idempotent — call this on the user click. If a private room with the other user already exists, you'll get it back. If
not, it's created.

**Request body**

```json
{ "otherUserId": 42 }
```

**Response** — `PrivateChatDTO` (see §3 for full shape)

```json
{
  "id": 314,
  "counterpart": { "id": 42, "username": "alice" },
  "unreadMessagesCount": 0,
  "lastReadMessage": null,
  "lastMessage": null,
  "blocked": false
}
```

**Side effects**

- If the conversation was previously hidden on your side, it is **unhidden** by this call.
- The counterpart's hidden state is NOT touched by this call alone; theirs flips back only when the first message is
  sent.

**Errors**

| Status | When                                                |
|--------|-----------------------------------------------------|
| 400    | `otherUserId` equals your own id, or user not found |
| 400    | other user is banned or unclaimed                   |
| 403    | requester is not claimed                            |

---

### 2.3 List my conversations (`GET /api/v1/private-chats`)

Use this to populate the sidebar on initial load and after any change.

**Response** — `List<PrivateChatDTO>`

```json
[
  {
    "id": 314,
    "counterpart": { "id": 42, "username": "alice" },
    "unreadMessagesCount": 3,
    "lastReadMessage": { "id": 9001, "...": "..." },
    "lastMessage":     { "id": 9004, "...": "..." },
    "blocked": false
  }
]
```

**Notes**

- Only **non-hidden** conversations are returned. Hidden ones come back via §2.2 (create-or-get) when you reopen them.
- Order is not guaranteed by the backend — sort client-side by `lastMessage.createdAt` (or `lastMessage.id`) descending
  for a chronological sidebar.
- `unreadMessagesCount` may be `null` to indicate "you've never opened it and there are messages" (treat as an
  unread-dot indicator without a count). When a user has read at least once, this is a numeric count.

**Errors:** `403` if not claimed.

---

### 2.4 Open a conversation (`GET /api/v1/private-chats/{roomId}`)

Call this when the user clicks an existing conversation in the sidebar. It returns the conversation metadata and, as a
side effect, **unhides it** if it was hidden.

**Response:** `PrivateChatDTO`

**Note:** this endpoint does NOT return messages. Fetch messages via `GET /api/v1/chat-rooms/{roomId}/messages` (see
§2.7).

**Errors**

| Status | When                                                      |
|--------|-----------------------------------------------------------|
| 400    | room not found, or room is not a private room             |
| 403    | requester is not claimed, or is not a member of this room |

---

### 2.5 Hide a conversation (`DELETE /api/v1/private-chats/{roomId}`)

Soft-removes the conversation from the user's sidebar. The counterpart still sees it. Messages are preserved.

**Response:** `204 No Content`

**Auto-unhide:** if the counterpart sends a new message later, this conversation re-appears on your sidebar
automatically. You'll receive the new message over WebSocket and a refreshed `GET /api/v1/private-chats` will include it
again.

**Errors**

| Status | When                                                      |
|--------|-----------------------------------------------------------|
| 400    | room not found, or room is not a private room             |
| 403    | requester is not claimed, or is not a member of this room |

---

### 2.6 Send a message (`POST /api/v1/chatting/messages`)

**This is the existing endpoint — use it as-is.** It accepts a `chatRoomId`, so passing a private room id works.

**Request body**

```json
{
  "content": "hey",
  "chatRoomId": 314,
  "attachments": []
}
```

**Response** — `MessageResponseDTO` (echo of what was saved).

**Important for private rooms:**

- The send goes through the same validation as public rooms PLUS:
    - sender must be claimed
    - sender must be a member of the room
    - sender must not be blocked by the counterpart, and must not have blocked the counterpart
- A `403 AccessDeniedException` is returned if any of those fail. The same payload is used; just show "You can't message
  this user" or similar.
- The recipient receives the message over WebSocket (see §4).

---

### 2.7 Fetch messages (`GET /api/v1/chat-rooms/{roomId}/messages`)

Use the existing cursor-paginated endpoint. **For private rooms, the server enforces membership** — you must be a member
of the room or you'll get `403`.

**Query params** (mutually exclusive cursors)

| Param             | Type | Notes                                              |
|-------------------|------|----------------------------------------------------|
| `beforeMessageId` | Long | Fetch the page ending before this message.         |
| `afterMessageId`  | Long | Fetch the page starting after this message.        |
| `aroundMessageId` | Long | Fetch a window centered on this message (jump-to). |

If you pass none of the three, you get the most recent 50.

**Response** — `MessagePageDTO`

```json
{
  "messages": [ /* MessageResponseDTO[] */ ],
  "hasPrevious": true,
  "hasNext": false,
  "firstMessageId": 9000,
  "lastMessageId":  9049
}
```

### 2.8 Other existing endpoints (work as-is for private rooms)

These are unchanged, but for completeness:

| Action              | Endpoint                                                                 |
|---------------------|--------------------------------------------------------------------------|
| Edit message        | `PATCH /api/v1/chatting/messages/{messageId}/edit` `{content}`           |
| Delete message      | `DELETE /api/v1/chatting/messages/{messageId}`                           |
| Upload attachment   | `POST /api/v1/chatting/attachments` (multipart)                          |
| React               | `PATCH /api/v1/chat-rooms/message-reactions` `{messageId,emoji,emojiId}` |
| Remove reaction     | `DELETE /api/v1/chat-rooms/message-reactions` (same body)                |
| Mark message read   | `PATCH /api/v1/chat-rooms/{roomId}/messages/{messageId}/acknowledge`     |
| Search in room      | `POST /api/v1/chat-rooms/{roomId}/messages/search`                       |
| Get message history | `GET /api/v1/chatting/messages/{messageId}/history`                      |

For private rooms, the `acknowledge` endpoint is what drives `unreadMessagesCount` back to 0 on the next sidebar fetch —
call it when the user reads the latest message.

---

## 3. DTO reference

### 3.1 `PrivateChatDTO`

```ts
type PrivateChatDTO = {
  id: number;                          // chat room id — use this everywhere as `chatRoomId`
  counterpart: UserMinimalDTO | null;  // null only if the other user was deleted
  unreadMessagesCount: number | null;  // null = unread indicator only, no count
  lastReadMessage: MessageResponseDTO | null;
  lastMessage: MessageResponseDTO | null;
  blocked: boolean;                    // true if either side has blocked the other
};
```

`blocked === true` means you can still **read** the history but `POST /api/v1/chatting/messages` will return 403. Show
a "messaging unavailable" banner in the composer.

### 3.2 `UserMinimalDTO`

```ts
type UserMinimalDTO = {
  id: number;
  username: string;
};
```

### 3.3 `MessageResponseDTO` (unchanged, just listed for reference)

```ts
type MessageResponseDTO = {
  id: number;
  content: string;
  chatRoomId: number;
  chatRoomName: string | null;   // null for private rooms — DO NOT use this as a routing key for private chats
  senderId: number;
  senderUsername: string;
  senderRole: "GUEST" | "UNCLAIMED_USER" | "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
  senderCountryCode: string | null;
  bannedUser: boolean;
  deleted: boolean;
  createdAt: string;             // ISO instant
  editedAt: string | null;
  color: string | null;
  attachments: AttachmentDTO[];
  reactions: ReactionSummaryDTO[];
};
```

**The only difference for private-room messages:** `chatRoomName` is `null`. Route everything by `chatRoomId`.

---

## 4. WebSocket

### 4.1 Connection

Same STOMP `/ws` endpoint as the public chat. Authentication is handled by the existing handshake — no change.

### 4.2 Subscription for private messages

Subscribe **once per session** to:

```
/user/queue/private-messages
```

That's the literal client-side destination — STOMP resolves `/user` to the current authenticated user, so you don't
include a user id in the path. The server uses `convertAndSendToUser(...)` to route only to your session(s).

You do NOT need to subscribe to a per-room topic for private chats. All incoming private events for all of your private
rooms arrive on this one queue, distinguished by `chatRoomId` in the payload.

### 4.3 Public-chat topics — unchanged

`/topic/chat-room.{name}` continues to work exactly as before, and **private rooms are never broadcast on it.** Your
public-chat subscription code does not need any changes.

### 4.4 Incoming message shape

Every event on `/user/queue/private-messages` is a `WebSocketMessage`:

```ts
type WebSocketMessage = {
  type: "PRIVATE_NEW_MESSAGE" | "PRIVATE_MESSAGE_EDIT" | "PRIVATE_MESSAGE_DELETE";
  chatRoomName: null;            // always null for private — ignore this field
  data: MessageResponseDTO;
};
```

The `data` field is always a `MessageResponseDTO` for all three private types. Use `data.chatRoomId` to route to the
correct open conversation in your store.

### 4.5 Three private event types

| Type                     | When fired                                  | What to do                                                                                                                                                                                              |
|--------------------------|---------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `PRIVATE_NEW_MESSAGE`    | A new message was sent in a private room.   | Append to that room's message list. Bump unread count + last-message in sidebar. Auto-unhide the convo in sidebar state (the backend has already flipped the flag — refresh sidebar or update locally). |
| `PRIVATE_MESSAGE_EDIT`   | Existing message's content was edited.      | Replace the message by `data.id` in the list. `data.editedAt` will be non-null.                                                                                                                         |
| `PRIVATE_MESSAGE_DELETE` | A message was deleted (by sender or staff). | Mark the message as deleted (`data.deleted === true`). Render as tombstone.                                                                                                                             |

### 4.6 Reactions over WebSocket

Reactions on private-room messages currently broadcast on the **existing** `MESSAGE_REACTION_UPDATE` channel — the
codebase has not been changed to split that out. For v1, do not rely on real-time reaction updates in private rooms; do
an optimistic update on the user who reacted and a refetch on conversation open if you need authoritative state. (This
is a known gap; a follow-up will route reaction events through `/user/queue/private-messages` as well.)

---

## 5. End-to-end flows

### 5.1 Open the app, populate the sidebar

```
1. GET /api/v1/users/me            → check `claimed`. If false, hide DM UI.
2. Connect STOMP /ws.
3. Subscribe to /user/queue/private-messages.
4. GET /api/v1/private-chats       → render sidebar.
```

### 5.2 Start a new chat

```
1. User types in search box     → GET /api/v1/users/search?q=alex&page=0&size=20
2. User clicks a result         → POST /api/v1/private-chats { otherUserId: 42 }
3. Render the returned PrivateChatDTO as the active conversation.
4. GET /api/v1/chat-rooms/{id}/messages → render history (if any).
```

If the room already exists, the same POST returns it — no special path needed.

### 5.3 Send a message

```
1. POST /api/v1/chatting/messages { content, chatRoomId, attachments: [] }
2. On 200, append the returned message to the local message list (optimistic optional).
3. The counterpart receives PRIVATE_NEW_MESSAGE over their WebSocket.
4. Your own session does NOT receive a duplicate PRIVATE_NEW_MESSAGE — the REST response is your source of truth for your own sends. (The backend broadcasts to both members; if your STOMP session is one of them you may receive it too — dedupe by message id just in case.)
```

### 5.4 Mark as read

```
1. User scrolls to the bottom or focuses the conversation.
2. PATCH /api/v1/chat-rooms/{roomId}/messages/{lastMessageId}/acknowledge
3. Locally set unreadMessagesCount = 0 for that conversation.
```

### 5.5 Hide a conversation

```
1. User clicks "Delete from sidebar".
2. DELETE /api/v1/private-chats/{roomId}
3. Remove from local sidebar state.
4. Later, if the counterpart sends a message, you'll receive PRIVATE_NEW_MESSAGE.
   When that arrives for a roomId not currently in your sidebar, refetch GET /api/v1/private-chats — the row will be back.
```

### 5.6 Reopen a previously hidden chat

```
1. User searches for the same person → POST /api/v1/private-chats { otherUserId }
2. Server returns the existing room and flips `hidden=false` for you.
3. Refetch sidebar (or insert into local state).
4. GET /api/v1/chat-rooms/{id}/messages → render history (still there).
```

### 5.7 Block / blocked

`POST /api/v1/users/block/{userId}` and `POST /api/v1/users/unblock/{userId}` already exist. Their interaction with
private chat:

- After blocking, both you and the counterpart see `PrivateChatDTO.blocked === true` on subsequent fetches.
- `POST /api/v1/chatting/messages` returns 403 for both parties.
- Read access to history is still allowed.
- The counterpart will not appear in your search results (and vice versa).

Refresh the conversation list after blocking/unblocking so the `blocked` flag updates in the sidebar.

---

## 6. Error model

The backend uses standard Spring exception handlers. The error body shape is whatever your global exception handler
already produces (likely `ErrorDTO`); HTTP status codes are what your code should switch on.

| Status | Likely cause                                                                                                           |
|--------|------------------------------------------------------------------------------------------------------------------------|
| 400    | invalid input (self-DM, unknown user, blank search, bad page/size, room is not private when calling private endpoints) |
| 401    | not authenticated                                                                                                      |
| 403    | not claimed, not a member, blocked, or unclaimed counterpart                                                           |
| 404    | message not found (for edit/delete history endpoints)                                                                  |
| 409    | tried to use a private room via a public-room endpoint (`Conflict`)                                                    |

**Recommended UI:**

- 403 on send → inline "You can't message this user." banner in the composer; leave history readable.
- 403 on list/open → likely the user lost their `claimed` state; force re-fetch `/me` and route them out of DM UI.
- 400 on create → "User not available." toast.

---

## 7. Gotchas / things to know

1. **`chatRoomName` is null for private rooms.** Never use it as a key. Always use `chatRoomId`.
2. **One STOMP subscription handles all private chats.** Do not subscribe per-room — you'd get nothing.
3. **The user-search endpoint is prefix match.** `alex` matches `alex`, `alexander`, but not `kalex`. Adjust UX copy if
   needed.
4. **Hidden conversations remain on the server.** Hiding is per-user; there is no "really delete" in v1.
5. **`unreadMessagesCount: null`** means "never opened, has messages" — distinct from `0` ("opened, all read"). Render
   an indicator dot without a number.
6. **Concurrent create:** two simultaneous `POST /api/v1/private-chats` calls between the same pair will both return the
   same `PrivateChatDTO.id`. Safe to retry.
7. **Sending in your own UI:** the REST response of `POST /chatting/messages` already contains the saved
   `MessageResponseDTO` — you can render optimistically off of that. If your WebSocket also fires `PRIVATE_NEW_MESSAGE`
   to your own session, dedupe by `data.id`.
8. **Public chat is unaffected.** All existing public-chat code paths remain identical. If you see a public-room
   regression, it's a bug — please report.

---

## 8. Quick reference card

```
REST
  GET    /api/v1/users/search?q=&page=&size=        → Page<UserMinimalDTO>
  POST   /api/v1/private-chats   { otherUserId }    → PrivateChatDTO
  GET    /api/v1/private-chats                      → PrivateChatDTO[]
  GET    /api/v1/private-chats/{roomId}             → PrivateChatDTO  (unhides)
  DELETE /api/v1/private-chats/{roomId}             → 204             (soft-hide)

  POST   /api/v1/chatting/messages  { content, chatRoomId, attachments }
  GET    /api/v1/chat-rooms/{roomId}/messages?...
  PATCH  /api/v1/chat-rooms/{roomId}/messages/{messageId}/acknowledge

WebSocket
  Connect:    /ws
  Subscribe:  /user/queue/private-messages
  Event types: PRIVATE_NEW_MESSAGE | PRIVATE_MESSAGE_EDIT | PRIVATE_MESSAGE_DELETE
  Route by:   payload.data.chatRoomId
```
