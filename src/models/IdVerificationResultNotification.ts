export interface IdVerificationResultNotification {
    userId: number;
    reportCaseId?: number | null;
    passed: boolean;
}
