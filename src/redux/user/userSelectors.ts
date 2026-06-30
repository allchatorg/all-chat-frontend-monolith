import {RootState} from "@/redux/store";


export const selectUserState = (state: RootState) => ({
    user: state.user.user,
    isLoading: state.user.loading,
    error: state.user.error,
});

export const selectUser = (state: RootState) => state.user.user;
export const selectIsUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectTimeFormatSetting = (state: RootState) => state.user?.user?.timeFormatSetting;