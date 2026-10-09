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
import {mergeOwnerFonts} from '@/lib/fontPresets';
import {ApiError} from '@/models/ApiError';
import {sessionEstablished} from '@/redux/auth/sessionActions';

interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
    errorDetails: ApiError | null;
    activeRequestId: string | null;
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
    errorDetails: null,
    activeRequestId: null,
};

function mergeOwnerSnapshot(current: User | null, incoming: User | null): User | null {
    if (!current || !incoming || current.id !== incoming.id) return incoming;

    incoming = mergeOwnerFonts(current, incoming);

    const currentRevision = current.vipBadgeRevision ?? 0;
    const incomingRevision = incoming.vipBadgeRevision ?? 0;
    // A delayed account refresh must not undo a newer appearance/billing update.
    if (incomingRevision < currentRevision ||
        (incoming.vipBadgeRevision === undefined && current.vipBadgeRevision !== undefined)) {
        return {
            ...incoming,
            vipActive: current.vipActive,
            showVipBadge: current.showVipBadge,
            vipBadgeVisible: current.vipBadgeVisible,
            vipBadgeRevision: current.vipBadgeRevision,
        };
    }
    // Expiry can hide a badge before the scheduled revision is published.
    if (incomingRevision === currentRevision && current.vipBadgeVisible === false) {
        return {...incoming, vipBadgeVisible: false};
    }
    return incoming;
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = mergeOwnerSnapshot(state.user, action.payload.user);
            state.error = null;
            state.errorDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sessionEstablished, () => ({...initialState}))
            .addCase(fetchMe.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.activeRequestId = action.meta.requestId;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                if (state.activeRequestId !== action.meta.requestId) return;
                state.loading = false;
                state.user = mergeOwnerSnapshot(state.user, action.payload);
                state.errorDetails = null;
            })
            .addCase(fetchMe.rejected, (state, action) => {
                if (state.activeRequestId !== action.meta.requestId) return;
                state.loading = false;
                if (action.payload?.staleSession) return;
                state.errorDetails = action.payload ?? null;
                state.error = action.payload?.message ?? 'Unable to load your account. Please try again.';
                if (action.payload?.sessionInvalid) state.user = null;
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
                state.user = mergeOwnerSnapshot(state.user, action.payload);
            })
            .addCase(verifyEmailUpdateThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(verifyEmailUpdateThunk.fulfilled, (state, action) => {
                state.user = mergeOwnerSnapshot(state.user, action.payload);
            })
            .addCase(verifyEmailUpdateThunk.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(verifyPhoneThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(verifyPhoneThunk.fulfilled, (state, action) => {
                state.user = mergeOwnerSnapshot(state.user, action.payload);
            })
            .addCase(verifyPhoneThunk.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(claimAccountThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = mergeOwnerSnapshot(state.user, action.payload);
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
