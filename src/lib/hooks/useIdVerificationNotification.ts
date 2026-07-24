import {useRouter} from "next/navigation";
import {ROUTES} from "@/routes";
import {toast} from "sonner";
import {User} from "@/models/User";
import {isStaff} from "@/models/Role";
import {IdVerificationResultNotification} from "@/models/IdVerificationResultNotification";

export function useIdVerificationNotification() {
    const router = useRouter();

    const handleIdVerificationResult = (notification: IdVerificationResultNotification, currentUser: User | null) => {
        if (!currentUser) return;

        // Only staff get notified about verification outcomes.
        if (!isStaff(currentUser.role)) return;

        const message = `ID verification ${notification.passed ? "passed" : "failed"} for user ${notification.userId}`;
        const action = notification.reportCaseId
            ? {
                label: 'View case',
                onClick: () => {
                    router.push(`${ROUTES.REPORTS}/${notification.reportCaseId}`);
                }
            }
            : {
                label: 'Dismiss',
                onClick: () => {
                }
            };

        if (notification.passed) {
            toast.success(message, {duration: Infinity, action});
        } else {
            toast.error(message, {duration: Infinity, action});
        }
    };

    return {
        handleIdVerificationResult
    };
}
