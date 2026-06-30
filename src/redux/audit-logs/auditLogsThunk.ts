import {createAsyncThunk} from "@reduxjs/toolkit";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {AuditLogUnion} from "@/models/AuditLog";
import {SearchAuditLogsRequest} from "@/models/SearchAuditLogsRequest";
import {getAuditLogs} from "@/api/admin/adminAPI";

export const searchAuditLogs = createAsyncThunk<
    PaginatedResponse<AuditLogUnion>,
    SearchAuditLogsRequest
>(
    "audit-logs/searchAuditLogs",
    async (request, {rejectWithValue}) => {
        try {
            return await getAuditLogs(request);
        } catch (error: any) {
            return rejectWithValue(error?.response?.data || error.message || "Unknown error");
        }
    }
);
