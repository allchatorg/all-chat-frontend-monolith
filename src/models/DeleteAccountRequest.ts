export interface DeleteAccountRequest {
    removeMessages: boolean;
    /** Required for claimed accounts; guests have no password. */
    password: string | null;
}
