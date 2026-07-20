# Promoted Messages — Frontend Progress

Feature: promote-own-message stepper modal ($0.50, card selection), badge + per-room sidebar + WS live updates, portal "My Promoted Messages" + admin review tab, revenue chart series, ban modal info.
Full plan: `~/.claude/plans/okay-so-i-am-polished-pretzel.md`

## F1 — RTK services + promote modal + menu item
- [x] `src/portal/models/promoted-message.ts`
- [x] `src/portal/store/services/promotedMessagesApi.ts`
- [x] `src/portal/store/services/adminPromotedMessagesApi.ts`
- [x] Register both in `src/redux/store.ts`
- [x] `src/features/chatroom/components/PromoteMessageModal.tsx` (stepper: card select → explanation → success + portal redirect; Stripe Elements wrap if needed)
- [x] `MessageMenu.tsx` "Promote Message" item (own, not deleted/archived, no active promotion, not observer/private)
- [x] `src/models/message.ts` `promotion` field

## F2 — Badge, sidebar, WebSocket, delete toast, deep link
- [x] `MessageItem.tsx` PROMOTED badge (APPROVED, everyone) + PROMOTION PENDING (owner/staff); `ChatMessage.tsx` amber ring; dark mode
- [x] `PromotedMessagesSection.tsx` sidebar (copy TopReactedMessagesSection; newest first; jump-to-message; mobile close)
- [x] `ActiveLeftPanel.ts` + `LeftPanel.tsx` + `usePromotedMessagesSidebar.ts` + `ChatSectionHeader.tsx` toggle
- [x] API `fetchPromotedMessages` + thunk + `chatRoomSlice` state (`promotedMessages`, `promotionUpdateCounter`, `applyPromotionUpdate`)
- [x] `WebSocketMessageType.ts` + `useStompClient.ts` PROMOTED_MESSAGE_UPDATE handler
- [x] Fix missing `await` in `deleteMessageThunk`; 409 toast in `ChatSection.tsx`
- [x] Deep link: `messageId` param in `src/app/page.tsx` → setJumpToMessageId

## F3 — Portal user side
- [x] Nav items in `app-sidebar.tsx` (user + admin)
- [x] `/portal/promoted-messages` list page + `promoted-messages-table.tsx`
- [x] `/portal/promoted-messages/[id]` detail (preview, payment, reason, Go to message, Cancel confirm, Delete after canceled/denied)

## F4 — Portal admin side + ban modal
- [x] `/portal/admin/promoted-messages` (default PENDING, oldest first, filters, debounced search)
- [x] `/portal/admin/promoted-messages/[id]` (approve / deny + cancel via `promotion-reason-modal.tsx` / delete warning)
- [x] `BanAdsPurchaseInfo.tsx` promotions summary + permanent-ban refund warning

## F5 — Revenue chart
- [x] `promotedRevenue` in revenue DTO types
- [x] Second Bar series in `chart-bar-revenue.tsx` (monthly + weekly)

## Build
- [x] `npm run build` passes (first run, no type errors)

## Deviations / notes

- **No outer Stripe `<Elements>` needed for `PromoteMessageModal`** — verified:
  `PaymentMethodSelector` wraps its nested `AddCardForm` dialog in its own
  `<Elements stripe={stripePromise}>` (payment-method-selector.tsx), and the
  promote purchase itself only posts a saved `paymentMethodId` (no Stripe JS).
- **Amber ring lives in `MessageItem.tsx`, not `ChatMessage.tsx`** — the bubble
  div is rendered by MessageItem (ChatMessage only composes it), so the
  `ring-amber-*` classes were added to the bubble there. Approved badge ring is
  visible in both chat and search/sidebar views via the shared component.
- **Sidebar refetch is WS-driven, no polling** — unlike TopReactedMessagesSection
  (10s poll), PromotedMessagesSection refetches when `promotionUpdateCounter`
  bumps (on PROMOTED_MESSAGE_UPDATE for the selected room). Counter only
  increments for the selected room to avoid refetches for background rooms.
- **Portal filter state is local `useState`, not URL params** — the admin queue
  needs a *default* of status=PENDING which the URL-param hook (`useAdsParams`)
  can't express (absence means "All" there). Both list pages use local state for
  status/page/sort/search; admin search is debounced via `useDebounce` and
  parsed numeric→userId / text→email exactly like `admin/ads/page.tsx`.
- **`/portal/promoted-messages` exempted from the no-ads redirect funnel** in
  `src/app/portal/layout.tsx` (like `/portal/payment-methods`), and included in
  the reduced sidebar nav for no-ad users in `app-sidebar.tsx` — promotions are
  bought from chat, so users can own them without ever purchasing an ad;
  without this the post-purchase redirect would bounce to /portal/campaign.
- **Deep link uses `?messageId=` per plan** — note the chat already supports a
  separate `?jumpTo=` URL param (useChatScrollAndPagination); the new
  `messageId` param in `src/app/page.tsx` is ref-guarded and dispatches
  `setJumpToMessageId` once the target room is active, which fetches
  messages-around, so out-of-page messages work.
- **Shared detail card** `src/portal/components/promoted-message-details.tsx`
  (modeled on ad-status-details.tsx) is reused by both user and admin detail
  pages; actions stay in the pages. Status badge colors are shared via
  `getPromotionStatusBadgeClass` in `promoted-messages-table.tsx`.
- **No status-count tabs badges** — the contract has no promotions
  status-counts endpoint (ads has one), so tabs render without counts.
- Revenue chart: existing `revenue` series relabeled "Ad Revenue" so the
  two-series tooltip/legend is unambiguous.

## Backend contract assumptions (field names the BE must honor)

Envelope: Spring `Page<T>` (existing `PaginatedResponse<T>` shape). Enum strings:
`PENDING|APPROVED|DENIED|CANCELED`, `USER|ADMIN|SYSTEM_BAN`, WS type
`PROMOTED_MESSAGE_UPDATE` with payload
`{messageId, chatRoomId, chatRoomName, promotionId, status, ownerId}`.

`PromotedMessageDto` (list row): `id, messageId, messageContent, chatRoomId,
chatRoomName, status, amount, currency, submittedAt` + `email, userId` on admin
rows.

`PromotedMessageDetailDto`: list fields + `approvedAt, resolvedAt, reason,
canceledBy, messageSenderUsername, messageCreatedAt, messageDeleted, cardBrand,
cardLast4, receiptStatus`.

`MessageResponseDTO.promotion`: `{id, status} | null` (only PENDING/APPROVED
sent). Chat sidebar endpoint: `GET /api/v1/chat-rooms/{roomId}/messages/promoted`
with `page` + `pageSize` query params (note: top-reacted uses `size`; promoted
uses `pageSize` per plan B3).

`BanPromotionsSummaryDto`: `{totalPromotions, pendingCount, approvedCount,
deniedCount, canceledCount, pendingReleaseTotal, approvedRefundTotal, currency}`.

Delete-blocked message: 409 with `{message}` in the error body (shown via
sonner toast). Promote errors (declined card, already promoted) also surface
`{message}` from the error body inline in the modal.
