# Typing indicators implementation handoff

Prepared on October 4, 2026 for the next engineer or agent working on this feature.

Reviewed and refined on October 5, 2026. The display now uses a compact incoming-style bubble and summarizes three or more typists by count. See the review notes below for the follow-up changes and verification.

Typing indicators are implemented in both repositories and remain uncommitted in the working trees. Frontend type-checking and backend compilation passed during implementation on October 3. No tests were added or run, and no deployment was performed. This handoff documents the current implementation, its verification limits, and how to continue safely.

## Repositories and constraints

- Frontend: `/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith`
- Backend: `/Users/markoangelovski/IdeaProjects/all-chat-monolith`
- The user approved indicators for joined rooms and existing private chats, always enabled, without a new privacy preference.
- Do not add or extend tests, and do not run test suites. Verify frontend changes with type-checking or a production build; verify backend changes with compilation only.
- Do not write migration scripts unless explicitly requested. This feature introduces no database schema changes, dependencies, or new infrastructure.
- Preserve the existing working-tree changes. The new files are untracked and must be included alongside modified files when preparing commits in each repository.

## Implemented behavior

- A left-aligned typing bubble appears inside the scrolling conversation after the latest messages, with the same `rounded-lg` corners, padding, shadow, and maximum width as incoming message bubbles. There is no separate strip or reserved space when nobody is typing.
- The bubble follows the scroll to the bottom only if the reader was already there before it appeared or grew. It scrolls naturally with the conversation, stays hidden when the loaded history has newer pages, and does not pull a reader away from older messages.
- One typist shows “Alice is typing…”, two show “Alice and Bob are typing…”, and three or more show “3 people are typing…” with the current count. This keeps busy-room activity compact.
- Names have a stable order by user ID. A user appears once even when typing from multiple sessions. The current user and locally blocked users are excluded from the display.
- Names truncate individually on narrow screens while “is/are typing…” stays visible. The full label is available as a title, text changes use a persistent polite live region, and animated dots respect reduced-motion preferences.
- Actual content changes start activity: typing, deletion while content remains, paste, emoji insertion, dictation, and IME input. Selection, focus alone, formatting-only changes, and programmatic editor prefill/clearing do not.
- The first activity sends immediately. Further content changes refresh at most once every four seconds while the local typing state remains active. There is no background heartbeat merely because a draft exists.
- Five seconds without content changes stops activity, even with an unsent draft. Clearing the draft, beginning a send, leaving the composer/conversation, hiding the page, losing window focus, socket loss, or disabling the composer also stops it. Content changes while the document is unfocused cannot restart activity (including dictation callbacks).
- Failed sends keep the draft. Activity resumes only after another edit, not automatically after failure or reconnection.
- Editing existing messages does not publish typing. Guests and admin observer/preview views do not participate. Private-chat eligibility remains limited by the existing claimed/staff rules.
- Enter during IME composition commits composition rather than prematurely submitting a message.

## Realtime contract and lifecycle

The feature reuses the app-level STOMP connection; it does not open another socket.

| Direction | Destination | Payload |
| --- | --- | --- |
| Client to server | `/app/chat.typing` | `{chatRoomId, typing}` |
| Server to client | `/topic/chat-typing.{chatRoomId}` | Existing WebSocket envelope with `type: "TYPING_UPDATE"` and `data: {chatRoomId, userId, username, typing, expiresInMs}` |

Identity and socket session come from the authenticated connection, never from the submitted payload. The existing Java WebSocket envelope serializer may include its polymorphic data discriminator in addition to these fields.

The frontend observes only the mounted, visible conversation. Navigation and visibility changes stop activity, unsubscribe, and clear received state. A reconnect restores the subscription but does not replay typing for an existing draft. Ownership tokens prevent delayed callbacks from old subscriptions or connections from changing current state.

The backend stores one watched room and at most one typing activity per socket session. It aggregates sessions by room/user, so a stop or disconnect in one tab does not erase activity in another. A ten-second server lease and a one-second cleanup task remove stale sessions. Clients also expire received activity with one deadline scheduler, capping leases at ten seconds from receipt.

## Main implementation files

### Frontend

| File | Responsibility |
| --- | --- |
| [typingStore.ts](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/lib/typingStore.ts) | Dedicated, non-persisted external store; typed transport, visible-room subscription ownership, expiry, and stable participant snapshots. Heartbeat-only renewals do not notify UI subscribers. |
| [useComposerTyping.ts](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/lib/hooks/useComposerTyping.ts) | Immediate start, four-second refresh throttle, five-second idle timer, and lifecycle stop behavior. |
| [TypingIndicator.tsx](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/features/chatroom/components/TypingIndicator.tsx) | Conversation subscription ownership, username/count aggregation, accessibility, and the in-conversation typing bubble with conditional scroll following. |
| [ConversationView.tsx](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/features/chatroom/components/ConversationView.tsx) | Shared placement and eligibility for room/private views; passes the typing room ID to the composer. |
| [ChatInput.tsx](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/features/chatroom/components/ChatInput.tsx) | Activity hook integration, send/blur cleanup, and suppression of programmatic editor updates. |
| [ChatComposerEditor.tsx](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/features/chatroom/components/ChatComposerEditor.tsx) | Compares document content without formatting marks, preserves emoji identity, and guards IME Enter. |
| [useStompClient.ts](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/lib/hooks/useStompClient.ts) | Installs the typing transport on the existing socket and releases it on disconnect/error/reconnect/account cleanup. |
| [TypingUpdate.ts](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/models/TypingUpdate.ts), [WebSocketMessage.ts](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/models/WebSocketMessage.ts), [WebSocketMessageType.ts](/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith/src/models/WebSocketMessageType.ts) | Matching event types. |

Typing state intentionally uses `useSyncExternalStore`, separate from persisted Redux/message state. The existing composer `isConnected` prop only indicates a loaded room; the activity hook additionally checks the real socket state exposed by the typing store.

### Backend

| File | Responsibility |
| --- | --- |
| [TypingController.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/controllers/TypingController.java) | Validated STOMP request handler; malformed activity remains best-effort. |
| [TypingService.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/services/TypingService.java) | Session/watch registry, user aggregation, coalescing, publication ordering, disconnect/expiry cleanup, and access-change handling. |
| [TypingAccessService.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/services/TypingAccessService.java) | Fresh transactional reads for membership, role, bans, verification requirements, archived/deleted rooms, public messaging availability, and private membership/block checks. |
| [TypingChannelInterceptor.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/configs/TypingChannelInterceptor.java) | Early per-user rate limit, subscription authorization, and rejection of direct publication to typing topics and wildcard subscription bypasses. |
| [WebSocketConfig.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/configs/WebSocketConfig.java), [UserInterceptor.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/configs/UserInterceptor.java) | Registers interceptors, preserves receive/publish order, checks outgoing deliveries against authorized watches, and avoids duplicate permission reads for typing. |
| [TypingAccessChangedEvent.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/events/TypingAccessChangedEvent.java) | Access invalidation selectors; null user/room selectors match all. |
| [TypingRequestDTO.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/dtos/requests/TypingRequestDTO.java), [TypingUpdateDTO.java](/Users/markoangelovski/IdeaProjects/all-chat-monolith/chat/src/main/java/com/mk3/chatapp/dtos/responses/TypingUpdateDTO.java) | Request and response contracts. Backend WebSocket enum/envelope also register `TYPING_UPDATE`. |

Access invalidation is integrated into `WebSocketBroadcastServiceImpl` for existing permission-related broadcasts, `UserChatRoomServiceImpl` for membership removal, `UserServiceImpl` for blocking/account deletion, and `IpServiceImpl` for changed IP verification requirements. `TypingService` also listens directly to `IdVerificationRequiredEvent`, because its existing notification is already emitted after commit.

The shared rate limiter allows 120 typing SEND/SUBSCRIBE frames per user per minute before expensive permission checks. Duplicate stops are ignored; accepted activity refreshes are coalesced. Outgoing recipient authorization is a memory lookup, not a database query per recipient. Activity does not write messages, unread counts, notifications, room popularity, or persistent typing data.

## Verification performed

These checks passed on October 3, 2026, after the implementation edits:

```sh
cd /Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith
npx tsc --noEmit --incremental false
git diff --check
```

```sh
cd /Users/markoangelovski/IdeaProjects/all-chat-monolith
./mvnw -DskipTests compile
git diff --check
```

The backend used Java 21 and completed all reactor modules successfully. Compilation emitted existing Lombok/mapper warnings. No test suites, application startup checks, browser end-to-end checks, or performance benchmarks were run. Creating this documentation did not rerun compilation.

## October 5 review and design update

- Reviewed the frontend store, composer lifecycle, socket integration, backend access checks, session aggregation, expiry, and access invalidation. Multiple distinct typists are supported; one user's multiple sessions share one displayed identity, and stopping one session preserves another active session.
- Replaced the plain status line with the bubble described above. Following design feedback, moved it into the conversation and matched existing message geometry, removing the reserved composer strip. It uses theme colors for light/dark mode, a persistent screen-reader status, independently truncated names, and reduced-motion-aware dots. Typing activity does not create message records.
- Simplified busy-room wording to an exact count for three or more visible typists. Self and blocked-user filtering happens before calculating that count.
- Fixed an unfocused-window edge case in `useComposerTyping`: content callbacks such as dictation can no longer restart activity after the window-blur stop.
- Design reference: [Stream's typing-indicator guidance](https://getstream.io/chat/docs/sdk/react/guides/customization/typing-indicator/) recommends filtering the current user and summarizing typing users in busy channels. The bubble shape is an application design choice, not a universal platform requirement.
- Verification passed: frontend `npm run build` (including type validation and all 31 static pages), backend `./mvnw -DskipTests compile` (all modules successful, already up to date), and `git diff --check` in both repositories. No tests were added or run. Multi-client runtime behavior and browser appearance remain unverified; the known limitations below still apply.
- After moving the bubble into the conversation, frontend `npx tsc --noEmit --incremental false` and `git diff --check` passed. No tests were added or run for this refinement.

## Delivery and continuation notes

1. Review both working trees and include all new source files when preparing commits. Implementation already exists; do not regenerate it from the plan.
2. If code changes, repeat the allowed type/compile checks above. Keep the no-tests and no-migrations constraints.
3. Deploy the backend before the frontend. No deployment has been executed from this chat.

Known limits and integration details to retain during review:

- Server state is local to the current in-process Spring broker. Cross-instance delivery requires a separate broker/scaling change and is outside this implementation.
- Subscribing does not request a snapshot of existing typists. A newly opened room learns about them on subsequent accepted activity updates.
- Denied subscriptions are silently dropped. A watch removed after lost access is re-established by a subsequent subscription, such as navigation, an eligibility change in the UI, or reconnection; there is no separate acknowledgement/retry protocol.
- Receive/publish ordering is enabled globally in the WebSocket configuration. The new interceptor rejects wildcard characters in all subscription destinations; the existing frontend uses exact destinations.
- Runtime behavior remains unverified. If later validation is authorized, focus on multiple typists, idle drafts, send failure, IME/emoji/dictation, room switching, hidden tabs, reconnects, simultaneous sessions, access revocation, and stable mobile layout. This is a record of coverage gaps, not permission to add or run tests.
