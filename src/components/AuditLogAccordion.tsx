"use client";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {AuditLogType, AuditLogUnion, getAuditLogActorLabel} from "@/models/AuditLog";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {
    AlertTriangle,
    Archive,
    ArchiveRestore,
    ArrowDownCircle,
    ArrowUpCircle,
    Ban,
    CheckCircle,
    Clock,
    MessageSquareX,
    ShieldBan,
    User,
    UserCheck,
} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {getReportTypeLabel} from "@/lib/reportUtils";

const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "Permanent";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
};

const getActionIcon = (type: AuditLogType) => {
    const iconProps = {className: "h-5 w-5"};
    switch (type) {
        case AuditLogType.BAN:
            return <Ban {...iconProps} className="text-red-500 dark:text-red-400"/>;
        case AuditLogType.REVOKE_BAN:
            return <UserCheck {...iconProps} className="text-green-500 dark:text-green-400"/>;
        case AuditLogType.MESSAGE_DELETE:
            return <MessageSquareX {...iconProps} className="text-orange-500 dark:text-orange-400"/>;
        case AuditLogType.CHANGE_USERNAME:
            return <User {...iconProps} className="text-blue-500 dark:text-blue-400"/>;
        case AuditLogType.WARNING:
            return <AlertTriangle {...iconProps} className="text-yellow-500 dark:text-yellow-400"/>;
        case AuditLogType.RESOLVE_CASE:
            return <CheckCircle {...iconProps} className="text-purple-500 dark:text-purple-400"/>;
        case AuditLogType.PROMOTE_ROLE:
            return <ArrowUpCircle {...iconProps} className="text-emerald-600 dark:text-emerald-400"/>;
        case AuditLogType.DEMOTE_ROLE:
            return <ArrowDownCircle {...iconProps} className="text-rose-500 dark:text-rose-400"/>;
        case AuditLogType.NCMEC_REPORT:
            return <ShieldBan {...iconProps} className="text-red-700 dark:text-red-500"/>;
        case AuditLogType.ARCHIVE_CHATROOM:
            return <Archive {...iconProps} className="text-slate-600 dark:text-slate-300"/>;
        case AuditLogType.UNARCHIVE_CHATROOM:
            return <ArchiveRestore {...iconProps} className="text-cyan-600 dark:text-cyan-400"/>;
        default:
            return null;
    }
};

const getActionColor = (type: AuditLogType) => {
    switch (type) {
        case AuditLogType.BAN:
            return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
        case AuditLogType.REVOKE_BAN:
            return "bg-green-100 text-green-800 border-green-200";
        case AuditLogType.MESSAGE_DELETE:
            return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
        case AuditLogType.CHANGE_USERNAME:
            return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
        case AuditLogType.WARNING:
            return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
        case AuditLogType.RESOLVE_CASE:
            return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
        case AuditLogType.PROMOTE_ROLE:
            return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
        case AuditLogType.DEMOTE_ROLE:
            return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
        case AuditLogType.NCMEC_REPORT:
            return "bg-red-200 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700";
        case AuditLogType.ARCHIVE_CHATROOM:
            return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
        case AuditLogType.UNARCHIVE_CHATROOM:
            return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
};

const renderLogDetails = (log: AuditLogUnion) => {
    switch (log.auditLogType) {
        case AuditLogType.BAN:
            return (
                <div className="space-y-2">
                    <Row label="Banned User" value={log.targetUser.username}/>
                    <Row
                        label="Report Type"
                        value={<Badge variant="outline">{getReportTypeLabel(log.reportType)}</Badge>}
                    />
                    <Row
                        label="Type"
                        value={
                            <Badge
                                variant={log.banType === BanTypeEnum.PERMANENT ? "destructive" : "secondary"}
                            >
                                {log.banType}
                            </Badge>
                        }
                    />
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-red-300 bg-red-50 p-3 text-sm text-red-800 wrap-break-word dark:border-red-700 dark:bg-red-900/10 dark:text-red-300">
                            {log.description}
                        </div>
                    )}
                    {log.banDurationSeconds > 0 && (
                        <Row
                            label="Duration"
                            value={
                                <>
                                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400"/>{" "}
                                    {formatDuration(log.banDurationSeconds)}
                                </>
                            }
                        />
                    )}
                    {log.deleteMessages && (
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                            Messages deleted ({formatDuration(log.deleteMessagesDurationSeconds)})
                        </p>
                    )}
                </div>
            );

        case AuditLogType.REVOKE_BAN:
            return <Row label="Target User" value={log.targetUser.username}/>;

        case AuditLogType.MESSAGE_DELETE:
            return (
                <div className="space-y-2">
                    <Row label="Message Author" value={log.deletedMessage.senderUsername}/>
                    <blockquote
                        className="rounded border-l-4 border-gray-300 bg-gray-50 p-3 text-sm italic text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                        "{log.deletedMessage.content}"
                    </blockquote>
                </div>
            );

        case AuditLogType.CHANGE_USERNAME:
            return (
                <div className="flex items-center gap-2">
                    <span
                        className="rounded bg-red-100 px-2 py-1 text-sm font-mono text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {log.oldUsername}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">→</span>
                    <span
                        className="rounded bg-green-100 px-2 py-1 text-sm font-mono text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {log.newUsername}
                    </span>
                </div>
            );

        case AuditLogType.WARNING:
            return (
                <div className="space-y-2">
                    <Row label="Warned User" value={log.targetUser.username}/>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-300">
                            {log.description}
                        </div>
                    )}
                </div>
            );

        case AuditLogType.RESOLVE_CASE:
            return (
                <div className="space-y-2">
                    <Row label="Resolved Case ID" value={log.reportCaseId}/>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-purple-300 bg-purple-50 p-3 text-sm text-purple-800 dark:border-purple-700 dark:bg-purple-900/10 dark:text-purple-300">
                            {log.description}
                        </div>
                    )}
                </div>
            );

        case AuditLogType.PROMOTE_ROLE:
        case AuditLogType.DEMOTE_ROLE:
            return (
                <div className="space-y-2">
                    <Row label="Target User" value={log.targetUser.username}/>
                    <div className="flex items-center gap-2">
                        <span
                            className="rounded bg-red-100 px-2 py-1 text-xs font-mono text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {(log as any).previousRole}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">→</span>
                        <span
                            className="rounded bg-green-100 px-2 py-1 text-xs font-mono text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {(log as any).newRole}
                        </span>
                    </div>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-blue-300 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-900/10 dark:text-blue-300">
                            {log.description}
                        </div>
                    )}
                </div>
            );

        case AuditLogType.NCMEC_REPORT:
            return (
                <div className="space-y-2">
                    <Row label="NCMEC Report ID" value={log.ncmecReportId}/>
                    <Row label="Report Case ID" value={log.reportCaseId}/>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <span
                            className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {log.status}
                        </span>
                    </div>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/10 dark:text-red-300">
                            {log.description}
                        </div>
                    )}
                </div>
            );

        case AuditLogType.ARCHIVE_CHATROOM:
        case AuditLogType.UNARCHIVE_CHATROOM:
            return (
                <div className="space-y-2">
                    <Row label="Chat Room" value={log.chatRoomName}/>
                    <Row label="Chat Room ID" value={log.chatRoomId}/>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/10 dark:text-slate-300">
                            {log.description}
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
};

// helper row for consistency
const Row = ({label, value}: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}:</span>
        <span
            className="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">{value}</span>
    </div>
);

export const AuditLogAccordion = ({logs}: { logs: AuditLogUnion[] }) => (
    <Accordion type="multiple" className="w-full space-y-2">
        {logs.map((log) => {
            const formattedDate = new Date(log.createdAt).toLocaleString();
            const actorLabel = getAuditLogActorLabel(log);
            return (
                <AccordionItem key={log.id} value={log.id.toString()}
                               className="rounded-lg border dark:border-gray-800">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div
                            className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                                <div className="mt-1 sm:mt-0">
                                    {getActionIcon(log.auditLogType)}
                                </div>
                                <div className="text-left w-full">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold break-all">{log.action}</span>
                                        <Badge
                                            className={`${getActionColor(log.auditLogType)} text-xs whitespace-nowrap`}>
                                            {log.auditLogType.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                    <span
                                        className="mt-1 block text-sm text-gray-500 dark:text-gray-400">{formattedDate}</span>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-2 text-sm text-gray-500 pl-8 sm:pl-0 dark:text-gray-400">
                                <User className="h-4 w-4 shrink-0"/>
                                <span className="truncate">by {actorLabel}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">{renderLogDetails(log)}</AccordionContent>
                </AccordionItem>
            );
        })}
    </Accordion>
);
