import {User} from "@/models/User";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {createSlice} from "@reduxjs/toolkit";
import {Message} from "@/models/message";
import {
    banUserThunk,
    getAuditLogsThunk,
    getUserAdminDetailsThunk,
    getUserMessagesThunk,
    revokeBanThunk
} from "@/redux/modPanel/modPanelThunk";
import {createEmptyPaginatedResponse} from "@/lib/utils";
import {AuditLogUnion} from "@/models/AuditLog";

interface ModPanelState {
    selectedUserInfo: {
        selectedUserId: number | null;
        selectedUserName: string | null;
    };
    loadedUser: User | null;
    userRequestId: string | null;
    userLoading: boolean;
    userError: boolean;
    chatRoomMessages: PaginatedResponse<Message>;
    auditLogs: PaginatedResponse<AuditLogUnion>;
}

const initialState: ModPanelState = {
    selectedUserInfo: {
        selectedUserId: null,
        selectedUserName: null
    },
    loadedUser: null,
    userRequestId: null,
    userLoading: false,
    userError: false,
    chatRoomMessages: createEmptyPaginatedResponse<Message>(),
    auditLogs: createEmptyPaginatedResponse<AuditLogUnion>()
};

const modPanelSlice = createSlice({
    name: "modPanel",
    initialState,
    reducers: {
        setSelectedUserInfo: (
            state,
            action: { payload: { userId: number; userName: string } }
        ) => {
            state.selectedUserInfo = {
                selectedUserId: action.payload.userId,
                selectedUserName: action.payload.userName
            };
            state.loadedUser = null;
            state.userRequestId = null;
            state.userLoading = false;
            state.userError = false;
            state.chatRoomMessages = initialState.chatRoomMessages;
        },
        clearSelectedUser: (state) => {
            state.selectedUserInfo = {
                selectedUserId: null,
                selectedUserName: null
            };
            state.loadedUser = null;
            state.userRequestId = null;
            state.userLoading = false;
            state.userError = false;
            state.chatRoomMessages = initialState.chatRoomMessages;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserAdminDetailsThunk.pending, (state, action) => {
                if (action.meta.arg !== state.selectedUserInfo.selectedUserId) return;
                state.userRequestId = action.meta.requestId;
                state.userLoading = true;
                state.userError = false;
            })
            .addCase(getUserAdminDetailsThunk.fulfilled, (state, action) => {
                if (state.userRequestId !== action.meta.requestId ||
                    action.meta.arg !== state.selectedUserInfo.selectedUserId ||
                    action.payload.id !== state.selectedUserInfo.selectedUserId) return;
                state.loadedUser = action.payload;
                state.userRequestId = null;
                state.userLoading = false;
            })
            .addCase(getUserAdminDetailsThunk.rejected, (state, action) => {
                if (state.userRequestId !== action.meta.requestId ||
                    action.meta.arg !== state.selectedUserInfo.selectedUserId) return;
                state.userRequestId = null;
                state.userLoading = false;
                state.userError = true;
                state.loadedUser = null;
            })
            .addCase(getUserMessagesThunk.fulfilled, (state, action) => {
                state.chatRoomMessages = action.payload;
            })
            .addCase(banUserThunk.fulfilled, (state, action) => {
                if (!state.loadedUser || state.loadedUser.id !== Number(action.meta.arg.userId)) return;
                state.loadedUser = {
                    ...state.loadedUser,
                    banned: true
                };
            })
            .addCase(revokeBanThunk.fulfilled, (state, action) => {
                if (!state.loadedUser || state.loadedUser.id !== action.meta.arg) return;
                state.loadedUser = {
                    ...state.loadedUser,
                    banned: false
                };
            })
            .addCase(getAuditLogsThunk.fulfilled, (state, action) => {
                state.auditLogs = action.payload;
            });
    }
});

export const {setSelectedUserInfo, clearSelectedUser} = modPanelSlice.actions;
export const modPanelReducer = modPanelSlice.reducer;
