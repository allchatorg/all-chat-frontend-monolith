import {Diamond} from "lucide-react";
import {cn} from "@/lib/utils";

/** A room mode, independent of its creator's personal badge preferences. */
export function RoomProBadge({proOnly, active = true, className}: {proOnly?: boolean; active?: boolean; className?: string}) {
    if (!proOnly) return null;
    return <span aria-label="PRO-only room" title="PRO-only room" role="img"
        className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide transition-colors motion-reduce:transition-none",
            active ? "border-blue-400/40 bg-blue-500/10 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/15 dark:text-blue-300"
                : "border-slate-400/30 bg-slate-500/5 text-slate-600 dark:border-slate-400/25 dark:bg-slate-400/10 dark:text-slate-400",
            className)}>
        <Diamond aria-hidden="true" className="h-2.5 w-2.5"/><span aria-hidden="true">PRO</span>
    </span>;
}
