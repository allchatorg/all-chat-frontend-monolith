import {RootState} from "@/redux/store";

// As requested: a single selector named `auditlogs`
export const auditlogs = (state: RootState) => state.auditLogs.logs;