import {Badge} from "@/components/ui/badge";
import {ReportSeverity} from "@/models/ReportSeverity";
import {reportSeverityLabels} from "@/lib/reportUtils";

const severityClasses: Record<ReportSeverity, string> = {
    [ReportSeverity.P0]: "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
    [ReportSeverity.P1]: "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    [ReportSeverity.P2]: "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    [ReportSeverity.P3]: "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function ReportSeverityBadge({severity, showName = false}: {
    severity: ReportSeverity | null,
    showName?: boolean
}) {
    if (!severity) {
        return null;
    }

    return (
        <Badge variant="outline" className={severityClasses[severity]} title={reportSeverityLabels[severity]}>
            {showName ? reportSeverityLabels[severity] : severity}
        </Badge>
    );
}
