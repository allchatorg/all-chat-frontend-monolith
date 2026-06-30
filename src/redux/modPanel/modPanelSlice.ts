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
    chatRoomMessages: PaginatedResponse<Message>;
    auditLogs: PaginatedResponse<AuditLogUnion>;
}

const initialState: ModPanelState = {
    selectedUserInfo: {
        selectedUserId: null,
        selectedUserName: null
    },
    loadedUser: null,
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
            state.chatRoomMessages = initialState.chatRoomMessages;
        },
        clearSelectedUser: (state) => {
            state.selectedUserInfo = {
                selectedUserId: null,
                selectedUserName: null
            };
            state.loadedUser = null;
            state.chatRoomMessages = initialState.chatRoomMessages;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserAdminDetailsThunk.fulfilled, (state, action) => {
                state.loadedUser = action.payload;
            })
            .addCase(getUserMessagesThunk.fulfilled, (state, action) => {
                state.chatRoomMessages = action.payload;
            })
            .addCase(banUserThunk.fulfilled, (state) => {
                if (!state.loadedUser) return;
                state.loadedUser = {
                    ...state.loadedUser,
                    banned: true
                };
            })
            .addCase(revokeBanThunk.fulfilled, (state) => {
                if (!state.loadedUser) return;
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
