# Notification System — Frontend Progress

Facebook-style notification center: bell + unread badge in chat navbar and
portal sidebar, dropdown list (icon / title / truncated body), mark
read/unread/delete, click → mark read + details modal, realtime via STOMP.

## Checklist

### Chat app
- [x] `models/NotificationType.ts` + `models/AppNotification.ts` (named `AppNotification` to avoid DOM `Notification` clash)
- [x] `models/WebSocketMessageType.ts` — add `NOTIFICATION`; `models/WebSocketMessage.ts` — add union member, drop `WARN_USER`
- [x] `api/notifications/notificationsAPI.ts` — 6 endpoints
- [x] `redux/notifications/{notificationsSlice,notificationsThunk,notificationsSelectors}.ts` + register in `redux/store.ts`
- [x] `lib/hooks/useStompClient.ts` — replace `WARN_USER` case with `NOTIFICATION` case (prepend + finite orange toast for warnings)
- [x] `features/notifications/hooks/useNotifications.ts` — shared logic hook
- [x] `features/notifications/components/notificationVisuals.tsx` — per-type icon registry (extension point)
- [x] `features/notifications/components/NotificationItem.tsx`
- [x] `features/notifications/components/NotificationList.tsx`
- [x] `features/notifications/components/NotificationDetailsModal.tsx`
- [x] `features/notifications/components/NotificationBell.tsx` — Popover desktop / dialog mobile
- [x] `components/Navbar.tsx` — bell before Settings button

### Portal
- [x] `portal/components/notification-bell.tsx` — wrapper with `@ads` primitives
- [x] `portal/components/app-sidebar.tsx` — bell row in `SidebarFooter` above `NavUser`

### Verify
- [x] `npx tsc --noEmit`
- [x] `npm run build`

## Contract (matches backend)

`AppNotification`: `{ id, type, title, body, metadata, referenceType, referenceId, readAt, createdAt }`
WS: `{ type: "NOTIFICATION", data: AppNotification }` on `/topic/user.{id}`
