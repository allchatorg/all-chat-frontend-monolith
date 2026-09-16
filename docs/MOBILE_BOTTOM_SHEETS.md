# Mobile bottom sheets

The existing panels that slide up from the bottom now share the radio sheet's
glass surface, drag handle, accessible heading, close button and safe-area spacing.

## Structure

| Layer | Responsibility |
| --- | --- |
| `src/components/ui/bottom-sheet.tsx` | Controlled Vaul modal, focus, dismissal, layout and scrolling boundaries. No Redux, feature queries or radio dependencies. |
| `LeftPanel`, `RightPanel`, `PrivateRightPanel` | Choose the active feature and switch between its desktop sidebar and mobile sheet. |
| Feature sections | Own filters, tabs, queries, pagination and selection. `showHeader={false}` removes their duplicate heading/close button inside a sheet. |
| `RadioSheet` | Radio-specific controls composed inside the same shared component. |

Only one responsive content tree mounts per panel. The last active panel remains
available during its closing animation; Vaul unmounts the content after exit.

## Usage

Use `BottomSheet` with controlled `open` / `onOpenChange`, a required `title`, and
feature content. The component does not choose a breakpoint: chat hosts use the
existing `<1024px` mobile boundary.

- The default `size="content"` and scrollable body fit compact controls such as radio.
- For a list with fixed filters and pagination, use `size="tall"`,
  `scrollable={false}`, and `bodyClassName="px-0"`. The feature owns its inner scroll
  area; keep its flex ancestors `min-h-0` and fixed controls `shrink-0`.
- An optional `trigger` uses Radix's focus restoration. Programmatic openings
  restore the previously focused element. Use `onCloseAutoFocus` for explicit
  handoffs, such as the radio dropdown closing before the sheet opens.
- Focus starts on Close unless `initialFocusRef` or `onOpenAutoFocus` overrides it.
  Dragging is restricted to the handle so sliders, text selection and list gestures
  remain available to the content.
- Keep the sheet host mounted while `open` changes to false so its exit animation
  and focus cleanup can finish. Closing a presentation surface must not stop radio.

## Migrated surfaces

- Top Reacted Messages and Promoted Messages.
- Active/Promoted Rooms, including their tabs and filters.
- Public and private message-search results.
- The moderation panel that already used the same mobile bottom-up container.
- Radio.

Notifications and the centered room/user search dialogs retain their existing UI.
Desktop sidebars and menus also retain their existing presentation.

Fullscreen media retains its appearance and now participates in Radix's modal
stack. Images/video opened from a sheet can receive focus and touch/scroll input;
closing the media returns to the underlying panel without dismissing it.

All Radix consumers use one overridden `@radix-ui/react-dismissable-layer` version
(`1.1.11`). Select/Menu previously installed a separate copy; Escape in a filter
then dismissed both that filter and its containing sheet. Keep this dependency
shared so nested controls participate in the same dismissal stack.

## Validation

Frontend type-check and an isolated production build passed. No tests were added
or executed. Browser checks covered Top Reacted filters (including nested Escape
dismissal), Active/Promoted Rooms tabs, Promoted Messages, drag-handle dismissal,
public message-search results, selecting a result to return to chat, a small-phone
scrolling layout, and single-instance desktop sidebars. Notifications and centered
room/user search files were verified unchanged.

The available message results contained text only; media opened from a panel and
private-message results still need a populated-data manual check. Physical-device
touch and software-keyboard checks remain pending.
