# Private Chat — Frontend Specification

> Companion to `docs/private-chat-frontend-doc.md` (backend contract).
> This document describes how the frontend will be structured to implement
> private (1:1) DMs on top of the existing public-chat codebase, with
> maximum reuse of the patterns already in place.

---

## 1. Goals & non-goals

### Goals

- Add 1:1 private messaging gated by `User.claimed === true`.
- Reuse the existing message rendering, composer, attachments, edit/delete,
  reactions, message-search, ban/role/permission gating, and STOMP wiring.
- Keep the public-chat code paths untouched — private chat lives in parallel
  redux/api/component branches, with shared leaf components.
- Sidebar of conversations on the left (un-closable on desktop). Right panel
  hidden by default; opens only when the user triggers in-room message search.

### Non-goals (v1)

- Group DMs.
- Real-time reaction updates on private messages (backend gap — see §10).
- "Really delete" a conversation. v1 hides only.
- Notifications for private messages outside of in-app (no push, no email).

---

## 2. Pattern reuse — how the existing codebase is organized

Every feature in this codebase follows the same shape. Private chat mirrors
it directly.

| Layer                 | Public-chat file (example)                                       | Private-chat counterpart                                                      |
|-----------------------|------------------------------------------------------------------|-------------------------------------------------------------------------------|
| HTTP client           | `src/api/chatRoom/chatRoomInteractionAPI.ts`                     | `src/api/privateChat/privateChatAPI.ts` (new)                                 |
| DTOs / models         | `src/models/UserChatRoom.ts`, `src/models/ChatRoom.ts`           | `src/models/PrivateChatDTO.ts`, `src/models/UserMinimalDTO.ts` (new)          |
| Domain slice          | `src/redux/chatRoom/chatRoomSlice.ts`                            | `src/redux/privateChat/privateChatSlice.ts` (new)                             |
| UI slice              | `src/redux/chatRoom/chatRoomUiSlice.ts`                          | `src/redux/privateChat/privateChatUiSlice.ts` (new)                           |
| Thunks                | `src/redux/chatRoom/chatRoomThunk.ts`                            | `src/redux/privateChat/privateChatThunk.ts` (new)                             |
| Selectors             | `src/redux/chatRoom/chatRoomSelectors.ts`                        | `src/redux/privateChat/privateChatSelectors.ts` (new)                         |
| Feature components    | `src/features/chatroom/components/*`                             | `src/features/privateChat/components/*` (new)                                 |
| Feature hooks         | `src/features/chatroom/hooks/*`, `src/lib/hooks/useChatRooms.ts` | `src/features/privateChat/hooks/usePrivateChats.ts`, `useUserSearch.ts` (new) |
| Route                 | `src/app/page.tsx`                                               | `src/app/private/page.tsx` (new)                                              |
| WebSocket integration | `src/lib/hooks/useStompClient.ts`                                | extended in-place                                                             |
| Store registration    | `src/redux/store.ts`                                             | extended in-place                                                             |
| Persist config        | (per slice in `store.ts`)                                        | extended in-place                                                             |

The store registers `appReducer` and uses `redux-persist` selectively. We
follow the same approach for private chat.

---

## 3. Routing & navigation

### 3.1 New route

- Add `ROUTES.PRIVATE_CHAT = '/private'` to `src/routes.ts` and include in
  `PROTECTED_ROUTES`.
- New page: `src/app/private/page.tsx` (mirrors `src/app/page.tsx` layout).
- `AuthGuard` already protects everything under `PROTECTED_ROUTES`.

### 3.2 Navbar entry

- In `src/components/Navbar.tsx`, add a button next to the existing icons
  (Advertise / Report bug / Settings) that links to `/private`.
    - Icon: `MessageCircle` (or `MessagesSquare`) from `lucide-react`.
    - Visible to all signed-in users **but gated by `user.claimed`** — if
      `user.claimed === false`, hide the button entirely. Mirror the existing
      `shouldShowModButton` pattern.
    - Tooltip: "Private messages".
- When the user is on `/private`, the existing `SearchRooms` in the navbar
  is **replaced** by a new `SearchUsers` component (see §6.2). Implementation
  detail: in `Navbar.tsx`, branch by `pathname === ROUTES.PRIVATE_CHAT`.

### 3.3 URL parameters

- `/private?chatRoomId=314` — opens conversation with room id 314. Mirrors
  the public chat's `?chatRoomId=`.
- `/private?chatRoomId=314&jumpTo=9001` — jump-to-message support (reuses
  the existing `useChatScrollAndPagination` flow).

---

## 4. Models (new)

Create these in `src/models/`:

```ts
// PrivateChatDTO.ts
export interface PrivateChatDTO {
  id: number;                        // chat room id — use as `chatRoomId` everywhere
  counterpart: UserMinimalDTO | null;
  unreadMessagesCount: number | null;
  lastReadMessage: Message | null;
  lastMessage: Message | null;
  blocked: boolean;
}
```

```ts
// UserMinimalDTO.ts
export interface UserMinimalDTO {
  id: number;
  username: string;
}
```

Existing models that we **reuse as-is**:

- `Message` — backend guarantees the same `MessageResponseDTO` shape, with
  `chatRoomName === null` for private messages. Document the null at point
  of use.
- `ChatRoom` — represents a loaded room's messages + pagination state. Used
  for both public and private rooms in the new slice's `loadedRooms`.
- `PaginatedResponse<T>` — for user search results.
- `WebSocketMessage` — extended (see §8).

Extend `WebSocketMessageType` with three new values:

```ts
PRIVATE_NEW_MESSAGE = "PRIVATE_NEW_MESSAGE",
PRIVATE_MESSAGE_EDIT = "PRIVATE_MESSAGE_EDIT",
PRIVATE_MESSAGE_DELETE = "PRIVATE_MESSAGE_DELETE",
```

---

## 5. API layer

New file `src/api/privateChat/privateChatAPI.ts`:

```ts
const PRIVATE_CHATS_PATH = "/private-chats";
const USERS_PATH = "/users";

export const listPrivateChats = (): Promise<PrivateChatDTO[]> =>
  api.get<PrivateChatDTO[]>(PRIVATE_CHATS_PATH).then(r => r.data);

export const openOrCreatePrivateChat = (otherUserId: number): Promise<PrivateChatDTO> =>
  api.post<PrivateChatDTO>(PRIVATE_CHATS_PATH, { otherUserId }).then(r => r.data);

export const openPrivateChat = (roomId: number): Promise<PrivateChatDTO> =>
  api.get<PrivateChatDTO>(`${PRIVATE_CHATS_PATH}/${roomId}`).then(r => r.data);

export const hidePrivateChat = (roomId: number): Promise<void> =>
  api.delete(`${PRIVATE_CHATS_PATH}/${roomId}`).then(r => r.data);

export const searchUsers = (
  q: string, page = 0, size = 20
): Promise<PaginatedResponse<UserMinimalDTO>> =>
  api.get<PaginatedResponse<UserMinimalDTO>>(`${USERS_PATH}/search`, {
    params: { q, page, size }
  }).then(r => r.data);
```

**Reused without changes** (per backend doc §2.6–2.8):

- `saveAndBroadcastMessage` (`POST /chatting/messages`)
- `editMessage`, `deleteMessage`, `getMessageHistory`
- `getChatRoomMessages` (`GET /chat-rooms/{roomId}/messages`)
- `searchChatRoomMessages`
- `updateLastReadMessage` (acknowledge)
- `uploadAttachment`, `deleteAttachment`, `removeAttachmentFromMessage`
- `reactToMessage`, `deleteReaction`, `getReactionsByEmoji` (reactions —
  with the §10 caveat about WS broadcast)

---

## 6. Redux

### 6.1 New slice — `privateChat`

`src/redux/privateChat/privateChatSlice.ts`:

```ts
interface PrivateChatState {
  // Sidebar list — non-hidden conversations, sorted client-side by
  // lastMessage.id desc (fallback: lastMessage.createdAt).
  conversations: PrivateChatDTO[];
  conversationsLoading: boolean;

  // Loaded conversation rooms (messages + pagination). Reuses ChatRoom.
  loadedRooms: ChatRoom[];

  // The currently open conversation (id of the room).
  selectedChatId: number | null;

  // Loading flags — mirrors chatRoomSlice
  selectedChatLoading: boolean;
  createOrOpenLoading: boolean;
  hideChatLoading: boolean;

  // User search (driven by navbar SearchUsers)
  userSearchResults: PaginatedResponse<UserMinimalDTO> | null;
  userSearchLoading: boolean;

  // Messages search inside a private room (mirrors public-chat slice)
  searchedMessages: PaginatedResponse<Message> | null;
  searchMessagesParams: SearchMessageRequest | null;
}
```

Reducers (parallels `chatRoomSlice`):

- `setSelectedPrivateChat(roomId | null)`
- `setLoadedPrivateChatRoom(ChatRoom)`
- `removeLoadedPrivateChatRoom(roomId)`
- `clearConversations()`
- WebSocket handlers:
    - `handlePrivateNewMessage({ message, isByCurrentUser })`
    - `handlePrivateMessageEdit(message)`
    - `handlePrivateMessageDelete(message)`
- Same per-message reducers we already have, but scoped to `loadedRooms`:
    - `addPrivateMessageReaction`, `removePrivateMessageReaction`,
      `updatePrivateUserMessageColor`, `handlePrivateDeletedMessage*` (only
      regular-user variant needed; staff-deletion semantics don't apply the
      same way to DMs in v1).

**Reuse pattern**: copy the small pure helpers from `chatRoomSlice.ts` —
`addReactionRequestToMessage`, `removeReactionRequestFromMessage`,
`getLastNonAdvertMessage`. Hoist them to a shared `src/redux/messages/messageReducers.ts` if convenient, otherwise
duplicate (they're small).

extraReducers:

- `fetchPrivateChatsThunk.{pending,fulfilled,rejected}` → populates `conversations`.
- `openOrCreatePrivateChatThunk.fulfilled` → upserts into `conversations`,
  sets `selectedChatId`.
- `openPrivateChatThunk.fulfilled` → upserts into `conversations`,
  sets `selectedChatId`.
- `hidePrivateChatThunk.fulfilled` → removes from `conversations`,
  unsets `selectedChatId` if matched.
- `fetchPrivateChatMessagesThunk.fulfilled` → identical message-paging logic
  to public chat (`fetchChatRoomMessagesThunk`); replace `selectedChatRoom`
  references with `loadedRooms[selectedChatId]`.
- `searchUsersThunk.fulfilled` → populates `userSearchResults`.
- `searchPrivateChatMessagesThunk.fulfilled` → populates `searchedMessages`.

### 6.2 New UI slice — `privateChatUi`

`src/redux/privateChat/privateChatUiSlice.ts` — mirrors `chatRoomUiSlice`:

```ts
interface PrivateChatUiState {
  // Tabs displayed at the top — subset of conversation ids the user has
  // explicitly opened in this session. Persisted via redux-persist.
  openTabIds: number[];
  tabOrder: number[];

  // Scroll positions per room — identical to public chat
  scrollPositions: Record<number, number>;
  topmostVisibleMessageIds: Record<number, number>;

  jumpToMessageId: number | null;
  editingMessage: Message | null;

  staleRoomIds: number[];

  // Right-panel toggle: 'search-messages' | null
  // (Private chat doesn't have popularity / mod-view / top-reacted.)
  activeRightPanel: 'search-messages' | null;

  // Sidebar toggle (desktop). Persisted.
  sidebarVisible: boolean;
}
```

Reducers:

- `addOpenTab(roomId)`, `removeOpenTab(roomId)`, `reorderTabs(ids)`
- `setSelectedPrivateChatId(roomId | null)`
- `setPrivateChatScrollPosition`, `setPrivateChatTopMostVisibleMessageId`
- `setPrivateEditingMessage`, `setPrivateJumpToMessageId`
- `setPrivateActiveRightPanel`
- `setPrivateSidebarVisible(boolean)` / `togglePrivateSidebar()`
- Stale handling: `markPrivateRoomsAsStale`, `removeStalePrivateRoomId`

### 6.3 Thunks

`src/redux/privateChat/privateChatThunk.ts`:

```ts
fetchPrivateChatsThunk()                  // listPrivateChats
openOrCreatePrivateChatThunk(otherUserId) // openOrCreatePrivateChat
openPrivateChatThunk(roomId)              // openPrivateChat (also unhides)
hidePrivateChatThunk(roomId)              // hidePrivateChat
fetchPrivateChatMessagesThunk({roomId, before/after/aroundMessageId})
searchUsersThunk({q, page, size})
searchPrivateChatMessagesThunk({roomId, request})
acknowledgePrivateMessageThunk({roomId, messageId})   // reuses /chat-rooms/{roomId}/messages/{messageId}/acknowledge
sendPrivateMessageThunk({content, chatRoomId, attachments}) // wraps saveAndBroadcastMessage
editPrivateMessageThunk({messageId, request})
deletePrivateMessageThunk(messageId)
```

**Orchestrating thunks** (mirroring public chat's `selectAndLoadChatRoomThunk`,
`joinAndSelectChatRoomThunk`, `resolveSelectedRoomThunk`):

```ts
selectAndLoadPrivateChatThunk(roomId)
  // - setSelectedPrivateChatId
  // - if not in loadedRooms (or stale): fetchPrivateChatMessagesThunk
  // - addOpenTab(roomId)

resolveSelectedPrivateChatThunk({urlRoomId?})
  // - priority 1: URL roomId — if conversation exists, select; otherwise
  //   GET /private-chats/{id} (which also unhides), then select
  // - priority 2: keep current selection if still in conversations
  // - priority 3: don't auto-select anything (sidebar default = empty state)

openOrCreateAndSelectPrivateChatThunk(otherUserId)
  // - openOrCreatePrivateChatThunk
  // - addOpenTab
  // - setSelectedPrivateChatId
  // - fetch messages

handlePrivateChatReconnectionThunk()
  // - fetchPrivateChatsThunk
  // - refresh selected room if stale (same logic as public-chat handleReconnectionThunk)
```

### 6.4 Selectors

`src/redux/privateChat/privateChatSelectors.ts`:

```ts
selectPrivateConversations            // sorted by lastMessage.id desc (memoized)
selectPrivateConversationsLoading
selectSelectedPrivateChatId
selectSelectedPrivateConversation     // conversations[selectedChatId]
selectSelectedPrivateChatRoom         // loadedRooms.find(id === selectedChatId)
selectLoadedPrivateRooms
selectOpenPrivateChatTabs             // tabs ordered by privateChatUi.tabOrder, hydrated from conversations
selectUserSearchResults
selectUserSearchLoading
selectPrivateSearchedMessages
selectPrivateActiveRightPanel
selectPrivateStaleRoomIds
selectPrivateTopMostVisibleMessageId
selectPrivateChatScrollPositions
selectPrivateEditingMessage
selectPrivateJumpToMessageId
```

### 6.5 Store registration & persistence

Update `src/redux/store.ts`:

```ts
const privateChatPersistConfig = {
  key: 'privateChat',
  storage,
  whitelist: ['selectedChatId'],
};

const privateChatUiPersistConfig = {
  key: 'privateChatUi',
  storage,
  whitelist: ['openTabIds', 'tabOrder', 'sidebarVisible'],
};
```

Add to `combineReducers({... privateChat, privateChatUi})`.

`logoutThunk.pending` and `deleteAccountThunk.fulfilled` already reset the
full store except settings — private-chat state is wiped automatically. No
extra work needed.

---

## 7. Components

### 7.1 New page: `src/app/private/page.tsx`

Layout (desktop):

```
[ PrivateChatsSidebar (un-closable) ] | [ PrivateRoomTabs ]            [ RightPanel? ]
                                       | [ ChatSection / EmptyState ]
```

Layout (mobile): sidebar collapses to a sheet (matches existing
`Sheet`+`SheetTrigger` pattern from `Navbar.tsx`).

Structure (mirrors `src/app/page.tsx`):

```tsx
"use client";
export default function PrivateChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatRoomId = parseChatRoomIdFromParams(searchParams);

  // Gate: redirect unclaimed users
  useEffect(() => {
    if (user && !user.claimed) router.replace(ROUTES.HOME);
  }, [user?.id, user?.claimed]);

  const {
    conversations, conversationsLoading,
    selectedChat, selectedChatRoom, selectedChatLoading,
    openTabs,
    handleSelectChat, handleHideChat,
    handleStartChatWithUser
  } = usePrivateChats(user, chatRoomId);

  return (
    <div className="flex h-full w-full gap-x-4 p-2 pb-0 md:p-0 md:px-4">
      <PrivateChatsSidebar
        conversations={conversations}
        selectedChatId={selectedChat?.id ?? null}
        onSelect={handleSelectChat}
        onHide={handleHideChat}
        isLoading={conversationsLoading}
      />
      <div className="flex w-full h-full min-h-0 flex-1 flex-col min-w-0">
        <PrivateRoomTabs
          tabs={openTabs}
          selectedChatId={selectedChat?.id ?? null}
          onSelect={handleSelectChat}
          onClose={(roomId) => dispatch(removeOpenTab(roomId))}
        />
        <div className="min-h-0 flex-1">
          {!selectedChat ? (
            <PrivateChatEmptyState />
          ) : selectedChatLoading ? (
            <ChatSectionSkeleton />
          ) : (
            <PrivateChatSection
              privateChat={selectedChat}
              chatRoom={selectedChatRoom}
              currentUserId={user.id}
            />
          )}
        </div>
      </div>
      <PrivateRightPanel />
    </div>
  );
}
```

### 7.2 `PrivateChatsSidebar` (new)

`src/features/privateChat/components/PrivateChatsSidebar.tsx`.

- **Desktop**: rendered when `privateChatUi.sidebarVisible === true`,
  `w-[25%]` (matches `sidePanelDesktopClass`). Sidebar header has a close
  button; chat-section header shows a "Show conversations" button when
  the sidebar is hidden.
- **Mobile**: a left-slide `Sheet` (matches navbar's hamburger pattern)
  triggered by a button in the chat-section header. Reuse
  `Sheet`/`SheetContent` `side="left"`.
- Lists `PrivateChatDTO[]` sorted by `lastMessage.id desc`.
- Each row: counterpart username (large), last message preview (truncated),
  unread badge (or dot if `unreadMessagesCount === null`), blocked indicator,
  per-conversation mute toggle (Volume2 / VolumeX) wired to
  `useChatRoomSoundSettings(chatRoomId)` (already keyed by id, reusable
  as-is).
- Click → `handleSelectChat(conversation)`.
- Right-click / overflow menu → "Hide conversation" → `hidePrivateChatThunk`.
- Empty state: "No conversations yet — search for a user in the navbar to
  start a chat."

### 7.3 `PrivateRoomTabs` (new)

`src/features/privateChat/components/PrivateRoomTabs.tsx`.

- Same drag-and-drop pattern as `RoomTabs.tsx`, but adapted to
  `PrivateChatDTO`. Reuse `@dnd-kit` setup.
- Tab title: counterpart username. No noise indicator, no online count, no
  total-messages.
- Per-conversation mute toggle (Volume2 / VolumeX) — same control as
  public-chat tabs, wired to `useChatRoomSoundSettings(chatRoomId)`.
- Close button: removes from `openTabIds` only (doesn't hide the chat).
- Reorder writes to `tabOrder` in `privateChatUi`.
- Extract `RoomTabContent`'s glass styling into a shared
  `src/features/chatroom/components/tabStyles.ts` to avoid duplication.

### 7.4 `PrivateChatSection` (new)

`src/features/privateChat/components/PrivateChatSection.tsx`.

Two implementation options — we'll pick (a) for minimum churn:

**(a) New component, reuses `ConversationView` extracted from `ChatSection`.**

- Refactor `ChatSection.tsx`: extract the message list + composer block into
  a `ConversationView` component (takes `chatRoom`, `currentUserId`,
  `selectedUserChatRoom`-like-object, `onSendMessage`, `onEditMessage`,
  `onDeleteMessage`, `composerDisabled`, `composerDisabledReason`,
  `unreadDividerMessageId`, `lastReadMessage`).
- `ChatSection` becomes: `ChatSectionHeader` + `ConversationView`.
- `PrivateChatSection` becomes: `PrivateChatSectionHeader` + `ConversationView`.
- Skip the ad-serving logic for private chats (do not call `useAdServing`).

**(b) Keep `ChatSection` and write `PrivateChatSection` independently
(duplicating ~150 lines).** Considered, rejected — too much drift risk.

Going with (a).

### 7.5 `PrivateChatSectionHeader` (new)

`src/features/privateChat/components/PrivateChatSectionHeader.tsx`.

Shows:

- "Show conversations" sidebar toggle button (left edge) when
  `sidebarVisible === false` (desktop) or always on mobile (opens the
  left-slide sheet).
- Counterpart username + role badge if applicable. (Username remains
  clickable to open the existing `UserActionPopup` — that's how users
  block / report from here, so no separate block action in this header.)
- "Search messages" button → toggles `privateChatUi.activeRightPanel = 'search-messages'`.
- Overflow menu: "Hide conversation".
- If `privateChat.blocked === true`: small "Blocked" badge.

### 7.6 `PrivateRightPanel` (new)

`src/features/privateChat/components/PrivateRightPanel.tsx`.

- Identical shell to `RightPanel.tsx` but listens to
  `privateChatUi.activeRightPanel`.
- Only renders `SearchChatRoomMessages` (reuse the existing component as
  long as the search thunk it dispatches is for the current room id).
    - The existing `searchChatRoomMessagesThunk` works against `selectedChatRoom`
      — for private chat we either:
      (i) generalize it to accept an explicit roomId argument, OR
      (ii) create a `searchPrivateChatMessagesThunk` that writes to
      `privateChat.searchedMessages` instead of `chatRoom.searchedMessages`.
    - Choose (ii) so the two features stay decoupled.
- Hidden on desktop by default; reveals when the user clicks the search
  button in `PrivateChatSectionHeader`.

### 7.7 `SearchUsers` (new) — navbar search box variant

`src/features/privateChat/components/SearchUsers.tsx`.

- Mirrors `SearchRooms.tsx` (Popover + input + results dropdown).
- Debounced input dispatches `searchUsersThunk`.
- Results are `UserMinimalDTO[]`. Each row shows the username; click →
  `openOrCreateAndSelectPrivateChatThunk(user.id)` → router stays on
  `/private?chatRoomId=newId`.
- Mobile: same mobile dialog pattern as `SearchRoomsMobile.tsx`.

Mounted in `Navbar.tsx` only when `pathname === ROUTES.PRIVATE_CHAT && user.claimed`.

### 7.8 Hooks

`src/features/privateChat/hooks/usePrivateChats.ts` — mirrors
`useChatRooms.ts`:

- Initial fetch (`fetchPrivateChatsThunk`).
- Reconnection (`handlePrivateChatReconnectionThunk`).
- URL → selection resolution (`resolveSelectedPrivateChatThunk`).
- Exposes `handleSelectChat`, `handleHideChat`, `handleStartChatWithUser`.

`src/features/privateChat/hooks/useUserSearch.ts` — mirrors
`useRoomSearch.ts` but for the user search.

---

## 8. WebSocket integration

Extend `src/lib/hooks/useStompClient.ts`:

1. Add a new subscription target: `/user/queue/private-messages`. This is
   one subscription, regardless of how many private rooms the user has.
    - Added to the `targetTopics` array inside `manageSubscriptions(client)`,
      guarded by `user?.claimed` (don't subscribe for unclaimed users — the
      queue is empty for them anyway, but avoids a no-op subscription).
2. In `handleWebSocketMessage`, handle the three new types:
   ```ts
   case WebSocketMessageType.PRIVATE_NEW_MESSAGE:
     const newMsg = data as Message;
     dispatch(handlePrivateNewMessage({
       message: newMsg,
       isByCurrentUser: newMsg.senderId === user?.id
     }));
     if (newMsg.senderId === user?.id) {
       dispatch(updatePrivateLastReadMessage({ updatedMessage: newMsg, isByCurrentUser: true }));
     }
     break;

   case WebSocketMessageType.PRIVATE_MESSAGE_EDIT:
     dispatch(handlePrivateMessageEdit(data as Message));
     break;

   case WebSocketMessageType.PRIVATE_MESSAGE_DELETE:
     dispatch(handlePrivateMessageDelete(data as Message));
     break;
   ```
3. The reducer `handlePrivateNewMessage` must also handle **auto-unhide**:
   if the incoming `chatRoomId` is not currently in `conversations`,
   dispatch a refresh by chaining `fetchPrivateChatsThunk()` (the listener
   pattern: a thunk listens for the new-message action and refetches if the
   room is unknown). Implementation: do this inside the orchestrating
   thunk, not the reducer.

   The recommended flow is:
   ```ts
   // In useStompClient.ts, after dispatching handlePrivateNewMessage:
   const state = getState();
   const exists = selectPrivateConversations(state).some(c => c.id === newMsg.chatRoomId);
   if (!exists) dispatch(fetchPrivateChatsThunk());
   ```
   Cleanest place is a wrapping `handleIncomingPrivateMessageThunk` that
   does both. Implementing it as a thunk lets the WS handler stay slim.

4. Deduplication: per backend doc §5.3, the sender's own session may also
   receive a `PRIVATE_NEW_MESSAGE` for messages they just sent via REST.
   `handlePrivateNewMessage` reducer must dedupe by `message.id` before
   appending.

5. Reactions on private rooms still arrive via the existing
   `MESSAGE_REACTION_UPDATE` channel — the existing handler already updates
   `chatRoom.loadedChatRooms[*].messages[*].reactions`, but **not**
   `privateChat.loadedRooms`. v1 workaround: the existing reaction reducers
   should ALSO be wired to update `privateChat.loadedRooms` — either:
    - extract the `addChatRoomReaction` / `removeChatRoomReaction` helpers
      into a shared module and call them from a new
      `addPrivateMessageReaction` / `removePrivateMessageReaction` reducer
      in the private slice, then dispatch both from
      `useStompClient.ts` (one to chatRoom, one to privateChat); OR
    - the reaction WS handler does its own routing by checking which slice
      the messageId belongs to.
      We pick the **dispatch-both** approach: in the WS handler, after
      dispatching the existing `addMessageReaction`, also dispatch the new
      `addPrivateMessageReaction`. Both are no-ops if the message isn't in
      the slice's loaded rooms — implement the reducers to be no-op when the
      target message isn't found.

---

## 9. Permission & gating

| Scenario                              | UI behavior                                                                                                         |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `user.claimed === false`              | Hide navbar private-chat button. If user directly navigates to `/private`, redirect to `/`.                         |
| `user === null` (guest)               | `AuthGuard` redirects to `/auth`.                                                                                   |
| Logged in & claimed, no conversations | Sidebar shows empty state. ChatSection area shows `PrivateChatEmptyState`.                                          |
| Conversation `blocked === true`       | Show "Blocked" badge in header. Composer disabled with reason "You can't message this user." Read access preserved. |
| Send returns 403                      | Show toast "You can't message this user." Refetch the conversation list to update `blocked` flag.                   |
| List/open returns 403 (claim revoked) | Refetch `/users/me`; if `claimed === false`, redirect to `/`.                                                       |

The composer-disabled UX should reuse the existing `composerDisabled` pattern
from `ChatSection.tsx` (the `Lock`-icon banner).

---

## 10. Known gaps / v1 limitations

These come from `private-chat-frontend-doc.md`:

1. **Reactions over WebSocket** broadcast on the existing
   `MESSAGE_REACTION_UPDATE` channel. The backend doc says this is a known
   gap. Our workaround (see §8.5) — dispatch both public and private
   reducers and let them no-op when the message isn't loaded — is
   defensive and avoids correctness issues.
2. **`unreadMessagesCount === null`** means "never opened, has messages."
   Render an unread dot without a number. Distinct from `0` (all read).
3. **Hide is per-user**. Backend keeps history. We never call a "delete"
   endpoint.
4. **`chatRoomName` is always `null`** for private rooms. Never use it as
   a key; always route by `chatRoomId`. We need to audit `useChatRooms`-related
   code paths in the **public** chat that pivot on `chatRoomName` (e.g.
   `handleNewMessage` in `chatRoomSlice.ts`) — they're scoped to the public
   slice so are fine, but make sure we don't accidentally reuse them.

---

## 11. Resolved design decisions

1. **Notifications** — play the existing
   `useNotificationSounds.playNotificationSound` on inbound
   `PRIVATE_NEW_MESSAGE`, AND expose a per-conversation mute toggle on
   each sidebar row and tab. Reuse `useChatRoomSoundSettings` keyed by
   `chatRoomId` (it's already keyed by id, not name — should work as-is
   for private rooms). Persist mute state per room.
2. **Persistence of open tabs** — `openTabIds` and `tabOrder` persisted
   via redux-persist (matches public chat).
3. **Desktop sidebar — toggleable**, not un-closable. Same affordance as
   the current `LeftPanel`: a button to hide/show. Default-visible on
   first load.
    - New state: `privateChatUi.sidebarVisible: boolean` (default `true`),
      persisted via redux-persist.
    - The hide/show button lives in the chat-section header (left side)
      when the sidebar is hidden, and inside the sidebar's own header when
      visible (mirroring how Left/RightPanel reveal/dismiss works).
4. **Block from conversation header — skipped**. The username in
   `ChatMessage` is already clickable and exposes block via the existing
   `UserActionPopup`. Don't duplicate.
5. **Search in conversation** — same flow as public chat (right panel +
   jump-to-message). Implementation per spec §7.6.
6. **Mobile sidebar** — left-slide `Sheet`, opened from a button in the
   chat header. Matches the navbar's hamburger pattern.

---

## 12. Acceptance checklist

When implementation is done, the following must be true:

- [ ] Navbar shows a "Private messages" button for claimed users, hidden
  for unclaimed and guests.
- [ ] `/private` is gated by `claimed`; unclaimed users are redirected to `/`.
- [ ] Sidebar lists all non-hidden conversations, sorted by `lastMessage` desc.
- [ ] Clicking a sidebar item opens the conversation and adds a tab.
- [ ] Clicking the navbar search opens a user search; clicking a user
  opens or creates the chat.
- [ ] Sending, editing, deleting, reacting, attaching all work in
  private chats using the existing chatting endpoints.
- [ ] Real-time inbound messages on `PRIVATE_NEW_MESSAGE` append to the
  open chat AND bump the sidebar entry.
- [ ] A new message in a previously-hidden conversation auto-unhides it
  (sidebar refresh on unknown `chatRoomId`).
- [ ] Sender doesn't double-render its own message (dedupe by `message.id`).
- [ ] Hiding a chat removes it from the sidebar but leaves the public
  chat in `/` untouched.
- [ ] Reopening a hidden chat (search + click same user) brings it back.
- [ ] Public chat at `/` is unchanged — no regressions to existing
  `chatRoomSlice`, `chatRoomUiSlice`, `useStompClient` subscriptions,
  RoomTabs, LeftPanel, RightPanel, or message handling.
