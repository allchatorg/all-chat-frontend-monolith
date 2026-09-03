# Room Promotions — Frontend Progress

Feature: any claimed user pays $2.50 to promote a public chat room; admin approval (hold → capture / release);
promoted rooms listed in a "Promoted" tab of the Active Rooms right panel (newest approval on top, never expires,
max 25 pages); portal "My Room Promotions" + admin review queue with deny reason.
Full plan: `~/.claude/plans/unified-skipping-meteor.md` (Plans B + C). Backend counterpart:
`all-chat-monolith/docs/room-promotions/PROGRESS.md`.

## C1 — Portal models + RTK slices + store
- [x] `src/portal/models/room-promotion.ts` (`RoomPromotionStatus`, `RoomPromotion`, `RoomPromotionDetail`, requests, ban summary)
- [x] `src/portal/store/services/roomPromotionsApi.ts` (tag `RoomPromotions`)
- [x] `src/portal/store/services/adminRoomPromotionsApi.ts` (tag `AdminRoomPromotions`)
- [x] Registered both in `src/redux/store.ts`

## B1 — Chat models, API, thunk, slice, selectors
- [x] `src/models/PromotedRoom.ts`, `src/models/RoomPromotionEvent.ts`
- [x] `WebSocketMessageType.ROOM_PROMOTION_UPDATE`, `WebSocketMessage.ts` union variant, `NotificationType.ROOM_PROMOTION_*`
- [x] `chatRoomInteractionAPI.getPromotedRoomsPaginated(page, pageSize)` → `GET /chat-rooms/promoted`
- [x] `fetchPromotedRoomsPaginatedThunk`; slice `chatRoomsLeaderBoard.promotedChatRooms` + `roomPromotionUpdateCounter`
  + `applyRoomPromotionUpdate`; selectors `selectPromotedChatRoomsState` / `selectRoomPromotionUpdateCounter`

## B2 — WebSocket + notifications
- [x] `useStompClient.ts` `ROOM_PROMOTION_UPDATE` case (counter bump + RTK tag invalidation) + toast polarity
- [x] `notificationVisuals.tsx` entries (Rocket / XCircle / Ban), `notificationRoutes.ts` `ROOM_PROMOTION` → `/portal/room-promotions/{id}`

## B3 — Promote Room modal + header button
- [x] `PromoteRoomModal.tsx` (Payment → Confirm stepper, "How room promotions work" info view, success → portal)
- [x] `ChatSectionHeader.tsx` Rocket button (desktop + mobile), `ClaimAccountPrompt` for UNCLAIMED_USER, hidden for archived/special rooms and guests

## B4 — Active | Promoted tabs
- [x] `PopularChatRoomsSection.tsx` segmented tabs; filters/polling gated per tab; promoted list refetches on WS counter + 10 s poll
- [x] `PopularityRoomCard.tsx` optional `promotedAt` amber badge ("Promoted … ago")

## B5 — Archive dialog
- [x] `RoomPromotionsSummary.ts` + archive-confirm warning sentence for room promotions in `ChatSectionHeader`

## C2 — Shared portal components
- [x] `src/portal/components/room-promotions-table.tsx` (exports `getRoomPromotionStatusBadgeClass`)
- [x] `src/portal/components/room-promotion-details.tsx` (deny/cancel reason box, chat-room section)
- [x] `promotion-reason-modal.tsx` new modes `room-deny | room-cancel-pending | room-cancel-approved | room-request-cancel`

## C3 — User pages
- [x] `/portal/room-promotions` list, `/portal/room-promotions/[id]` detail (request-cancel PENDING only)

## C4 — Admin pages
- [x] `/portal/admin/room-promotions` queue (default PENDING, oldest first, debounced search)
- [x] `/portal/admin/room-promotions/[id]` approve / deny / cancel (gated by existing `AdminRoute`)

## C5 — Sidebar, redirect funnel, dashboard unlock
- [x] `app-sidebar.tsx` "My Room Promotions" + admin "Room Promotions" (`IconRocket`); `hasPromotion` ORs room promotions
- [x] `src/app/portal/layout.tsx` exempts `/portal/room-promotions*` from the no-ads funnel

## Build
- [x] `npx tsc --noEmit` clean, `npm run build` passes

## Deviations / notes
- **Admin dashboard revenue (2026-09-03)**: `admin-section-cards.tsx` shows three room-promotion cards (today /
  pending holds / all-time), `chart-room-promoted-revenue.tsx` is a violet clone of the message chart, and
  `chart-bar-revenue.tsx` has a third `roomPromotedRevenue` series (`promotedRevenue` is message-only again).
  RTK: `useGetRoomPromotedRevenueSummaryQuery` / `useGetRoomPromotedRevenueDailyQuery` (super admin endpoints).
- **Archive refund window (2026-09-03)**: the archive confirm dialog now renders `ArchiveRoomPromotionsWarning`
  (via a new `children` slot on `ConfirmModal`) with a refund/release/kept breakdown. Room promotions are refunded
  only if approved within `roomPromotionRefundWindowHours` (24); older approved ones are canceled and the money kept.
  `RoomPromotionsSummary` gained `roomPromotionApprovedRefundableCount/NonRefundableCount/NonRefundableTotal/RefundWindowHours`.
- **Post-review changes (user decisions)**: staff (`isStaffMember()`) never see the Promote Room button or the
  Promote Message menu item (backend 403 too); the owner's APPROVED self-cancel was removed for room promotions
  (no refund → pointless), so `roomPromotionsApi` has no `cancelRoomPromotion`. PENDING still uses request-cancel.
- `src/models/WebSocketMessage.ts` is a discriminated union, so a `ROOM_PROMOTION_UPDATE` variant was added (the plan
  only listed the enum) — otherwise the new `switch` case in `useStompClient.ts` does not type-check.
- Promoted tab keeps a 10 s poll (like the Active tab) on top of the WS-driven refetch so live online/active counts stay fresh.
- "Open Room" is hidden on the portal detail pages when `chatRoomArchived` (mirrors hiding "Go to Message" for deleted messages).
- Dashboard "Promotion Spend" card stays message-only — no room-promotion spend endpoint (follow-up if wanted).
- `RoomPromotionsSummary` room fields are read with `?? 0` so an older backend without them still renders the archive dialog.

## Backend contract assumptions (field names the BE must honor)
Envelope: Spring `Page<T>`. Enum strings `PENDING|APPROVED|DENIED|CANCELED`, `USER|ADMIN|SYSTEM_BAN`.
`GET /api/v1/chat-rooms/promoted?page&pageSize` → rows `{roomId, roomName, activeUsersCount, onlineUsersCount,
totalMessagesCount, noiseLevel, archived, promotedAt}` (`totalPages ≤ 25`).
WS `ROOM_PROMOTION_UPDATE` on `/topic/public-chat` + `/topic/user.{ownerId}`:
`{chatRoomId, chatRoomName, promotionId, status, ownerId, approvedAt|null}`.
`RoomPromotion` row: `id, chatRoomId, chatRoomName, status, amount, currency, submittedAt, approvedAt, email?, userId?, cancelRequested`;
detail adds `chatRoomArchived, canceledBy, reason, resolvedAt, cardBrand, cardLast4, receiptStatus, cancelRequestReason, cancelRequestedAt`.
User API `/api/v1/ads-portal/room-promotions` (POST `/`, GET `/`, GET `/{id}`, POST `/{id}/request-cancel`);
admin `/api/v1/ads-portal/admin/room-promotions` (GET `/`, GET `/{id}`, POST `/{id}/approve`, POST `/deny`, POST `/cancel`, GET `/ban-summary/{userId}`).
Errors surface `{message}` from the body (409 duplicate pending, 400 ineligible room).
