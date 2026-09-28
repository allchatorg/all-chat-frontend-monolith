import {RootState} from "@/redux/store";

export const selectModPanelLoadedUser = (state: RootState) =>
    state.modPanel.loadedUser?.id === state.modPanel.selectedUserInfo.selectedUserId
        ? state.modPanel.loadedUser : null;
export const selectModPanelUserLoading = (state: RootState) => state.modPanel.userLoading;
export const selectModPanelUserError = (state: RootState) => state.modPanel.userError;
export const selectModPanelChatRoomMessages = (state: RootState) => state.modPanel.chatRoomMessages;
export const selectModPanelUserInfo = (state: RootState) => state.modPanel.selectedUserInfo;
export const selectModPanelAuditLogs = (state: RootState) => state.modPanel.auditLogs;
