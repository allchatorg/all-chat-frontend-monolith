import React from "react";
import {Report, ReportOrigin} from "@/models/Report";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {format} from "date-fns";
import {reportTypeLabels} from "@/lib/reportUtils";

interface ReportCardProps {
    report: Report;
}

const ReportCard: React.FC<ReportCardProps> = ({report}) => {
    const isSystemReport = report.reporterOrigin === ReportOrigin.SYSTEM;
    const reporterLabel = isSystemReport ? "SYSTEM" : report.reporter?.username ?? "Unknown";

    return (
        <Card className="w-full transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{reporterLabel}</span>
                        {isSystemReport && (
                            <Badge variant="secondary">
                                System
                            </Badge>
                        )}
                        <Badge className="bg-red-100 text-red-800">
                            {reportTypeLabels[report.reportType]}
                        </Badge>
                    </div>

                    <span className="text-sm text-muted-foreground sm:font-medium">
                        {format(new Date(report.createdAt), "PPP p")}
                    </span>
                </div>
            </CardHeader>
            {report.description && (
                <CardContent className="pt-0">
                    <div
                        className="rounded-md border bg-muted/50 p-3 text-sm text-foreground/80 whitespace-pre-wrap wrap-break-word">
                        {report.description}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default ReportCard;
