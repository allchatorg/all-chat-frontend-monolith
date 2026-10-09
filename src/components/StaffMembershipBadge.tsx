import {Diamond} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {isStaff, Role} from "@/models/Role";

interface StaffMembershipBadgeProps {
    proActive?: boolean;
    role?: Role;
    loading?: boolean;
}

/** Staff-only membership status, independent of the user's public badge preference. */
export function StaffMembershipBadge({proActive, role, loading = false}: StaffMembershipBadgeProps) {
    if (loading && typeof proActive !== "boolean") {
        return <Badge variant="outline" role="status">Loading membership…</Badge>;
    }

    if (typeof proActive !== "boolean") {
        return <Badge variant="outline" role="status">Membership unavailable</Badge>;
    }

    return (
        <Badge
            variant={proActive ? "outline" : "secondary"}
            className={proActive ? "gap-1 border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-500 dark:bg-violet-950 dark:text-violet-100" : undefined}
            aria-busy={loading}
        >
            {proActive && <Diamond aria-hidden="true" className="h-3 w-3"/>}
            {proActive ? role && isStaff(role) ? "allchat VIP · Staff access" : "allchat VIP · Paid member" : "Basic"}
        </Badge>
    );
}
