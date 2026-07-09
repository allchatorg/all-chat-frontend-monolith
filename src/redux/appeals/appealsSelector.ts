import {RootState} from "@/redux/store";

export const selectMyBanContext = (state: RootState) => state.appeals.myBanContext;
export const selectMyAppeal = (state: RootState) => state.appeals.myAppeal;
export const selectAppeals = (state: RootState) => state.appeals.appeals;
export const selectSelectedAppeal = (state: RootState) => state.appeals.selectedAppeal;
