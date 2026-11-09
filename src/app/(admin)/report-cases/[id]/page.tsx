'use client';
import {UserName} from "@/components/UserName";
import * as React from 'react';
import {useCallback, useEffect} from 'react';
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {AdminBreadcrumb} from "@/components/AdminBreadcrumb";
import {Ban, CheckCircle2, Flag, IdCard, MessageSquare, RotateCcw, Shield, ShieldAlert, ShieldBan, ShieldCheck, Undo2, X} from "lucide-react";
import {Card} from "@/components/ui/card";
import {useThunk} from "@/lib/hooks/useThunk";
import {useSelector} from "react-redux";
import {useParams, useRouter} from "next/navigation";
import AuditLogCardList from "@/components/AuditLogCardList";
import MessageCardList from "@/app/(admin)/report-cases/[id]/components/MessageCardList";
import ReportCard from "@/app/(admin)/report-cases/[id]/components/ReportCard";
import ReportCaseTriageBar from "@/app/(admin)/report-cases/[id]/components/ReportCaseTriageBar";
import ActionButton from "@/components/ActionButton";
import {isMessageRestorable, Message} from "@/models/message";
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
import {recordNotCsam, reopenCase, requestElevation} from "@/api/reportCases/reportCasesAPI";
import {restoreMessage} from "@/api/chatting/chattingAPI";
import {apiErrorMessage} from "@/lib/apiError";
import {requireIdVerification} from "@/api/admin/adminAPI";
import {ConfirmModal} from "@/components/ConfirmModal";
import {IdVerificationStatusBadge} from "@/components/IdVerificationStatusBadge";
import BanRequestForm from "@/features/chatroom/components/BanRequestForm";
import NcmecReportForm from "@/app/(admin)/report-cases/[id]/components/NcmecReportForm";
import NotCsamDecisionForm from "@/app/(admin)/report-cases/[id]/components/NotCsamDecisionForm";
import {NcmecReportRequest} from "@/models/NcmecReportRequest";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {BanRequest} from "@/models/BanRequest";
import {format} from "date-fns";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {selectUser} from "@/redux/user/userSelectors";
import {canActOn} from "@/models/Role";
import {isCsamReportCase} from "@/lib/reportUtils";
import {AuditLogType, NOT_CSAM_ACTION} from "@/models/AuditLog";
import {ReportType} from "@/models/ReportTypeEnum";
import {ReportTypeUtils} from "@/lib/utils";
import {ROUTES} from "@/routes";

export default function Page() {
    const params = useParams();
    const router = useRouter();
    const {open, close} = useDialog();
    const {currentRole, isAdmin} = useRoleAccess();

    const reportCaseId = Number(params.id);
    const [fetchReportCase] = useThunk(getReportCaseThunk);
    const [fetchSurroundingMessages, fetchMessagesLoading] = useThunk(fetchReportedMessageSurroundingMessagesThunk);
    const [removeMessage] = useThunk(deleteMessageThunk);
    const [warnUser, warnUserLoading, warnUserError] = useThunk(warnUserThunkReportCase);
    const [banUser, banUserLoading, banUserError] = useThunk(banUserThunkReportCase);
    const [resolveCase, resolveCaseLoading, resolveCaseError] = useThunk(resolveCaseThunk);
    const [submitNcmecReport, ncmecLoading] = useThunk(submitNcmecReportThunk);

    const selectedReportCase = useSelector(selectSelectedReportCase);
    const currentUser = useSelector(selectUser);
    const surroundingMessages = useSelector(selectSelectedReportCaseMessages);

    // Helper to check if case is resolved
    const isResolved = selectedReportCase?.reportCase?.resolutionDate !== null;

    // Check if any NCMEC audit log exists on this case
    const hasNcmecLog = (selectedReportCase?.reportCase?.auditLogs ?? [])
        .some(log => log.auditLogType === AuditLogType.NCMEC_REPORT);

    // Check if this case was recorded as not CSAM
    const hasNotCsamDecision = (selectedReportCase?.reportCase?.auditLogs ?? [])
        .some(log => log.action === NOT_CSAM_ACTION);

    const isCsamCase = Boolean(selectedReportCase?.reportCase?.csamCase) || isCsamReportCase(selectedReportCase?.reportCase?.reports ?? []);

    // A CSAM-related case stays fileable, even once resolved, until it is filed or recorded as not CSAM
    const ncmecDecisionPending = Boolean(selectedReportCase?.reportCase?.ncmecDecisionPending);
    const canDecideNcmec = ncmecDecisionPending && isAdmin();

    // Underage cases can require the reported user to verify their age via Stripe Identity
    const hasUnderageReport = (selectedReportCase?.reportCase?.reports ?? [])
        .some(report => report.reportType === ReportType.UNDERAGE);
    const reportedMessage = selectedReportCase?.reportCase?.message;
    const reportedUserIdStatus = reportedMessage?.senderIdVerificationStatus ?? 'NONE';
    const idVerificationDisabled = reportedUserIdStatus === 'REQUIRED'
        || reportedUserIdStatus === 'PENDING'
        || reportedUserIdStatus === 'VERIFIED';
    const idVerificationDisabledReason = reportedUserIdStatus === 'VERIFIED'
        ? "The user has already verified their age"
        : reportedUserIdStatus === 'PENDING'
            ? "The user's ID verification is already under review"
            : reportedUserIdStatus === 'REQUIRED'
                ? "ID verification has already been required for this user"
                : undefined;

    // Redact messages for resolved CSAM cases, when CSAM flag is true, or when an NCMEC log exists.
    // The admins who still have to make the NCMEC decision need to see the content,
    // and a case recorded as not CSAM has nothing to redact.
    const shouldRedactMessages = hasNcmecLog || selectedReportCase?.reportCase?.csamCase || (isResolved && isCsamCase && !canDecideNcmec && !hasNotCsamDecision);

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

    // Says why when the server refuses, and reloads the case: the usual reason is that someone
    // else claimed or closed it since this page loaded.
    const reportActionFailure = async (error: unknown) => {
        toast.error(apiErrorMessage(error));
        await refetchData();
    };

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
            await reportActionFailure(error);
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
            // Says why when the server refuses, e.g. the case was resolved since this page loaded.
            toast.error(apiErrorMessage(error));
        }
    }

    const handleDeleteMessage = () => {
        if (!selectedReportCase?.reportCase?.message?.id) {
            toast.error("Message data not available");
            return;
        }

        const messageId = selectedReportCase.reportCase.message.id;
        const reportCaseId = selectedReportCase.reportCase.id;
        const senderUsername = selectedReportCase.reportCase.message.senderUsername;

        open(
            <ConfirmModal
                title="Remove this message?"
                description={isCsamCase
                    ? `${senderUsername}'s message will be hidden from everyone except staff. Removals on child-safety cases cannot be undone.`
                    : `${senderUsername}'s message will be hidden from everyone except staff. Staff can restore it for 24 hours.`}
                onClose={close}
                onConfirm={async () => {
                    try {
                        await removeMessage({messageId: messageId, reportCaseId: reportCaseId});
                        close();
                        toast.success("Message deleted successfully");
                        setTimeout(() => {
                            refetchData();
                        }, 100);
                    } catch (error) {
                        close();
                        await reportActionFailure(error);
                    }
                }}
            />
        );
    };

    const handleRestoreMessage = () => {
        const message = selectedReportCase?.reportCase?.message;
        if (!message?.id) {
            toast.error("Message data not available");
            return;
        }

        open(
            <ConfirmModal
                title="Restore this message?"
                description={`${message.senderUsername}'s message will be visible to everyone in the room again.`}
                onClose={close}
                onConfirm={async () => {
                    try {
                        await restoreMessage(message.id);
                        close();
                        toast.success("Message restored");
                        await refetchData();
                    } catch (error) {
                        close();
                        toast.error(apiErrorMessage(error));
                    }
                }}
            />
        );
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
            await reportActionFailure(error);
        }
        close();
    };

    const handleResolveCase = () => {
        if (!selectedReportCase?.reportCase?.id) {
            toast.error("Report case data not available");
            return;
        }

        const reportCaseId = selectedReportCase.reportCase.id;
        open(
            <ConfirmModal
                title="Resolve this case?"
                description="The case leaves the open queue. Staff can reopen it if this was a mistake."
                onClose={close}
                onConfirm={async () => {
                    try {
                        await resolveCase(reportCaseId);
                        close();
                        toast.success("Report case resolved successfully");
                        await refetchData();
                    } catch (error) {
                        close();
                        // Says why when the server refuses, e.g. a child-safety report arrived since this page loaded.
                        await reportActionFailure(error);
                    }
                }}
            />
        );
    }

    const handleReopenCase = () => {
        open(
            <ConfirmModal
                title="Reopen this case?"
                description="The case returns to the open queue. Bans, warnings and removals already applied stay in place."
                onClose={close}
                onConfirm={async () => {
                    try {
                        await reopenCase(reportCaseId);
                        close();
                        toast.success("Report case reopened");
                        await refetchData();
                    } catch (error) {
                        close();
                        toast.error(apiErrorMessage(error));
                    }
                }}
            />
        );
    }

    const handleRequireIdVerification = () => {
        const reportedUserId = reportedMessage?.senderId;
        const caseId = selectedReportCase?.reportCase?.id;

        if (!reportedUserId || !caseId) {
            toast.error("Report case data not available");
            return;
        }

        open(
            <ConfirmModal
                title="Require ID verification?"
                description={`The reported user will be blocked from using the app until they verify their age with a government ID through Stripe Identity.`}
                onClose={close}
                onConfirm={async () => {
                    try {
                        await requireIdVerification(reportedUserId, caseId);
                        close();
                        toast.success("ID verification required for the reported user");
                        await refetchData();
                    } catch (error) {
                        close();
                        await reportActionFailure(error);
                    }
                }}
            />
        );
    };

    const handleNcmecSubmit = async (request: NcmecReportRequest): Promise<void> => {
        try {
            await submitNcmecReport(request);
            close();
            toast.success("NCMEC report submitted successfully. The user has been banned and quarantined, and their files have been deleted.");
            await refetchData();
        } catch (error) {
            // The server refuses before filing when a precondition fails; show why.
            toast.error(error instanceof Error && error.message ? error.message : "Failed to submit NCMEC report");
            throw error;
        }
    };

    const handleNotCsamSubmit = async (reason: string): Promise<void> => {
        try {
            await recordNotCsam(reportCaseId, reason);
            close();
            toast.success("Recorded as not CSAM. The case is resolved.");
            await refetchData();
        } catch (error) {
            toast.error("Failed to record the decision");
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

    // The case object can still be empty on the first render after navigating here.
    const canActOnSender = reportedMessage != null && canActOn(currentRole, reportedMessage.senderRole);

    // Someone else's claimed case has to be taken over before acting on it; admins can step in.
    // The server refuses too.
    const caseAssignee = selectedReportCase.reportCase.assignee;
    const claimedByOther = caseAssignee != null && caseAssignee.id !== currentUser?.id && !isAdmin();
    const claimedByOtherReason = claimedByOther
        ? `Claimed by ${caseAssignee.username}. Take over the case to act on it.`
        : undefined;

    // Child-safety cases can be neither restored nor reopened (the server refuses too).
    const restoreMessageAction = canActOnSender && !isCsamCase && isMessageRestorable(reportedMessage) && (
        <ActionButton
            icon={<Undo2 className="h-5 w-5 text-teal-600"/>}
            label="Restore Message"
            className="p-2 text-[10px] sm:p-3 sm:text-xs"
            onClick={() => handleRestoreMessage()}
        />
    );
    const reopenCaseAction = canActOnSender && !isCsamCase && (
        <ActionButton
            icon={<RotateCcw className="h-5 w-5 text-sky-600"/>}
            label="Reopen Case"
            className="p-2 text-[10px] sm:p-3 sm:text-xs"
            onClick={() => handleReopenCase()}
        />
    );

    // NCMEC Report and its counterpart - CSAM cases awaiting the decision, admins and super admins only
    const ncmecDecisionActions = canDecideNcmec && (
        <>
            <ActionButton
                icon={<ShieldBan className="h-5 w-5 text-red-700"/>}
                label="NCMEC Report"
                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                disabled={!canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
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
            <ActionButton
                icon={<ShieldCheck className="h-5 w-5 text-gray-500"/>}
                label="Not CSAM"
                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                disabled={!canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
                onClick={() => open(<NotCsamDecisionForm onSubmit={handleNotCsamSubmit} onClose={close}/>)}
            />
        </>
    );

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
                    {selectedReportCase.reportCase.id !== undefined && (
                        <ReportCaseTriageBar reportCase={selectedReportCase.reportCase}/>
                    )}
                    {hasUnderageReport && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                                Reported user{reportedMessage?.senderUsername && <>: <UserName
                                    userId={reportedMessage.senderId} username={reportedMessage.senderUsername}
                                    usernameFont={reportedMessage.senderUsernameFont} messageFont={reportedMessage.senderMessageFont}
                                    fontRevision={reportedMessage.senderFontRevision}
                                    vipBadgeVisible={reportedMessage.senderVipBadgeVisible} vipBadgeRevision={reportedMessage.senderVipBadgeRevision}/></>}
                            </span>
                            <IdVerificationStatusBadge status={reportedUserIdStatus}/>
                        </div>
                    )}
                    {!isResolved && claimedByOther && (
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertDescription className="text-amber-800">
                                {caseAssignee?.username} is handling this case. Take it over to warn or ban the
                                user, remove the message or resolve the case.
                            </AlertDescription>
                        </Alert>
                    )}
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

                            {canDecideNcmec && (
                                <Alert className="border-amber-200 bg-amber-50">
                                    <AlertDescription className="text-amber-800">
                                        This case still needs a decision: file an NCMEC report or record it as not CSAM.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Resolved cases keep navigation (hidden for NCMEC) and any NCMEC decision still owed */}
                            {!hasNcmecLog && (
                                <div className="flex gap-2">
                                    <ActionButton
                                        icon={<MessageSquare className="h-5 w-5 text-blue-500"/>}
                                        label="Go to Message"
                                        onClick={() =>
                                            handleJumpTo(selectedReportCase.reportCase.message)
                                        }
                                    />
                                    {ncmecDecisionActions}
                                    {restoreMessageAction}
                                    {reopenCaseAction}
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
                                disabled={claimedByOther || !canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
                                title={claimedByOtherReason}
                                onClick={() => {
                                    open(
                                        <WarnUserComponent onSubmit={handleWarning}/>
                                    )
                                }}
                            />
                            {restoreMessageAction || (
                                <ActionButton
                                    icon={<X className="h-5 w-5 text-gray-500"/>}
                                    label="Remove Message"
                                    className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                    disabled={claimedByOther || selectedReportCase.reportCase?.message?.deleted || !canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
                                    title={claimedByOtherReason}
                                    onClick={() => handleDeleteMessage()}
                                />
                            )}
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
                                                                <span className="font-medium">
                                                                    {ncmecDecisionPending
                                                                        ? "This case stays open after the ban so it can still be reported to NCMEC"
                                                                        : "Banning this user will automatically resolve the report case"}
                                                                </span>
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
                                disabled={claimedByOther || !canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
                                title={claimedByOtherReason}
                            />

                            {ncmecDecisionActions}

                            {/* Require ID Verification - Only visible for underage cases */}
                            {hasUnderageReport && (
                                <ActionButton
                                    icon={<IdCard className="h-5 w-5 text-amber-600"/>}
                                    label="Require ID Verification"
                                    className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                    disabled={claimedByOther || idVerificationDisabled}
                                    title={claimedByOtherReason ?? idVerificationDisabledReason}
                                    onClick={() => handleRequireIdVerification()}
                                />
                            )}

                            {/* Case resolution */}
                            <ActionButton
                                icon={<CheckCircle2 className="h-5 w-5 text-green-600"/>}
                                label="Resolve Case"
                                className="p-2 text-[10px] sm:p-3 sm:text-xs"
                                disabled={claimedByOther || ncmecDecisionPending || !canActOn(currentRole, selectedReportCase.reportCase.message.senderRole)}
                                title={ncmecDecisionPending ? "An admin closes this case by filing an NCMEC report or recording it as not CSAM" : claimedByOtherReason}
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
                                // Never bring child-safety media into view unprompted (HB-04).
                                scrollToReported={!isCsamCase}
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
