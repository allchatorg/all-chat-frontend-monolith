import {Diamond} from "lucide-react";
import {Badge} from "@/components/ui/badge";

interface StaffMembershipBadgeProps {
    proActive?: boolean;
    loading?: boolean;
}

/** Staff-only membership status, independent of the user's public badge preference. */
export function StaffMembershipBadge({proActive, loading = false}: StaffMembershipBadgeProps) {
    if (loading && typeof proActive !== "boolean") {
        return <Badge variant="outline" role="status">Loading membership…</Badge>;
    }

    if (typeof proActive !== "boolean") {
        return <Badge variant="outline" role="status">Membership unavailable</Badge>;
    }

    return (
        <Badge
            variant={proActive ? "default" : "secondary"}
            className={proActive ? "gap-1 border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-200" : undefined}
            aria-busy={loading}
        >
            {proActive && <Diamond aria-hidden="true" className="h-3 w-3"/>}
            {proActive ? "allchat Pro · Paid member" : "Basic"}
        </Badge>
    );
}
