import {getMessageTextColor} from "@/features/chatroom/utils/messageTextColor";

// Chat bubbles have user-selected colors, independent of the page theme.
// Use the ordinary text's exact brightness decision, with stronger green shades
// matching the light/dark theme tokens instead of black/white.
export function getGreentextColor(background: string): string {
    return getMessageTextColor(background) === "black" ? "#166534" : "#86efac";
}
