import {createAsyncThunk} from "@reduxjs/toolkit";
import {
    getUserAdminViewDetails,
    getUserMessages,
    searchActiveBans,
    searchUsers,
    updateUserRole
} from "@/api/admin/adminAPI";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {Ban} from "@/models/Ban";
import {User} from "@/models/User";
import {UserSearchRequest} from "@/models/UserSearchRequest";
import {UserAdminView} from "@/models/UserAdminView";
import {Message} from "@/models/message";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";

export const searchActiveBansThunk = createAsyncThunk<
    PaginatedResponse<Ban>,
    { userNameOrId?: string; page: number; pageSize: number }>(
    "admin/searchActiveBans",
    async ({userNameOrId, page, pageSize}, {rejectWithValue}) => {
        try {
            return await searchActiveBans(userNameOrId, page, pageSize);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const searchUsersThunk = createAsyncThunk<
    PaginatedResponse<User>,
    UserSearchRequest>(
    "admin/searchUsers",
    async (request, {rejectWithValue}) => {
        try {
            return await searchUsers(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateUserRoleThunk = createAsyncThunk<
    void,
    { userId: number; role: string }>(
    "admin/updateUserRole",
    async ({userId, role}, {rejectWithValue}) => {
        try {
            await updateUserRole(userId, role);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getUserMessagesThunk = createAsyncThunk<
    PaginatedResponse<Message>,
    SearchMessageRequest
>(
    "admin/getUserMessages",
    async (searchRequest, {rejectWithValue}) => {
        try {
            return await getUserMessages(searchRequest);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getUserAdminViewDetailsThunk = createAsyncThunk<UserAdminView, number>(
    "admin/getUserAdminViewDetails",
    async (userId, {rejectWithValue}) => {
        try {
            return await getUserAdminViewDetails(userId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
