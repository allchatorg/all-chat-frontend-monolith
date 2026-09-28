import {RootState} from "@/redux/store";

export const selectActiveBans = (state: RootState) => state.admin.activeBans;
export const selectUsers = (state: RootState) => state.admin.users;
export const selectUserAdminView = (state: RootState) =>
    state.admin.userDetails.userAdminView?.id === state.admin.userDetails.userId
        ? state.admin.userDetails.userAdminView : null;
export const selectUserAdminDetailsState = (state: RootState) => state.admin.userDetails;
export const selectUserMessages = (state: RootState) => state.admin.userDetails.messages;
