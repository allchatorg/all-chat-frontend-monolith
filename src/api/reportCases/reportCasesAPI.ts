import {ReportSearchRequest} from "@/models/ReportSearchRequest";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {ReportCaseSummary} from "@/models/ReportCaseSummary";
import api from "@/lib/api";
import {ReportCase} from "@/models/ReportCase";
import {BanRequest} from "@/models/BanRequest";
import {NcmecReportRequest} from "@/models/NcmecReportRequest";
import {User} from "@/models/User";

const REPORT_CASES_PATH = '/report-cases';

export const getAssignableStaff = async (): Promise<User[]> => {
    const res = await api.get<User[]>(`${REPORT_CASES_PATH}/assignees`);
    return res.data;
};

export const claimCase = async (reportCaseId: number): Promise<ReportCase> => {
    const res = await api.patch<ReportCase>(`${REPORT_CASES_PATH}/${reportCaseId}/claim`);
    return res.data;
};

export const releaseCase = async (reportCaseId: number): Promise<ReportCase> => {
    const res = await api.patch<ReportCase>(`${REPORT_CASES_PATH}/${reportCaseId}/release`);
    return res.data;
};

export const assignCase = async (reportCaseId: number, assigneeId: number): Promise<ReportCase> => {
    const res = await api.patch<ReportCase>(`${REPORT_CASES_PATH}/${reportCaseId}/assign`, {assigneeId});
    return res.data;
};

export const getReportCases = async (
    request: ReportSearchRequest
): Promise<PaginatedResponse<ReportCaseSummary>> => {
    const res = await api.get<PaginatedResponse<ReportCaseSummary>>(
        `${REPORT_CASES_PATH}`,
        // Repeat array params (reportTypes=A&reportTypes=B); Spring does not bind axios's default reportTypes[]=A.
        {params: request, paramsSerializer: {indexes: null}}
    );
    return res.data;
};

export const getReportCase = async (reportCaseId: number): Promise<ReportCase> => {
    const res = await api.get<ReportCase>(`${REPORT_CASES_PATH}/${reportCaseId}`);
    return res.data;
}

export const warnUser = async (
    warnRequest: { userId: number; description: string },
    reportCaseId: number
): Promise<void> => {
    const res = await api.post<void>(
        `${REPORT_CASES_PATH}/${reportCaseId}/warn`,
        warnRequest
    );
    return res.data;
};

export const deleteMessage = async (reportCaseId: number, messageId: number): Promise<void> => {
    const res = await api.delete<void>(`${REPORT_CASES_PATH}/${reportCaseId}/${messageId}`);
    return res.data;
}

export const requestElevation = async (reportCaseId: number): Promise<void> => {
    const res = await api.patch<void>(`${REPORT_CASES_PATH}/${reportCaseId}/request-elevation`);
    return res.data;
}

export const banUser = async (
    banRequest: BanRequest,
    reportCaseId: number
): Promise<void> => {
    const res = await api.post<void>(`${REPORT_CASES_PATH}/${reportCaseId}/ban`, banRequest);
    return res.data;
}

export const resolveCase = async (reportCaseId: number): Promise<ReportCase> => {
    const res = await api.patch<ReportCase>(`${REPORT_CASES_PATH}/${reportCaseId}/resolve-case`);
    return res.data;
}

export const reopenCase = async (reportCaseId: number): Promise<ReportCase> => {
    const res = await api.patch<ReportCase>(`${REPORT_CASES_PATH}/${reportCaseId}/reopen-case`);
    return res.data;
}

export const recordNotCsam = async (reportCaseId: number, reason: string): Promise<ReportCase> => {
    const res = await api.patch<ReportCase>(`${REPORT_CASES_PATH}/${reportCaseId}/not-csam`, {reason});
    return res.data;
}

export const submitNcmecReport = async (request: NcmecReportRequest): Promise<void> => {
    const res = await api.post<void>(
        `${REPORT_CASES_PATH}/${request.reportCaseId}/ncmec-report`, request
    );
    return res.data;
}