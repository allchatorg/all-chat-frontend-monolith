import {Diamond} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {isStaff, Role} from "@/models/Role";

interface StaffMembershipBadgeProps {
    vipActive?: boolean;
    role?: Role;
    loading?: boolean;
}

/** Staff-only membership status, independent of the user's public badge preference. */
export function StaffMembershipBadge({vipActive, role, loading = false}: StaffMembershipBadgeProps) {
    if (loading && typeof vipActive !== "boolean") {
        return <Badge variant="outline" role="status">Loading membership…</Badge>;
    }

    if (typeof vipActive !== "boolean") {
        return <Badge variant="outline" role="status">Membership unavailable</Badge>;
    }

    return (
        <Badge
            variant={vipActive ? "outline" : "secondary"}
            className={vipActive ? "gap-1 border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-500 dark:bg-violet-950 dark:text-violet-100" : undefined}
            aria-busy={loading}
        >
            {vipActive && <Diamond aria-hidden="true" className="h-3 w-3"/>}
            {vipActive ? role && isStaff(role) ? "allchat VIP · Staff access" : "allchat VIP · Paid member" : "Basic"}
        </Badge>
    );
}
