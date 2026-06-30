import {useRouter} from "next/navigation";
import {ROUTES} from "@/routes";
import {ReportNotification} from "@/models/ReportNotification";
import {toast} from "sonner";
import {User} from "@/models/User";

import {useNotificationSounds} from "@/lib/hooks/useNotificationSounds";

export function useReportNotification() {
    const router = useRouter();
    const {playReportNotificationSound} = useNotificationSounds();

    const handleReportNotification = (notification: ReportNotification, currentUser: User | null) => {
        if (!currentUser) return;

        // If the current user is the reporter, do not show the notification
        if (notification.reporterId !== null && currentUser.id === notification.reporterId) {
            return;
        }

        playReportNotificationSound();
        toast.error(`New report case opened in room ${notification.reportCase.message.chatRoomName}!`, {
            duration: Infinity,
            style: {
                background: 'red',
                color: 'white',
                border: '1px solid darkred'
            },
            action: {
                label: 'View Details',
                onClick: () => {
                    router.push(`${ROUTES.REPORTS}/${notification.reportCaseId}`);
                }
            },
        });
    };

    return {
        handleReportNotification
    };
}
