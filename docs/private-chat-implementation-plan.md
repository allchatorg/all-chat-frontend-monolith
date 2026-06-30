# Private Chat — Implementation Plan

> Companion to `docs/private-chat-spec.md`.
> Phased, top-to-bottom checklist. Each phase is independently
> review/merge-able. Phase numbers map to the spec's section numbering
> where applicable.

---

## Phase 0 — Confirmed design decisions (resolved)

Per spec §11:

- Notification sounds: **yes**, with per-conversation mute via the
  existing `useChatRoomSoundSettings` (keyed by `chatRoomId`).
- Open tabs + tab order: persisted via redux-persist.
- Desktop sidebar: **toggleable** via `privateChatUi.sidebarVisible`
  (default `true`, persisted). Show/hide button in the chat-section
  header / sidebar header.
- Block user from conversation header: **skipped** — username click in
  `ChatMessage` already opens `UserActionPopup` with block/report.
- Mobile sidebar: left-slide `Sheet`.

Still confirm backend access — if we hit gaps mid-implementation (e.g.
the reaction-WS gap), we may need backend changes.

---

## Phase 1 — Skeleton (no UI, no routing impact)

Goal: scaffold the redux + api layers with zero UI integration. Verifies
type wiring before any rendering.

1. **Models** (`src/models/`):
    - [ ] `PrivateChatDTO.ts`
    - [ ] `UserMinimalDTO.ts`
2. **Enum extension**:
    - [ ] `WebSocketMessageType.ts` — add `PRIVATE_NEW_MESSAGE`,
      `PRIVATE_MESSAGE_EDIT`, `PRIVATE_MESSAGE_DELETE`.
    - [ ] `WebSocketMessage.ts` — add the three new variants (all carry
      `data: Message`, `chatRoomName: null`).
3. **API** (`src/api/privateChat/privateChatAPI.ts`):
    - [ ] `listPrivateChats`, `openOrCreatePrivateChat`, `openPrivateChat`,
      `hidePrivateChat`, `searchUsers` — all wired to backend per
      `private-chat-frontend-doc.md`.
4. **Redux slices** (`src/redux/privateChat/`):
    - [ ] `privateChatSlice.ts` with state shape from spec §6.1 and stub
      reducers (no logic in the WS-handler reducers yet — just return
      state).
    - [ ] `privateChatUiSlice.ts` with state shape from spec §6.2.
5. **Thunks** (`src/redux/privateChat/privateChatThunk.ts`):
    - [ ] `fetchPrivateChatsThunk`, `openOrCreatePrivateChatThunk`,
      `openPrivateChatThunk`, `hidePrivateChatThunk`,
      `fetchPrivateChatMessagesThunk`, `searchUsersThunk`,
      `acknowledgePrivateMessageThunk` (reuses
      `chatRoomInteractionAPI.updateLastReadMessage`).
    - [ ] Orchestrating thunks: `selectAndLoadPrivateChatThunk`,
      `openOrCreateAndSelectPrivateChatThunk`,
      `resolveSelectedPrivateChatThunk`,
      `handlePrivateChatReconnectionThunk`.
    - [ ] Sending / editing / deleting reuse existing `saveAndBroadcastMessage`,
      `editMessage`, `deleteMessage` from `chattingAPI.ts` — wrap them as
      `sendPrivateMessageThunk`, `editPrivateMessageThunk`,
      `deletePrivateMessageThunk` so the slice's extraReducers fire on
      them. (Or share with the existing thunks and add the extraReducer
      cases to both slices.)
6. **Selectors** (`src/redux/privateChat/privateChatSelectors.ts`):
    - [ ] Full list from spec §6.4.
    - [ ] `selectPrivateConversations` is a `createSelector` that sorts by
      `lastMessage.id desc`, falling back to `lastMessage.createdAt`.
7. **Store wiring** (`src/redux/store.ts`):
    - [ ] Register `privateChat` and `privateChatUi` reducers.
    - [ ] Add `privateChatPersistConfig` (`whitelist: ['selectedChatId']`)
      and `privateChatUiPersistConfig`
      (`whitelist: ['openTabIds', 'tabOrder']`).
    - [ ] No changes to `logoutThunk` / `deleteAccountThunk` reset logic
      needed (the rootReducer already wipes everything).

**Exit criteria**: `npm run build` (or `tsc --noEmit`) passes; redux devtools
shows the new slices on app load.

---

## Phase 2 — Reducer logic for slice

Goal: implement the slice reducer bodies, including the WebSocket-driven
ones. No UI yet — we test by dispatching from devtools / unit tests.

1. **`privateChatSlice` reducers**:
    - [ ] `setSelectedPrivateChat`, `setLoadedPrivateChatRoom`,
      `removeLoadedPrivateChatRoom`, `clearConversations`.
    - [ ] `handlePrivateNewMessage`:
        - dedupe by `message.id` against the room's existing messages,
        - append to `loadedRooms[chatRoomId].messages`,
        - update the matching `conversations[i].lastMessage`,
        - if `isByCurrentUser`: reset `unreadMessagesCount = 0`; else
          increment (treat `null` as 1).
    - [ ] `handlePrivateMessageEdit`: replace message by id in
      `loadedRooms`; refresh `conversations[i].lastMessage` if it
      matches.
    - [ ] `handlePrivateMessageDelete`: mark `deleted: true` on the
      message and update last-message if applicable.
    - [ ] `addPrivateMessageReaction`, `removePrivateMessageReaction` — copy
      the helper functions from `chatRoomSlice.ts`. Be no-op when the
      message isn't loaded (so the dual-dispatch from WS handler is safe).
    - [ ] `updatePrivateUserMessageColor` — same as public.
    - [ ] `updatePrivateLastReadMessage` — same pattern.
2. **`privateChatSlice` extraReducers**:
    - [ ] `fetchPrivateChatsThunk.{pending,fulfilled,rejected}` →
      populates `conversations`.
    - [ ] `openOrCreatePrivateChatThunk.fulfilled` → upsert into
      `conversations`, set `selectedChatId`.
    - [ ] `openPrivateChatThunk.fulfilled` → upsert (handles unhide),
      set `selectedChatId`.
    - [ ] `hidePrivateChatThunk.fulfilled` → remove from
      `conversations`, clear `selectedChatId` if matched.
    - [ ] `fetchPrivateChatMessagesThunk.fulfilled` → identical pagination
      merge logic to the public-chat version (copy from
      `chatRoomSlice.ts` lines 930–983).
    - [ ] `searchUsersThunk.{pending,fulfilled,rejected}` → populates
      `userSearchResults` and `userSearchLoading`.
    - [ ] `searchPrivateChatMessagesThunk.fulfilled` → populates
      `searchedMessages`.
    - [ ] `acknowledgePrivateMessageThunk.fulfilled` → set conversation
      `lastReadMessage` and `unreadMessagesCount = 0`.
3. **`privateChatUiSlice` reducers**:
    - [ ] `addOpenTab(roomId)` — push if not present.
    - [ ] `removeOpenTab(roomId)` — filter out.
    - [ ] `reorderTabs(ids)`.
    - [ ] Scroll position, topmost message, jump-to, editing,
      stale handling — direct copies from `chatRoomUiSlice.ts`.
    - [ ] `setPrivateActiveRightPanel`.
    - [ ] `setPrivateSidebarVisible(boolean)` / `togglePrivateSidebar()`.
    - [ ] extraReducers:
        - `fetchPrivateChatsThunk.fulfilled` reconciles `tabOrder` with the
          returned conversation ids (drop tabs for rooms no longer in the
          list — matches `chatRoomUiSlice`'s `fetchJoinedUserChatRoomsThunk`
          handler).
        - `hidePrivateChatThunk.fulfilled` removes from `openTabIds` and
          `tabOrder`.

**Exit criteria**: unit tests (if we add any) pass; manual devtools
dispatch results in the expected state transitions.

---

## Phase 3 — WebSocket integration

Goal: wire `useStompClient.ts` to subscribe to the new queue and route
events.

1. [ ] In `useStompClient.ts`, inside `manageSubscriptions`:
    - Add `/user/queue/private-messages` to `targetTopics` when `userRef.current?.claimed === true`.
    - Single subscription per session — already handled by the
      `subscriptionsRef` dedupe logic.
2. [ ] In `handleWebSocketMessage`, add the three cases per spec §8:
    - `PRIVATE_NEW_MESSAGE`: dispatch `handlePrivateNewMessage` AND
      conditionally `fetchPrivateChatsThunk()` if the conversation is not
      known.
    - `PRIVATE_MESSAGE_EDIT`: dispatch `handlePrivateMessageEdit`.
    - `PRIVATE_MESSAGE_DELETE`: dispatch `handlePrivateMessageDelete`.
3. [ ] In the existing `MESSAGE_REACTION_UPDATE` case, ALSO dispatch the
   new `addPrivateMessageReaction` / `removePrivateMessageReaction`.
   The private-slice reducers are no-ops when the message is not loaded.
4. [ ] Add reconnection support: extend the existing reconnection effect
   in `useChatRooms` OR add a parallel one in `usePrivateChats` that
   dispatches `handlePrivateChatReconnectionThunk` on `justReconnected`.

**Exit criteria**: with the backend running, the browser STOMP frame log
shows a single SUBSCRIBE to `/user/queue/private-messages`, and incoming
events visibly mutate the (still-headless) redux state.

---

## Phase 4 — Routing & navbar entry

Goal: get the user to a (still-empty) `/private` route.

1. [ ] `src/routes.ts`: add `ROUTES.PRIVATE_CHAT = '/private'`, include in
   `PROTECTED_ROUTES`.
2. [ ] `src/components/Navbar.tsx`:
    - Add the private-chat button next to "Advertise" / "Report bug" /
      "Settings". Visible only when `user && user.claimed`. Mobile parity
      via the overflow dropdown.
    - When `pathname === ROUTES.PRIVATE_CHAT`, swap `SearchRooms` for
      `SearchUsers` (created in Phase 6).
3. [ ] Create `src/app/private/page.tsx` with the layout skeleton from
   spec §7.1 but importing placeholder components (return `null` for the
   private-specific ones). Verifies AuthGuard + route wiring.
4. [ ] In `src/app/private/page.tsx`, add the gating effect: if
   `user && !user.claimed`, `router.replace(ROUTES.HOME)`.

**Exit criteria**: clicking the navbar button navigates to `/private`,
which renders a placeholder page. Unclaimed users get redirected.

---

## Phase 5 — Refactor ChatSection for reuse

Goal: extract `ConversationView` so both public and private chat sections
can compose it.

1. [ ] In `src/features/chatroom/components/`:
    - Extract from `ChatSection.tsx` the inner block (CardContent down to
      ChatInput) into a new `ConversationView.tsx`.
    - Props: `chatRoom`, `currentUserId`, `currentUsername`,
      `unreadDividerMessageId`, `composerDisabled`, `composerDisabledReason`,
      `editingMessage`, `onSendMessage`, `onEditMessage`, `onCancelEdit`,
      `onRemoveMessage`, `blockedUserIds`, `interactionsDisabled` (= isArchived),
      `showAds: boolean` (false for private), `selectedUserChatRoomLike`
      (object exposing `lastReadMessage`, `unreadMessagesCount`).
    - `ChatSection.tsx` becomes thin: assembles header + ConversationView
      and supplies `showAds={true}`, uses public-chat redux selectors.
2. [ ] Confirm no public-chat regressions:
    - Manually exercise: send, edit, delete, react, attach, jump-to,
      ban/unban, archive/unarchive, message-search, top-reacted, popularity
      panel, mobile layout.
    - Verify the `useChatScrollAndPagination` hook still receives the
      correct `chatRoom` reference.

**Exit criteria**: public chat at `/` behaves identically to before the
refactor.

---

## Phase 6 — Private-chat UI components

Goal: build the private-chat-specific UI on top of `ConversationView`.

1. [ ] `src/features/privateChat/hooks/usePrivateChats.ts` — mirrors
   `useChatRooms.ts` but for private chat.
2. [ ] `src/features/privateChat/hooks/useUserSearch.ts` — mirrors
   `useRoomSearch.ts` but for `searchUsersThunk`.
3. [ ] `src/features/privateChat/components/SearchUsers.tsx` — mirrors
   `SearchRooms.tsx`; in mobile mode opens a dialog like
   `SearchRoomsMobile.tsx` (copy the pattern, swap thunk and shape).
4. [ ] `src/features/privateChat/components/PrivateChatsSidebar.tsx`:
    - Desktop: rendered when `privateChatUi.sidebarVisible === true`,
      `w-[25%]`. Reuse `sidePanelDesktopClass` from
      `sidePanelGlassClasses.ts`. Header has a close button that dispatches
      `togglePrivateSidebar()`.
    - Mobile: left-slide `Sheet` opened from a button in
      `PrivateChatSectionHeader`.
    - List items: counterpart username, last message preview, unread
      badge/dot, blocked indicator, per-room mute toggle (wired to
      `useChatRoomSoundSettings(chatRoomId)`).
    - Right-click / overflow menu: "Hide conversation".
5. [ ] `src/features/privateChat/components/PrivateRoomTabs.tsx`:
    - Reuse `@dnd-kit` setup from `RoomTabs.tsx`.
    - Tab title = counterpart username. No noise / online counts.
    - Per-tab mute toggle (same control as public tabs, via
      `useChatRoomSoundSettings(chatRoomId)`).
    - Close button removes from `openTabIds` only.
6. [ ] `src/features/privateChat/components/PrivateChatSectionHeader.tsx`:
    - Sidebar show/hide toggle on the left (desktop) — opens the mobile
      sheet on small screens.
    - Counterpart name + role badge. Username remains clickable through
      `UserActionPopup` (handled in `ChatMessage`) so no separate block.
    - Search-messages toggle button (toggles
      `privateChatUi.activeRightPanel`).
    - Overflow menu: Hide conversation.
7. [ ] `src/features/privateChat/components/PrivateChatSection.tsx`:
    - Composes `PrivateChatSectionHeader` + `ConversationView`.
    - Wires send/edit/delete via the new private thunks (or reused chat
      thunks — both work; pick the private wrappers so extraReducers fire on
      the private slice).
    - Computes `composerDisabled = blocked` and the reason text.
8. [ ] `src/features/privateChat/components/PrivateRightPanel.tsx`:
    - Mirrors `RightPanel.tsx`. Only renders `SearchChatRoomMessages`
      variant when `activeRightPanel === 'search-messages'`.
    - Use a generalized or duplicated `SearchChatRoomMessages` that
      dispatches `searchPrivateChatMessagesThunk` and reads
      `selectPrivateSearchedMessages`.
9. [ ] `src/features/privateChat/components/PrivateChatEmptyState.tsx`:
    - "Search for a user in the navbar to start a new chat."
10. [ ] Wire all of them into `src/app/private/page.tsx` per spec §7.1.

**Exit criteria**:

- Sidebar loads from `fetchPrivateChatsThunk`.
- Navbar user search creates/opens chats.
- Clicking a conversation opens it; tab appears.
- Messages send, edit, delete, react, attach.
- Hiding a conversation removes it from the sidebar without affecting
  public chat.
- Inbound `PRIVATE_NEW_MESSAGE` mutates the open chat AND bumps the
  sidebar; auto-unhide works for previously-hidden conversations.

---

## Phase 7 — Edge cases, error handling, polish

1. [ ] **403 on send** → toast "You can't message this user.", refetch
   the conversation list so `blocked` flag updates.
2. [ ] **403 on list/open** → refetch `/users/me`; if claim revoked,
   redirect to `/`.
3. [ ] **400 on create** → toast "User not available."
4. [ ] **Sender dedupe**: confirm in `handlePrivateNewMessage` that the
   sender's own REST-then-WS path doesn't double-render.
5. [ ] **Mobile layout**: confirm sidebar sheet works; confirm chat
   section uses full width on mobile when sidebar is closed.
6. [ ] **Persistence**: confirm reload restores `selectedChatId` (if the
   conversation still exists) and `openTabIds` / `tabOrder`.
7. [ ] **Unread divider**: confirm `unreadDividerMessageId` calculation
   in `ConversationView` works for private rooms (it should — same
   inputs).
8. [ ] **Notification sounds**: wire `useNotificationSounds.playNotificationSound`
   into the inbound handler (in `PrivateRoomTabs` or
   `PrivateChatsSidebar` — see how `RoomTabItem.tsx` does it). Respect
   the per-room mute via `useChatRoomSoundSettings`.

---

## Phase 8 — Manual QA pass

Run through `private-chat-spec.md` §12 acceptance checklist end-to-end.
Cross-browser: at least Chrome + Safari (Safari has had scroll-anchoring
quirks per `useChatScrollAndPagination.ts`).

Also smoke-test public chat at `/`:

- All RoomTabs behavior.
- LeftPanel (top-reacted), RightPanel (top-online, search-messages,
  mod-view).
- Ban/unban, archive/unarchive flows.
- STOMP reconnection.
- Verify only one new STOMP subscription was added globally.

---

## Phase 9 — Optional: shared helpers cleanup

Strictly post-merge cleanup. Skip if pressed for time.

- [ ] Hoist `addReactionRequestToMessage`, `removeReactionRequestFromMessage`,
  `getLastNonAdvertMessage` into `src/redux/messages/messageReducers.ts`
  so both slices import them.
- [ ] Hoist tab-style classes from `RoomTabItem.tsx` into a shared
  `tabStyles.ts`.
- [ ] Reconsider whether `ConversationView` should be the canonical
  conversation primitive across the app (it likely should).

---

## Risks & mitigations

| Risk                                                                        | Mitigation                                                                                                                           |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Reaction WS gap on private rooms (backend §4.6)                             | Dual-dispatch reducers (safe no-op when message not loaded). Optimistic update on reactor's side. Refetch room on reopen.            |
| `ChatSection` refactor breaks public chat                                   | Do refactor as its own commit (Phase 5). Manual QA before moving on.                                                                 |
| STOMP subscription explosion for users with many rooms                      | Backend says ONE subscription handles all private chats — confirmed safe.                                                            |
| Double-renders from REST + WS on sender                                     | Dedupe by `message.id` in `handlePrivateNewMessage` reducer.                                                                         |
| Stale `selectedChatId` after a hidden conversation is restored from persist | On boot: if `selectedChatId` is set but not in fetched `conversations`, clear it. Add to `fetchPrivateChatsThunk.fulfilled` reducer. |
| Claim state changes mid-session (server-side promotion/demotion)            | Already handled — `ROLE_UPDATE_NOTIFICATION` forces a reload.                                                                        |

---

## Suggested commit boundaries

Each row below is a single commit / mergeable PR.

1. `feat(private-chat): scaffold models, API client, WebSocket enum` (Phase 1, items 1–3)
2. `feat(private-chat): redux slices and store registration` (Phase 1, items 4–7)
3. `feat(private-chat): slice reducer logic` (Phase 2)
4. `feat(private-chat): wire STOMP private-messages queue` (Phase 3)
5. `feat(private-chat): add /private route and navbar entry` (Phase 4)
6. `refactor(chatroom): extract ConversationView from ChatSection` (Phase 5)
7. `feat(private-chat): sidebar, tabs, header, section, search UI` (Phase 6)
8. `feat(private-chat): error handling and polish` (Phase 7)
9. (post-merge) `refactor(redux): hoist shared message reducer helpers` (Phase 9)
