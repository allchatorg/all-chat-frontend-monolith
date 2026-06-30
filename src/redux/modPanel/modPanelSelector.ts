import {RootState} from "@/redux/store";

export const selectModPanelLoadedUser = (state: RootState) => state.modPanel.loadedUser;
export const selectModPanelChatRoomMessages = (state: RootState) => state.modPanel.chatRoomMessages;
export const selectModPanelUserInfo = (state: RootState) => state.modPanel.selectedUserInfo;
export const selectModPanelAuditLogs = (state: RootState) => state.modPanel.auditLogs;
