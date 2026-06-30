'use client';
import * as React from 'react';
import {useCallback, useEffect} from 'react';
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {AdminBreadcrumb} from "@/components/AdminBreadcrumb";
import {Ban, CheckCircle2, Flag, MessageSquare, Shield, ShieldAlert, ShieldBan, X} from "lucide-react";
import {Card} from "@/components/ui/card";
import {useThunk} from "@/lib/hooks/useThunk";
import {useSelector} from "react-redux";
import {useParams, useRouter} from "next/navigation";
import AuditLogCardList from "@/components/AuditLogCardList";
import MessageCardList from "@/app/(admin)/report-cases/[id]/components/MessageCardList";
import ReportCard from "@/app/(admin)/report-cases/[id]/components/ReportCard";
import ActionButton from "@/components/ActionButton";
import {Message} from "@/models/message";
import {toast} from 'sonner';
import WarnUserComponent from "@/features/chatroom/components/WarnUserComponent";
import {useDialog} from "@/components/providers/DialogProvider";
import {
    banUserThunkReportCase,
    deleteMessageThunk,
    fetchReportedMessageSurroundingMessagesThunk,
    getReportCaseThunk,
    resolveCaseThunk,
    submitNcmecReportThunk,
    warnUserThunkReportCase
} from "@/redux/report-cases/reportCasesThunk";
import {selectSelectedReportCase, selectSelectedReportCaseMessages} from "@/redux/report-cases/reportCasesSelector";
import {requestElevation} from "@/api/reportCases/reportCasesAPI";
import BanRequestForm from "@/features/chatroom/components/BanRequestForm";
import NcmecReportForm from "@/app/(admin)/report-cases/[id]/components/NcmecReportForm";
import {NcmecReportRequest} from "@/models/NcmecReportRequest";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {BanRequest} from "@/models/BanRequest";
import {format} from "date-fns";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {canActOn} from "@/models/Role";
import {isCsamReportCase} from "@/lib/reportUtils";
import {AuditLogType} from "@/models/AuditLog";
import {ReportType} from "@/models/ReportTypeEnum";
import {ReportTypeUtils} from "@/lib/utils";
import {ROUTES} from "@/routes";

export default function Page() {
    const params = useParams();
    const router = useRouter();
    const {open, close} = useDialog();
    const {currentRole} = useRoleAccess();

    const reportCaseId = Number(params.id);
    const [fetchReportCase] = useThunk(getReportCaseThunk);
    const [fetchSurroundingMessages, fetchMessagesLoading] = useThunk(fetchReportedMessageSurroundingMessagesThunk);
    const [removeMessage] = useThunk(deleteMessageThunk);
    const [warnUser, warnUserLoading, warnUserError] = useThunk(warnUserThunkReportCase);
    const [banUser, banUserLoading, banUserError] = useThunk(banUserThunkReportCase);
    const [resolveCase, resolveCaseLoading, resolveCaseError] = useThunk(resolveCaseThunk);
    const [submitNcmecReport, ncmecLoading] = useThunk(submitNcmecReportThunk);

    const selectedReportCase = useSelector(selectSelectedReportCase);
    const surroundingMessages = useSelector(selectSelectedReportCaseMessages);

    // Helper to check if case is resolved
    const isResolved = selectedReportCase?.reportCase?.resolutionDate !== null;

    // Check if any NCMEC audit log exists on this case
    const hasNcmecLog = (selectedReportCase?.reportCase?.auditLogs ?? [])
        .some(log => log.auditLogType === AuditLogType.NCMEC_REPORT);

    const isCsamCase = Boolean(selectedReportCase?.reportCase?.csamCase) || isCsamReportCase(selectedReportCase?.reportCase?.reports ?? []);

    // Redact messages for resolved CSAM cases, when CSAM flag is true, or when an NCMEC log exists
    const shouldRedactMessages = hasNcmecLog || selectedReportCase?.reportCase?.csamCase || (isResolved && isCsamCase);

    const defaultBanReportType = (selectedReportCase?.reportCase?.reports ?? []).reduce<ReportType | undefined>(
        (highestPriorityType, report) => {
            if (!highestPriorityType) {
                return report.reportType;
            }

            return ReportTypeUtils.hasHigherPriorityThan(report.reportType, highestPriorityType)
                ? report.reportType
                : highestPriorityType;
        },
        undefined
    );

    const refetchData = useCallback(async () => {
        if (!reportCaseId) return;

        try {
            const reportCase = await fetchReportCase(reportCaseId);
            if (reportCase) {
                await fetchSurroundingMessages({
                    chatRoomId: reportCase.message.chatRoomId,
                    aroundMessageId: reportCase.message.id
                });
            }
        } catch (error) {
            console.error('Error refetching data:', error);
            toast.error('Failed to refresh data');
        }
    }, [reportCaseId, fetchReportCase, fetchSurroundingMessages]);

    useEffect(() => {
        refetchData();
    }, [refetchData]);

    const handleJumpTo = (message: Message) => {
        router.push(`/?chatRoomId=${message.chatRoomId}&jumpTo=${message.id}`);
    };

    const handleBanSubmit = async (banRequest: BanRequest): Promise<void> => {
        if (!selectedReportCase?.reportCase?.id) {
            toast.error("Report case data not available");
            return;
        }

        try {
            const reportCaseId = selectedReportCase.reportCase.id;
            await banUser({banRequest, reportCaseId: reportCaseId});

            await refetchData();
            close();
            toast.success("User banned successfully!");
        } catch (error) {
            toast.error("Failed to ban user");
            throw error;
        }
    };

    const handleElevationRequest = async () => {
        if (!selectedReportCase?.reportCase?.id) {
            toast.error("Report case data not available");
            return;
        }

        const reportCaseId = selectedReportCase.reportCase.id;
        try {
            await requestElevation(reportCaseId);
            toast.success("The report was successfully escalated to senior staff for further review.");
            setTimeout(() => {
                refetchData();
            }, 100);
        } catch (error) {
            toast.error("Failed to escalate the report. Please try again.");
        }
    }

    const handleDeleteMessage = async () => {
        if (!selectedReportCase?.reportCase?.message?.id) {
            toast.error("Message data not available");
            return;
        }

        const messageId = selectedReportCase.reportCase.message.id;
        const reportCaseId = selectedReportCase.reportCase.id;

        try {
            await removeMessage({messageId: messageId, reportCaseId: reportCaseId});
            toast.success("Message deleted successfully");
            setTimeout(() => {
                refetchData();
            }, 100);
        } catch (error) {
            toast.error(`Failed to delete message`);
        }
    };

    const handleWarning = async (description: string) => {
        if (!selectedReportCase?.reportCase?.message?.senderId) {
            toast.error("No user selected for warning");
            return;
        }

        const userId = selectedReportCase.reportCase.message.senderId;
        const reportCaseId = selectedReportCase.reportCase.id;
        const warnRequest = {
            userId: userId,
            description: description
        }

        try {
            await warnUser({warnRequest, reportCaseId});
            toast.success("Warning sent successfully");
            await refetchData();
        } catch (error) {
            toast.error(`Failed to send warning.`);
        }
        close();
    };

    const handleResolveCase = async () => {
        if (!selectedReportCase?.reportCase?.id) {
            toast.error("Report case data not available");
            return;
        }

        const reportCaseId = selectedReportCase.reportCase.id;
        try {
            await resolveCase(reportCaseId);
            toast.success("Report case resolved successfully");
            await refetchData();
        } catch (error) {
            toast.error("Failed to resolve report case");
        }
    }

    const handleNcmecSubmit = async (request: NcmecReportRequest): Promise<void> => {
        try {
            await submitNcmecReport(request);
            close();
            toast.success("NCMEC report submitted successfully. The user has been banned and deleted.");
            await refetchData();
        } catch (error) {
            toast.error("Failed to submit NCMEC report");
            throw error;
        }
    };

    // Show loading state while data is being fetched
    if (!selectedReportCase?.reportCase) {
        return (
            <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-4">
                <div className="mx-auto w-full space-y-4">
                    <AdminBreadcrumb
                        items={[
                            {label: "Reports", href: ROUTES.REPORTS, returnToParam: "returnTo"},
                            {label: `Report #${reportCaseId}`}
                        ]}
                    />
                    <AdminPageHeader
                        title="Report Details"
                        description="Loading report case..."
                        icon={Flag}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-4">
            <div className="mx-auto w-full space-y-4">
                <AdminBreadcrumb
                    items={[
                        {label: "Reports", href: ROUTES.REPORTS, returnToParam: "returnTo"},
                        {label: `Report #${selectedReportCase.reportCase.id}`}
                    ]}
                />
                <AdminPageHeader
                    title="Report Details"
                    description="View detailed information about this report and take appropriate actions."
                    icon={Flag}
                />
            </div>

            <Card className="flex min-h-0 flex-1 flex-col p-4 space-y-6">
                {/* Actions */}
                <div className="flex flex-col gap-4">
                    {isResolved ? (
                        // Show resolved banner and navigation only
                        <div className="space-y-3">
                            <Alert className="border-green-200 bg-green-50">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5"/>
                                    <AlertDescription className="text-green-800">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Case Resolved</span>
                                            <span className="text-sm">
                                                Resolved on{" "}
                                                {selectedReportCase.reportCase.resolutionDate
                                                    ? format(new Date(selectedReportCase.reportCase.resolutionDate), "PPP p")
                                                    : "—"}
                                                {selectedReportCase.reportCase.resolver && (
                                                    <>{" "}by {selectedReportCase.reportCase.resolver.username}</>
                                                )}
                                            </span>
                                        </div>
                                    </AlertDescription>
                                </div>
                            </Alert>

                            {/* Show only navigation button for resolved cases (hide for NCMEC) */}
                            {!hasNcmecLog && (
                                <div className="flex">
                                    <ActionButton
                                        icon={<MessageSquare className="h-5 w-5 text-blue-500"/>}
                                        label="Go to Message"
                                        onClick={() =>
                                            handleJumpTo(selectedReportCase.reportCase.message)
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        // Show all action buttons for unresolved cases
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-7">
                            {/* Navigation */}
                            <ActionButton
                                icon={<MessageSquare className="h-5 w-5 text-blue-500"/>}
                                label="Go to Message"
                                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                onClick={() => handleJumpTo(selectedReportCase.reportCase.message)}
                            />
                            <ActionButton
                                icon={<ShieldAlert className="h-5 w-5 text-purple-600"/>}
                                label="Request Elevation"
                                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                disabled={selectedReportCase.reportCase.needsAttentionAt !== null}
                                onClick={() => handleElevationRequest()}
                            />

                            {/* User moderation */}
                            <ActionButton
                                icon={<Flag className="h-5 w-5 text-orange-500"/>}
                                label="Warn User"
                                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                onClick={() => {
                                    open(
                                        <WarnUserComponent onSubmit={handleWarning}/>
                                    )
                                }}
                            />
                            <ActionButton
                                icon={<X className="h-5 w-5 text-gray-500"/>}
                                label="Remove Message"
                                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                disabled={selectedReportCase.reportCase?.message?.deleted || !canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
                                onClick={() => handleDeleteMessage()}
                            />
                            <ActionButton
                                icon={<Ban className="h-5 w-5 text-red-500"/>}
                                label="Ban User"
                                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                onClick={() => {
                                    const userId = selectedReportCase.reportCase.message.senderId;
                                    if (!userId) {
                                        toast.error("No user selected for ban");
                                        return;
                                    }
                                    open(
                                        <div className="w-full">
                                            {userId ? (
                                                <>
                                                    <BanRequestForm onSubmit={handleBanSubmit}
                                                                    userId={userId.toString()}
                                                                    defaultReportType={defaultBanReportType}
                                                                    onClose={close}/>
                                                    <Alert className="mt-2 border-amber-200 bg-amber-50">
                                                        <AlertDescription className="text-amber-800">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4"/>
                                                                <span className="font-medium">Banning this user will automatically resolve the report case</span>
                                                            </div>
                                                        </AlertDescription>
                                                    </Alert>
                                                </>
                                            ) : (
                                                <div className="text-red-500">No user selected</div>
                                            )}
                                        </div>
                                    )
                                }}
                                disabled={!canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
                            />

                            {/* NCMEC Report - Only visible for CSAM cases */}
                            {isCsamCase && (
                                <ActionButton
                                    icon={<ShieldBan className="h-5 w-5 text-red-700"/>}
                                    label="NCMEC Report"
                                    className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                    onClick={() => {
                                        const rcId = selectedReportCase.reportCase.id;
                                        const hasAttachments = (selectedReportCase.reportCase.message?.attachments?.length ?? 0) > 0;
                                        open(
                                            <NcmecReportForm
                                                reportCaseId={rcId}
                                                hasAttachments={hasAttachments}
                                                onSubmit={handleNcmecSubmit}
                                                onClose={close}
                                            />
                                        );
                                    }}
                                />
                            )}

                            {/* Case resolution */}
                            <ActionButton
                                icon={<CheckCircle2 className="h-5 w-5 text-green-600"/>}
                                label="Resolve Case"
                                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                onClick={() => handleResolveCase()}
                            />
                        </div>
                    )}
                </div>

                {/* Main content split */}
                <div className="overflow-y-auto">
                    <div className="flex min-h-0 flex-col gap-4 md:flex-row">
                        <div className="flex min-h-0 flex-1 flex-col">
                            <MessageCardList
                                reportedMessageId={selectedReportCase?.reportCase?.message?.id}
                                messages={surroundingMessages || []}
                                title="Message History"
                                height="300px"
                                maxHeight="300px"
                                redacted={shouldRedactMessages}
                            />
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col">
                            <AuditLogCardList
                                logs={selectedReportCase?.reportCase?.auditLogs || []}
                                title="Actions Taken"
                                height="300px"
                                maxHeight="300px"
                            />
                        </div>
                    </div>

                    {/* Reports */}
                    <div className="mt-4 flex flex-col gap-2">
                        <h3 className="mb-2 text-lg font-semibold">Reports</h3>
                        {selectedReportCase?.reportCase?.reports?.length > 0 ? (
                            <div className="flex flex-col gap-2 overflow-y-auto">
                                {selectedReportCase.reportCase.reports.map((report) => (
                                    <ReportCard key={report.id} report={report}/>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No reports found.</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
