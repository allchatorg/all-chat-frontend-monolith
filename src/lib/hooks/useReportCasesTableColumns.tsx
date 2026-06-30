import {useMemo} from "react";
import {ColumnDef} from "@tanstack/table-core";
import {ReportCaseSummary} from "@/models/ReportCaseSummary";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, ShieldAlert} from "lucide-react";

type UseReportCasesTableColumnsProps = {
    onViewDetails?: (reportCaseId: string) => void;
};

export function useReportCasesTableColumns({
                                               onViewDetails
                                           }: UseReportCasesTableColumnsProps = {}): ColumnDef<ReportCaseSummary>[] {

    return useMemo(() => {
        return [
            {
                id: "isResolved",
                header: "Status",
                accessorFn: (row) => row.resolutionDate !== null,
                cell: ({row}) => {
                    const isResolved = row.original.resolutionDate !== null;
                    return (
                        <div className={`font-medium ${isResolved ? "text-green-600" : "text-red-600"
                        }`}>
                            {isResolved ? "Resolved" : "Unresolved"}
                        </div>
                    );
                },
                filterFn: (row, columnId, filterValue: any) => {
                    if (filterValue === undefined) return true;
                    const isResolved = row.original.resolutionDate !== null;
                    return isResolved === filterValue;
                }
            },
            {
                id: "needsAttention",
                header: "Needs Attention",
                accessorFn: (row) => row.needsAttentionAt !== null,
                cell: ({row}) => {
                    const needsAttention = row.original.needsAttentionAt !== null;
                    return needsAttention ? (
                        <div className="flex items-center">
                            <div
                                className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-purple-800">
                                <ShieldAlert className="mr-1 h-4 w-4 text-purple-600"/>
                                <span className="text-xs font-medium">Attention</span>
                            </div>
                        </div>
                    ) : null;
                },
                filterFn: (row, columnId, filterValue: any) => {
                    if (filterValue === undefined) return true;
                    const needsAttention = row.original.needsAttentionAt !== null;
                    return needsAttention === filterValue;
                }
            },
            {
                accessorKey: "reportCount",
                header: ({column}) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Report Count
                        <ArrowUpDown className="ml-2"/>
                    </Button>
                ),
                cell: ({row}) => {
                    const count = row.getValue("reportCount") as number;
                    return (
                        <div className={`ml-4 font-medium ${count > 5 ? "text-red-600" :
                            count > 2 ? "text-yellow-600" :
                                "text-gray-600"
                        }`}>
                            {count}
                        </div>
                    );
                }
            },
            {
                accessorKey: "message.sender.username",
                header: "Reported Message Sender",
                cell: ({row}) => {
                    const senderUsername = row.original.message?.senderUsername as string;
                    return (
                        <div className="font-medium">
                            {senderUsername || "Unknown"}
                        </div>
                    );
                }
            },
            {
                accessorKey: "message.content",
                header: "Message Content",
                cell: ({row}) => {
                    if (row.original.csamCase) {
                        return <span className="text-destructive font-medium">REDACTED (CSAM)</span>;
                    }
                    const content = row.original.message?.content as string;
                    return (
                        <div className="max-w-xs truncate" title={content}>
                            {content || "N/A"}
                        </div>
                    );
                }
            },
            {
                id: "viewDetails",
                enableHiding: false,
                cell: ({row}) => (
                    <div className="flex justify-end">
                        <Button onClick={
                            () => onViewDetails?.(row.original.id.toString())
                        }>
                            View Details
                        </Button>
                    </div>
                ),
                meta: {
                    className: "w-0" // Minimal width
                }
            }
        ];
    }, [onViewDetails]);
}