import {createAsyncThunk} from "@reduxjs/toolkit";
import {User} from "@/models/User";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {Message} from "@/models/message";
import {BanRequest} from "@/models/BanRequest";
import {banUser, getAuditLogs, getUserAdminDetails, getUserMessages, revokeBan, warnUser} from "@/api/admin/adminAPI";
import {toast} from "sonner";
import {SearchAuditLogsRequest} from "@/models/SearchAuditLogsRequest";
import {AuditLogUnion} from "@/models/AuditLog";

export const getUserAdminDetailsThunk = createAsyncThunk<User, number>(
    "modPanel/getUserAdminDetails",
    async (userId, {rejectWithValue}) => {
        try {
            return await getUserAdminDetails(userId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getUserMessagesThunk = createAsyncThunk<
    PaginatedResponse<Message>,
    SearchMessageRequest
>(
    "modPanel/getUserMessages",
    async (searchRequest, {rejectWithValue}) => {
        try {
            return await getUserMessages(searchRequest);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const banUserThunk = createAsyncThunk<void, BanRequest>(
    "modPanel/banUser",
    async (banRequest, {dispatch, rejectWithValue}) => {
        try {
            await banUser(banRequest);
            dispatch(getAuditLogsThunk({userId: Number(banRequest.userId), page: 0, size: 10}));
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const revokeBanThunk = createAsyncThunk<void, number>(
    "modPanel/revokeBan",
    async (userId: number, {rejectWithValue}) => {
        try {
            await revokeBan(userId).then(
                () => toast.success("Ban revoked successfully")
            );
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const warnUserThunk = createAsyncThunk<
    void,
    { userId: number; description: string; reportCaseId?: number }
>(
    "modPanel/warnUser",
    async (warnRequest, {dispatch, rejectWithValue}) => {
        try {
            await warnUser(warnRequest);
            dispatch(getAuditLogsThunk({userId: warnRequest.userId, page: 0, size: 10}));
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getAuditLogsThunk = createAsyncThunk<
    PaginatedResponse<AuditLogUnion>,
    SearchAuditLogsRequest
>(
    "modPanel/getAuditLogs",
    async (request, {rejectWithValue}) => {
        try {
            return await getAuditLogs(request)
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);