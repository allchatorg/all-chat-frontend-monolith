import {Ban} from "@/models/Ban";
import {createSlice} from "@reduxjs/toolkit";
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
        messages: PaginatedResponse<Message>;
    }
}

const initialState: AdminState = {
    activeBans: createEmptyPaginatedResponse<Ban>(),
    users: createEmptyPaginatedResponse<User>(),
    userDetails: {
        userAdminView: null,
        messages: createEmptyPaginatedResponse<Message>()
    },
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
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
            .addCase(
                getUserAdminViewDetailsThunk.fulfilled,
                (state, action) => {
                    state.userDetails.userAdminView = action.payload;
                }
            )
            .addCase(
                getUserMessagesThunk.fulfilled, (state, action) => {
                    state.userDetails.messages = action.payload;
                }
            )
    }
})

export const {clearSelectedUser} = adminSlice.actions;

export const adminReducer = adminSlice.reducer