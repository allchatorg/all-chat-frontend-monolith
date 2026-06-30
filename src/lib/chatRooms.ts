export const BUG_REPORTS_CHATROOM_NAME = "Bug Reports";

export const isBugReportsChatRoomName = (roomName?: string | null) =>
    roomName?.trim().toLowerCase() === BUG_REPORTS_CHATROOM_NAME.toLowerCase();
