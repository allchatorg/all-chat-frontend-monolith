import {Badge} from "@/components/ui/badge";
import {BanAppealStatus} from "@/models/BanAppeal";

const STATUS_STYLES: Record<BanAppealStatus, string> = {
    [BanAppealStatus.PENDING]: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    [BanAppealStatus.UNDER_REVIEW]: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    [BanAppealStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    [BanAppealStatus.DENIED]: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    [BanAppealStatus.EXPIRED]: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

const STATUS_LABELS: Record<BanAppealStatus, string> = {
    [BanAppealStatus.PENDING]: "Pending",
    [BanAppealStatus.UNDER_REVIEW]: "Under review",
    [BanAppealStatus.APPROVED]: "Approved",
    [BanAppealStatus.DENIED]: "Denied",
    [BanAppealStatus.EXPIRED]: "Expired",
};

export function AppealStatusBadge({status}: { status: BanAppealStatus }) {
    return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
}
