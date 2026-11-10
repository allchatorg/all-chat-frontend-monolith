import {User} from "@/models/User";
import {ReportSeverity} from "@/models/ReportSeverity";

/** Queue fields shared by the Reports list and the case page. */
export interface ReportCaseTriage {
    assignee: User | null;
    assignedAt: string | null;
    severity: ReportSeverity | null;
    createdAt: string;
    firstActionDueAt: string | null;
    firstActionAt: string | null;
}
