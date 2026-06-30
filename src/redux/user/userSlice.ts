import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "@/models/User";
import {
    blockUserThunk,
    changeUsernameThunk,
    fetchBlockedUsersThunk,
    fetchMe,
    submitModeratorApplicationThunk,
    unblockUserThunk,
    updateAgeThunk,
    updateBlurredContentThunk,
    updateMarketingPreferencesThunk,
    updateTimeFormatThunk,
    updateUserDisplayColorThunk,
    verifyEmailThunk,
    verifyEmailUpdateThunk,
    verifyPhoneThunk,
} from "@/redux/user/usersThunk";
import {Tag} from "@/models/Tag";
import {claimAccountThunk, logoutThunk} from "../auth/authThunk";

interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload.user;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMe.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.loading = false;
                state.user = null
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = action.payload as string;
            })
            .addCase(changeUsernameThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changeUsernameThunk.fulfilled, (state, action) => {
                state.loading = false;
                if (state.user) {
                    state.user = {
                        ...state.user,
                        username: action.payload
                    }
                }
            })
            .addCase(changeUsernameThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // updateAgeThunk
            .addCase(updateAgeThunk.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.isOver18 = action.payload;
                }
            })
            .addCase(verifyEmailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(verifyEmailUpdateThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(verifyEmailUpdateThunk.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(verifyEmailUpdateThunk.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(verifyPhoneThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(verifyPhoneThunk.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(verifyPhoneThunk.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(claimAccountThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(updateBlurredContentThunk.fulfilled, (state, action: PayloadAction<Tag[]>) => {
                if (state.user) {
                    state.user.blurredContentTags = action.payload;
                }
            })
            .addCase(updateUserDisplayColorThunk.fulfilled, (state, action) => {
                if (!state.user) {
                    return;
                }
                state.user.displayColor = action.payload;
            })
            .addCase(updateTimeFormatThunk.fulfilled, (state, action) => {
                if (!state.user) {
                    return;
                }

                state.user = {
                    ...state.user,
                    timeFormatSetting: action.payload,
                };
            })
            .addCase(updateMarketingPreferencesThunk.fulfilled, (state, action) => {
                if (!state.user) {
                    return;
                }

                state.user = {
                    ...state.user,
                    subscribedToMarketingEmails: action.payload,
                };
            })
            .addCase(fetchBlockedUsersThunk.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.blockedUsers = action.payload;
                }
            })
            .addCase(unblockUserThunk.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.blockedUsers = state.user.blockedUsers.filter(user => user.id !== action.payload);
                }
            })
            .addCase(blockUserThunk.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.blockedUsers = [...state.user.blockedUsers, action.payload];
                }
            })
            .addCase(submitModeratorApplicationThunk.fulfilled, (state) => {
                if (state.user) {
                    state.user.appliedForModerator = true;
                }
            });
    },
});

export const {setUser,} = userSlice.actions;
export default userSlice.reducer;
