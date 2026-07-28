import React from 'react';
import {Badge} from "@/components/ui/badge";
import {IdVerificationStatus} from "@/models/IdVerificationStatus";

const STATUS_CONFIG: Record<IdVerificationStatus, { label: string; className: string }> = {
    NONE: {
        label: "ID Not Required",
        className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    },
    REQUIRED: {
        label: "ID Required",
        className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    },
    PENDING: {
        label: "ID Pending Review",
        className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    },
    VERIFIED: {
        label: "ID Verified",
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    },
    REJECTED: {
        label: "ID Rejected",
        className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    },
};

export const IdVerificationStatusBadge = ({status}: { status?: IdVerificationStatus }) => {
    const config = STATUS_CONFIG[status ?? 'NONE'];
    return <Badge className={config.className}>{config.label}</Badge>;
};
