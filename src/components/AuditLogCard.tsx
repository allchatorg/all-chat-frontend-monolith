import {AuditLogType, AuditLogUnion, getAuditLogActorLabel} from "@/models/AuditLog";
import {Badge} from "./ui/badge";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {
    AlertTriangle,
    Archive,
    ArchiveRestore,
    ArrowDownCircle,
    ArrowUpCircle,
    Ban,
    Calendar,
    CheckCircle,
    Clock,
    MessageSquareX,
    ShieldBan,
    User,
    UserCheck
} from "lucide-react";
import {Card, CardContent, CardHeader} from "./ui/card";
import {getReportTypeLabel} from "@/lib/reportUtils";

const formatDuration = (seconds: number): string => {
    if (seconds === 0) return 'Permanent';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

const getActionIcon = (type: AuditLogType) => {
    const iconProps = {className: "w-5 h-5"};

    switch (type) {
        case AuditLogType.BAN:
            return <Ban {...iconProps} className="h-5 w-5 text-red-500 dark:text-red-400"/>;
        case AuditLogType.REVOKE_BAN:
            return <UserCheck {...iconProps} className="h-5 w-5 text-green-500 dark:text-green-400"/>;
        case AuditLogType.MESSAGE_DELETE:
            return <MessageSquareX {...iconProps} className="h-5 w-5 text-orange-500 dark:text-orange-400"/>;
        case AuditLogType.CHANGE_USERNAME:
            return <User {...iconProps} className="h-5 w-5 text-blue-500 dark:text-blue-400"/>;
        case AuditLogType.WARNING:
            return <AlertTriangle {...iconProps} className="h-5 w-5 text-yellow-500 dark:text-yellow-400"/>;
        case AuditLogType.RESOLVE_CASE:
            return <CheckCircle {...iconProps} className="h-5 w-5 text-purple-500 dark:text-purple-400"/>;
        case AuditLogType.PROMOTE_ROLE:
            return <ArrowUpCircle {...iconProps} className="h-5 w-5 text-emerald-600 dark:text-emerald-400"/>;
        case AuditLogType.DEMOTE_ROLE:
            return <ArrowDownCircle {...iconProps} className="h-5 w-5 text-rose-500 dark:text-rose-400"/>;
        case AuditLogType.NCMEC_REPORT:
            return <ShieldBan {...iconProps} className="h-5 w-5 text-red-700 dark:text-red-500"/>;
        case AuditLogType.ARCHIVE_CHATROOM:
            return <Archive {...iconProps} className="h-5 w-5 text-slate-600 dark:text-slate-300"/>;
        case AuditLogType.UNARCHIVE_CHATROOM:
            return <ArchiveRestore {...iconProps} className="h-5 w-5 text-cyan-600 dark:text-cyan-400"/>;
        default:
            return null;
    }
};

const getActionColor = (type: AuditLogType) => {
    switch (type) {
        case AuditLogType.BAN:
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case AuditLogType.REVOKE_BAN:
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case AuditLogType.MESSAGE_DELETE:
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
        case AuditLogType.CHANGE_USERNAME:
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        case AuditLogType.WARNING:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
        case AuditLogType.RESOLVE_CASE:
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
        case AuditLogType.PROMOTE_ROLE:
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
        case AuditLogType.DEMOTE_ROLE:
            return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
        case AuditLogType.NCMEC_REPORT:
            return 'bg-red-200 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700';
        case AuditLogType.ARCHIVE_CHATROOM:
            return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
        case AuditLogType.UNARCHIVE_CHATROOM:
            return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

const renderLogDetails = (log: AuditLogUnion) => {
    switch (log.auditLogType) {
        case AuditLogType.BAN:
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Banned User:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.targetUser.username}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Report Type:</span>
                        <Badge variant="outline" className="text-xs">
                            {getReportTypeLabel(log.reportType)}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Type:</span>
                        <Badge
                            variant={log.banType === BanTypeEnum.PERMANENT ? "destructive" : "secondary"}
                            className="text-xs"
                        >
                            {log.banType}
                        </Badge>
                    </div>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-red-300 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/10">
                            <span className="text-sm text-red-800 break-words dark:text-red-300">
                                {log.description}
                            </span>
                        </div>
                    )}
                    {log.banDurationSeconds > 0 && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                            <span className="text-sm">Duration: {formatDuration(log.banDurationSeconds)}</span>
                        </div>
                    )}
                    {log.deleteMessages && (
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                            Messages deleted ({formatDuration(log.deleteMessagesDurationSeconds)})
                        </div>
                    )}
                </div>
            );

        case AuditLogType.REVOKE_BAN:
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Target User:</span>
                    <span
                        className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                        {log.targetUser.username}
                    </span>
                </div>
            );

        case AuditLogType.MESSAGE_DELETE:
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Message Author:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.deletedMessage.senderUsername}
                        </span>
                    </div>
                    <div
                        className="rounded border-l-4 border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                        <span className="text-sm italic text-gray-600 dark:text-gray-400">
                            "{log.deletedMessage.content}"
                        </span>
                    </div>
                </div>
            );

        case AuditLogType.CHANGE_USERNAME:
            return (
                <div className="flex items-center gap-2">
                    <span
                        className="rounded bg-red-100 px-2 py-1 font-mono text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {log.oldUsername}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">→</span>
                    <span
                        className="rounded bg-green-100 px-2 py-1 font-mono text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {log.newUsername}
                    </span>
                </div>
            );

        case AuditLogType.WARNING:
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Warned User:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.targetUser.username}
                        </span>
                    </div>
                    {
                        log.description.length > 0 && (
                            <div
                                className="rounded border-l-4 border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/10">
                                <span className="text-sm text-yellow-800 dark:text-yellow-300">
                                    {log.description}
                                </span>
                            </div>
                        )
                    }
                </div>
            );

        case AuditLogType.RESOLVE_CASE:
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Resolved Case ID:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.reportCaseId}
                        </span>
                    </div>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-purple-300 bg-purple-50 p-3 dark:border-purple-700 dark:bg-purple-900/10">
                            <span className="text-sm text-purple-800 dark:text-purple-300">
                                {log.description}
                            </span>
                        </div>
                    )}
                </div>
            );
        case AuditLogType.PROMOTE_ROLE:
        case AuditLogType.DEMOTE_ROLE:
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Target User:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.targetUser.username}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="rounded bg-red-100 px-2 py-1 font-mono text-xs text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {(log as any).previousRole}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">→</span>
                        <span
                            className="rounded bg-green-100 px-2 py-1 font-mono text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {(log as any).newRole}
                        </span>
                    </div>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-blue-300 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/10">
                            <span className="text-sm text-blue-800 dark:text-blue-300">
                                {log.description}
                            </span>
                        </div>
                    )}
                </div>
            );

        case AuditLogType.NCMEC_REPORT:
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">NCMEC Report ID:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.ncmecReportId}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Report Case ID:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.reportCaseId}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <span
                            className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {log.status}
                        </span>
                    </div>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-red-400 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/10">
                            <span className="text-sm text-red-800 dark:text-red-300">
                                {log.description}
                            </span>
                        </div>
                    )}
                </div>
            );

        case AuditLogType.ARCHIVE_CHATROOM:
        case AuditLogType.UNARCHIVE_CHATROOM:
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Chat Room:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.chatRoomName}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Chat Room ID:</span>
                        <span
                            className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800 dark:text-gray-100">
                            {log.chatRoomId}
                        </span>
                    </div>
                    {log.description && (
                        <div
                            className="rounded border-l-4 border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/10">
                            <span className="text-sm text-slate-800 dark:text-slate-300">
                                {log.description}
                            </span>
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
};

export const AuditLogCard = ({log}: { log: AuditLogUnion }) => {
    const formattedDate = new Date(log.createdAt).toLocaleString();
    const actorLabel = getAuditLogActorLabel(log);

    return (
        <Card className="glass-surface w-full">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        {getActionIcon(log.auditLogType)}
                        <div>
                            <h3 className="text-lg font-semibold leading-none sm:leading-normal">{log.action}</h3>
                            <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                    </div>
                    <div className="self-start sm:self-auto">
                        <Badge className={getActionColor(log.auditLogType)}>
                            {log.auditLogType.replace(/_/g, ' ')}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {renderLogDetails(log)}
                <div
                    className="flex flex-col gap-2 border-t border-[color:var(--glass-border)] pt-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4"/>
                        <span>by {actorLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4"/>
                        <span>{formattedDate}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
