import {Ban} from "@/models/Ban";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {
    getUserAdminViewDetailsThunk,
    getUserMessagesThunk,
    searchActiveBansThunk,
    searchUsersThunk
} from "@/redux/admin/adminThunk";
import {revokeBanThunk} from "@/redux/modPanel/modPanelThunk";
import {User} from "@/models/User";
import {UserAdminView} from "@/models/UserAdminView";
import {Message} from "@/models/message";
import {createEmptyPaginatedResponse} from "@/lib/utils";

interface AdminState {
    activeBans: PaginatedResponse<Ban>
    users: PaginatedResponse<User>
    userDetails: {
        userAdminView: UserAdminView | null;
        userId: number | null;
        requestId: string | null;
        loading: boolean;
        error: boolean;
        errorStatus: number | null;
        messages: PaginatedResponse<Message>;
    }
}

const initialState: AdminState = {
    activeBans: createEmptyPaginatedResponse<Ban>(),
    users: createEmptyPaginatedResponse<User>(),
    userDetails: {
        userAdminView: null,
        userId: null,
        requestId: null,
        loading: false,
        error: false,
        errorStatus: null,
        messages: createEmptyPaginatedResponse<Message>()
    },
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setSelectedUserId: (state, action: PayloadAction<number>) => {
            if (state.userDetails.userId === action.payload) return;
            state.userDetails = {...initialState.userDetails, userId: action.payload};
        },
        clearSelectedUser: (state) => {
            state.userDetails = initialState.userDetails;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchActiveBansThunk.fulfilled, (state, action) => {
                state.activeBans = action.payload;
            })
            .addCase(revokeBanThunk.fulfilled, (state, action) => {
                const userId = action.meta.arg;
                state.activeBans.content = state.activeBans.content.filter(ban => ban.userId !== userId);
                state.activeBans.totalElements = state.activeBans.totalElements - 1;
                state.activeBans.numberOfElements = state.activeBans.content.length;
            })
            .addCase(searchUsersThunk.fulfilled, (state, action) => {
                state.users = action.payload;
            })
            .addCase(getUserAdminViewDetailsThunk.pending, (state, action) => {
                if (state.userDetails.userId !== action.meta.arg) return;
                state.userDetails.requestId = action.meta.requestId;
                state.userDetails.loading = true;
                state.userDetails.error = false;
                state.userDetails.errorStatus = null;
            })
            .addCase(
                getUserAdminViewDetailsThunk.fulfilled,
                (state, action) => {
                    if (state.userDetails.requestId !== action.meta.requestId ||
                        state.userDetails.userId !== action.meta.arg ||
                        action.payload.id !== action.meta.arg) return;
                    state.userDetails.userAdminView = action.payload;
                    state.userDetails.requestId = null;
                    state.userDetails.loading = false;
                }
            )
            .addCase(getUserAdminViewDetailsThunk.rejected, (state, action) => {
                if (state.userDetails.requestId !== action.meta.requestId ||
                    state.userDetails.userId !== action.meta.arg) return;
                state.userDetails.requestId = null;
                state.userDetails.loading = false;
                state.userDetails.error = true;
                const failure = action.payload as {status?: number} | undefined;
                state.userDetails.errorStatus = failure?.status ?? null;
                if (state.userDetails.errorStatus === 403) {
                    state.userDetails.userAdminView = null;
                } else if (state.userDetails.userAdminView) {
                    state.userDetails.userAdminView.vipActive = undefined;
                }
            })
            .addCase(
                getUserMessagesThunk.fulfilled, (state, action) => {
                    state.userDetails.messages = action.payload;
                }
            )
    }
})

export const {clearSelectedUser, setSelectedUserId} = adminSlice.actions;

export const adminReducer = adminSlice.reducer
