import {createAsyncThunk} from "@reduxjs/toolkit";
import {ReportCase} from "@/models/ReportCase";
import {MessagePage} from "@/models/MessagePage";
import {getChatRoomMessages} from "@/api/chatRoom/chatRoomInteractionAPI";
import {
    banUser,
    deleteMessage,
    getReportCase,
    getReportCases,
    resolveCase,
    submitNcmecReport,
    warnUser
} from "@/api/reportCases/reportCasesAPI";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {ReportCaseSummary} from "@/models/ReportCaseSummary";
import {ReportSearchRequest} from "@/models/ReportSearchRequest";
import {NcmecReportRequest} from "@/models/NcmecReportRequest";
import {BanRequest} from "@/models/BanRequest";

export const getReportCaseThunk = createAsyncThunk<
    ReportCase,
    number>(
    "report-cases/getReportCase",
    async (reportCaseId, {rejectWithValue}) => {
        try {
            return await getReportCase(reportCaseId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchReportedMessageSurroundingMessagesThunk = createAsyncThunk<
    MessagePage,
    { chatRoomId: number; aroundMessageId: number }
>(
    "report-cases/fetchReportedMessageSurroundingMessages",
    async ({chatRoomId, aroundMessageId}, {rejectWithValue}) => {
        try {
            return await getChatRoomMessages(chatRoomId, undefined, undefined, aroundMessageId);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || err.message || "Unknown error");
        }
    }
);

export const getReportCasesThunk = createAsyncThunk<
    PaginatedResponse<ReportCaseSummary>, ReportSearchRequest>(
    "report-cases/getReportCases",
    async (request, {rejectWithValue}) => {
        try {
            return await getReportCases(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const warnUserThunkReportCase = createAsyncThunk<
    void,
    { warnRequest: { userId: number; description: string }; reportCaseId: number }
>(
    "report-cases/warnUser",
    async ({warnRequest, reportCaseId}, {rejectWithValue}) => {
        try {
            return await warnUser(warnRequest, reportCaseId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteMessageThunk = createAsyncThunk<
    void,
    { reportCaseId: number; messageId: number }
>(
    "report-cases/deleteMessage",
    async ({reportCaseId, messageId}, {rejectWithValue}) => {
        try {
            return await deleteMessage(reportCaseId, messageId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const banUserThunkReportCase = createAsyncThunk<
    void,
    { banRequest: BanRequest; reportCaseId: number }
>(
    "report-cases/banUser",
    async ({banRequest, reportCaseId}, {rejectWithValue}) => {
        try {
            return await banUser(banRequest, reportCaseId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);

        }
    }
);

export const resolveCaseThunk = createAsyncThunk<
    ReportCase,
    number
>(
    "report-cases/resolveCase",
    async (reportCaseId, {rejectWithValue}) => {
        try {
            return await resolveCase(reportCaseId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const submitNcmecReportThunk = createAsyncThunk<
    void,
    NcmecReportRequest
>(
    "report-cases/submitNcmecReport",
    async (request, {rejectWithValue}) => {
        try {
            return await submitNcmecReport(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
