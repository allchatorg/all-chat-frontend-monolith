import {PaginatedResponse} from "@/models/PaginatedResponse";
import {ReportCaseSummary} from "@/models/ReportCaseSummary";
import {ReportCase} from "@/models/ReportCase";
import {Message} from "@/models/message";
import {createEmptyPaginatedResponse} from "@/lib/utils";
import {createSlice} from "@reduxjs/toolkit";
import {
    fetchReportedMessageSurroundingMessagesThunk,
    getReportCasesThunk,
    getReportCaseThunk,
    resolveCaseThunk
} from "@/redux/report-cases/reportCasesThunk";

interface ReportCasesState {
    reportCases: PaginatedResponse<ReportCaseSummary>;
    selectedReportCase: {
        reportCase: ReportCase;
        messages: Message[];
    }
}

const initialState: ReportCasesState = {
    reportCases: createEmptyPaginatedResponse<ReportCaseSummary>(),
    selectedReportCase: {
        reportCase: {} as ReportCase,
        messages: []
    }
}

const reportCasesSlice = createSlice({
    name: 'reportCases',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                getReportCasesThunk.fulfilled, (state, action) => {
                    state.reportCases = action.payload;
                }
            )
            .addCase(
                getReportCaseThunk.fulfilled, (state, action) => {
                    state.selectedReportCase.reportCase = action.payload;
                }
            )
            .addCase(fetchReportedMessageSurroundingMessagesThunk.fulfilled,
                (state, action) => {
                    state.selectedReportCase.messages = action.payload.messages;
                }
            )
            .addCase(resolveCaseThunk.fulfilled, (state, action) => {
                state.selectedReportCase.reportCase = action.payload;
            });

    }
})

export const reportCasesReducer = reportCasesSlice.reducer;