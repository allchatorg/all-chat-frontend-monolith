'use client';

import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import Link from "next/link";
import {ArrowLeft, Gavel, Scale, Shield, User as UserIcon} from "lucide-react";
import {toast} from 'sonner';
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import AuditLogCardList from "@/components/AuditLogCardList";
import MessageCardList from "@/app/(admin)/report-cases/[id]/components/MessageCardList";
import {useDialog} from "@/components/providers/DialogProvider";
import {useThunk} from "@/lib/hooks/useThunk";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {claimAppealThunk, getAppealThunk, resolveAppealThunk} from "@/redux/appeals/appealsThunk";
import {selectSelectedAppeal} from "@/redux/appeals/appealsSelector";
import {getUserMessagesThunk} from "@/redux/admin/adminThunk";
import {searchAuditLogs} from "@/redux/audit-logs/auditLogsThunk";
import {BanAppealResolutionRequest, BanAppealStatus} from "@/models/BanAppeal";
import {AuditLogUnion} from "@/models/AuditLog";
import {Message} from "@/models/message";
import {getReportTypeLabel} from "@/lib/reportUtils";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {AppealStatusBadge} from "../components/AppealStatusBadge";
import AppealResolutionForm from "./components/AppealResolutionForm";
import {ROUTES} from "@/routes";

export default function AppealDetailPage() {
    const params = useParams();
    const router = useRouter();
    const {open, close} = useDialog();
    const {isAdmin, isPrincipal} = useRoleAccess();

    const appealId = Number(params.id);
    const [fetchAppeal, isLoading] = useThunk(getAppealThunk);
    const [claimAppeal, claimLoading] = useThunk(claimAppealThunk);
    const [resolveAppeal] = useThunk(resolveAppealThunk);
    const [fetchUserMessages] = useThunk(getUserMessagesThunk);
    const [fetchAuditLogs] = useThunk(searchAuditLogs);

    const appeal = useSelector(selectSelectedAppeal);

    const [messages, setMessages] = useState<Message[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogUnion[]>([]);

    const refetch = useCallback(async () => {
        if (!appealId) return;
        try {
            const detail = await fetchAppeal(appealId);
            if (detail) {
                fetchUserMessages({senderUsername: detail.summary.username, page: 0, size: 20})
                    .then(page => setMessages(page.content))
                    .catch(() => setMessages([]));
                fetchAuditLogs({targetUserId: detail.summary.userId, page: 0, size: 20})
                    .then(page => setAuditLogs(page.content))
                    .catch(() => setAuditLogs([]));
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load the appeal');
        }
    }, [appealId, fetchAppeal, fetchUserMessages, fetchAuditLogs]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    if (isLoading || !appeal || appeal.summary.id !== appealId) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
    }

    const summary = appeal.summary;
    const isOpen = summary.status === BanAppealStatus.PENDING || summary.status === BanAppealStatus.UNDER_REVIEW;
    const isSelfReview = summary.bannedByUserId != null && isPrincipal(summary.bannedByUserId);

    const handleClaim = async () => {
        try {
            await claimAppeal(appealId);
            toast.success("Appeal claimed for review.");
        } catch (error: any) {
            toast.error(error?.message || "Failed to claim the appeal");
        }
    };

    const handleResolve = async (request: BanAppealResolutionRequest) => {
        try {
            await resolveAppeal({appealId, request});
            close();
            toast.success(request.decision === 'APPROVED'
                ? `Appeal approved — ${summary.username} has been unbanned.`
                : "Appeal denied — the ban stays in place.");
            refetch();
        } catch (error: any) {
            toast.error(error?.message || "Failed to resolve the appeal");
        }
    };

    const openResolveDialog = () => {
        open(
            <AppealResolutionForm
                username={summary.username}
                onSubmit={handleResolve}
                onCancel={close}
            />
        );
    };

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-2 sm:space-y-4 overflow-y-auto pb-6">
            <AdminPageHeader
                title={`Appeal #${summary.id}`}
                description={`Submitted by ${summary.username} on ${new Date(summary.submittedAt).toLocaleString()}`}
                icon={Scale}
            />

            <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.APPEALS)}>
                    <ArrowLeft className="mr-1 h-4 w-4"/>
                    Back to appeals
                </Button>
                <div className="ml-auto flex items-center gap-2">
                    {isOpen && isAdmin() && summary.status === BanAppealStatus.PENDING && (
                        <Button variant="outline" size="sm" onClick={handleClaim} disabled={claimLoading}>
                            {claimLoading ? "Claiming..." : "Claim for review"}
                        </Button>
                    )}
                    {isOpen && isAdmin() && (
                        <Button size="sm" onClick={openResolveDialog}>
                            <Gavel className="mr-1 h-4 w-4"/>
                            Resolve
                        </Button>
                    )}
                </div>
            </div>

            {isSelfReview && isOpen && (
                <Alert variant="destructive">
                    <AlertDescription>
                        You issued this ban. Consider letting another admin review this appeal.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
                {/* Appeal */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2 text-lg">
                            <span className="flex items-center gap-2">
                                <Scale className="h-5 w-5"/>
                                Appeal
                            </span>
                            <AppealStatusBadge status={summary.status}/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                Why the ban should be reconsidered
                            </span>
                            <p className="mt-1 whitespace-pre-wrap wrap-break-word">{appeal.appealText}</p>
                        </div>
                        {appeal.whatWillChange && (
                            <div>
                                <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                    What they say will change
                                </span>
                                <p className="mt-1 whitespace-pre-wrap wrap-break-word">{appeal.whatWillChange}</p>
                            </div>
                        )}
                        {summary.reviewerUsername && (
                            <p className="text-muted-foreground">
                                Reviewer: <span className="font-medium text-foreground">{summary.reviewerUsername}</span>
                            </p>
                        )}
                        {appeal.internalNote && (
                            <div className="rounded border-l-4 border-indigo-300 bg-indigo-50 p-3 dark:border-indigo-700 dark:bg-indigo-900/10">
                                <span className="block text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                                    Internal note ({appeal.resolvedByUsername ?? "staff"})
                                </span>
                                <p className="mt-1 text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap wrap-break-word">
                                    {appeal.internalNote}
                                </p>
                            </div>
                        )}
                        {appeal.userFacingMessage && (
                            <div className="rounded border-l-4 border-blue-300 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/10">
                                <span className="block text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                                    Message sent to user
                                </span>
                                <p className="mt-1 text-blue-900 dark:text-blue-200 whitespace-pre-wrap wrap-break-word">
                                    {appeal.userFacingMessage}
                                </p>
                            </div>
                        )}
                        {summary.resolvedAt && (
                            <p className="text-xs text-muted-foreground">
                                Resolved {new Date(summary.resolvedAt).toLocaleString()}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Ban + user context */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5"/>
                            Ban #{summary.banId}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={summary.banType === BanTypeEnum.PERMANENT ? "destructive" : "secondary"}>
                                {summary.banType}
                            </Badge>
                            <Badge variant="outline">{getReportTypeLabel(summary.reportType)}</Badge>
                            <Badge variant={appeal.banActive ? "destructive" : "secondary"}>
                                {appeal.banActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        {summary.banDescription && (
                            <div>
                                <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                    Ban description
                                </span>
                                <p className="mt-1 whitespace-pre-wrap wrap-break-word">{summary.banDescription}</p>
                            </div>
                        )}
                        <div className="space-y-1 text-muted-foreground">
                            <p>Issued {new Date(appeal.banCreatedAt).toLocaleString()}
                                {summary.bannedByUsername && <> by <span
                                    className="font-medium text-foreground">{summary.bannedByUsername}</span></>}
                            </p>
                            {appeal.banExpiresAt && (
                                <p>Expires {new Date(appeal.banExpiresAt).toLocaleString()}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 border-t pt-3">
                            <UserIcon className="h-4 w-4 text-muted-foreground"/>
                            <Link
                                href={`/users/${summary.userId}/details`}
                                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {summary.username}
                            </Link>
                            <span className="text-muted-foreground">
                                · {appeal.priorBanCount} prior ban{appeal.priorBanCount === 1 ? "" : "s"}
                            </span>
                        </div>
                        {appeal.priorBans.length > 0 && (
                            <div className="space-y-2">
                                {appeal.priorBans.map((ban) => (
                                    <div key={ban.id}
                                         className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
                                        <span className="text-xs text-muted-foreground">#{ban.id}</span>
                                        <Badge
                                            variant={ban.type === BanTypeEnum.PERMANENT ? "destructive" : "secondary"}
                                            className="text-xs">
                                            {ban.type}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {getReportTypeLabel(ban.reportType)}
                                        </Badge>
                                        <Badge variant={ban.active ? "destructive" : "secondary"} className="text-xs">
                                            {ban.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <MessageCardList
                messages={messages}
                title={`Recent messages by ${summary.username}`}
                maxHeight="400px"
            />

            <AuditLogCardList
                logs={auditLogs}
                title={`Moderation history for ${summary.username}`}
                height="clamp(600px, 75vh, 800px)"
                maxHeight="clamp(600px, 75vh, 800px)"
            />
        </div>
    );
}
