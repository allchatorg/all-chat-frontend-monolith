import {RootState} from "@/redux/store";

export const selectReportCases = (state: RootState) => state.reportCases.reportCases;
export const selectSelectedReportCase = (state: RootState) => state.reportCases.selectedReportCase;
export const selectSelectedReportCaseMessages = (state: RootState) => state.reportCases.selectedReportCase.messages;