import * as React from "react";
import {useEffect, useState} from "react";
import Link from "next/link";
import {useSelector} from "react-redux";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {ConfirmModal} from "@/components/ConfirmModal";
import {useDialog} from "@/components/providers/DialogProvider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ReportSeverityBadge} from "@/app/(admin)/report-cases/components/ReportSeverityBadge";
import {ReportCaseTimer} from "@/app/(admin)/report-cases/components/ReportCaseTimer";
import {ReportCase} from "@/models/ReportCase";
import {User} from "@/models/User";
import {getAssignableStaff} from "@/api/reportCases/reportCasesAPI";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {useThunk} from "@/lib/hooks/useThunk";
import {selectUser} from "@/redux/user/userSelectors";
import {
    assignCaseThunk,
    claimCaseThunk,
    getReportCaseThunk,
    releaseCaseThunk,
    takeOverCaseThunk
} from "@/redux/report-cases/reportCasesThunk";
import {ROUTES} from "@/routes";

export default function ReportCaseTriageBar({reportCase}: { reportCase: ReportCase }) {
    const {isAdmin} = useRoleAccess();
    const {open, close} = useDialog();
    const currentUser = useSelector(selectUser);
    const [claimCase, claimLoading] = useThunk(claimCaseThunk);
    const [releaseCase, releaseLoading] = useThunk(releaseCaseThunk);
    const [assignCase, assignLoading] = useThunk(assignCaseThunk);
    const [takeOverCase, takeOverLoading] = useThunk(takeOverCaseThunk);
    const [fetchReportCase] = useThunk(getReportCaseThunk);
    const [staff, setStaff] = useState<User[]>([]);

    const {id, assignee, resolutionDate} = reportCase;
    const isOpen = resolutionDate === null;
    const isAssignee = Boolean(assignee) && assignee?.id === currentUser?.id;
    const canAssign = isOpen && isAdmin();
    const isBusy = claimLoading || releaseLoading || assignLoading || takeOverLoading;

    useEffect(() => {
        if (!canAssign) {
            return;
        }

        getAssignableStaff().then(setStaff).catch(() => toast.error("Failed to load the staff list"));
    }, [canAssign]);

    const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
        try {
            await action();
            toast.success(success);
        } catch (error) {
            toast.error(error instanceof Error && error.message ? error.message : failure);
            // The usual failure is that someone else got there first: show who.
            await fetchReportCase(id).catch(() => undefined);
        }
    };

    const confirmTakeOver = () => open(
        <ConfirmModal
            title={`Take over this case from ${assignee?.username}?`}
            description="You become the assignee and they are notified. The takeover is recorded on the case."
            onClose={close}
            onConfirm={async () => {
                await run(() => takeOverCase(id), "Case taken over", "Failed to take over the case");
                close();
            }}
        />
    );

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <ReportSeverityBadge severity={reportCase.severity} showName/>
            <ReportCaseTimer
                createdAt={reportCase.createdAt}
                firstActionDueAt={reportCase.firstActionDueAt}
                firstActionAt={reportCase.firstActionAt}
                resolutionDate={resolutionDate}
            />
            <span>
                Assignee: <span className="font-medium">{isAssignee ? "You" : assignee?.username ?? "Unclaimed"}</span>
            </span>

            {isOpen && !assignee && (
                <Button size="sm" variant="outline" disabled={isBusy}
                        onClick={() => run(() => claimCase(id), "Case claimed", "Failed to claim the case")}>
                    Claim
                </Button>
            )}
            {isOpen && assignee && !isAssignee && (
                <Button size="sm" variant="outline" disabled={isBusy} onClick={confirmTakeOver}>
                    Take over
                </Button>
            )}
            {isOpen && assignee && (isAssignee || isAdmin()) && (
                <Button size="sm" variant="outline" disabled={isBusy}
                        onClick={() => run(() => releaseCase(id), "Case released", "Failed to release the case")}>
                    Release
                </Button>
            )}
            {canAssign && (
                <Select
                    value=""
                    disabled={isBusy}
                    onValueChange={(assigneeId) => run(
                        () => assignCase({reportCaseId: id, assigneeId: Number(assigneeId)}),
                        "Case assigned",
                        "Failed to assign the case"
                    )}
                >
                    <SelectTrigger className="h-9 w-40" aria-label="Assign to">
                        <SelectValue placeholder="Assign to..."/>
                    </SelectTrigger>
                    <SelectContent>
                        {/* On an unclaimed case an admin takes it with Claim, which can't overwrite someone else's. */}
                        {staff.filter((member) => member.id !== (assignee?.id ?? currentUser?.id)).map((member) => (
                            <SelectItem key={member.id} value={String(member.id)}>{member.username}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {reportCase.message?.senderId && (
                <Link
                    href={`${ROUTES.REPORTS}?resolved=false&reportedUserUsernameOrId=${reportCase.message.senderId}`}
                    className="ml-auto text-sm underline underline-offset-2"
                >
                    Open cases about this user
                </Link>
            )}
        </div>
    );
}
