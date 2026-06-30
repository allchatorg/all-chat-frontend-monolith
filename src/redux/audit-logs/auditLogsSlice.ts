import {createSlice} from "@reduxjs/toolkit";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {AuditLogUnion} from "@/models/AuditLog";
import {createEmptyPaginatedResponse} from "@/lib/utils";
import {searchAuditLogs} from "@/redux/audit-logs/auditLogsThunk";

interface AuditLogsState {
    logs: PaginatedResponse<AuditLogUnion>;
}

const initialState: AuditLogsState = {
    logs: createEmptyPaginatedResponse<AuditLogUnion>()
};

const auditLogsSlice = createSlice({
    name: 'auditLogs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(searchAuditLogs.fulfilled, (state, action) => {
                state.logs = action.payload;
            });
    }
});

export const auditLogsReducer = auditLogsSlice.reducer;
