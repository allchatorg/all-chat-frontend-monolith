import {RootState} from "@/redux/store";

export const selectActiveBans = (state: RootState) => state.admin.activeBans;
export const selectUsers = (state: RootState) => state.admin.users;
export const selectUserAdminView = (state: RootState) => state.admin.userDetails.userAdminView;
export const selectUserMessages = (state: RootState) => state.admin.userDetails.messages;