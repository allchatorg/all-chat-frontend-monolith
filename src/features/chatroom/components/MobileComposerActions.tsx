import React from "react";
import {ChevronUp} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

// Mobile composer submenu, replacing the old Plus popover. The chevron sits in
// the input row and expands an inline row of actions above the composer — an
// inline panel (not a popover) so it survives taps and stays visible while
// typing, which the format toggles need.

export function MobileActionsToggle({
                                        expanded,
                                        onToggle,
                                        disabled,
                                    }: {
    expanded: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="glass-control shrink-0 h-10 w-10"
            disabled={disabled}
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide message options" : "Show message options"}
            title={expanded ? "Hide message options" : "Show message options"}
        >
            <ChevronUp className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}/>
        </Button>
    );
}

export function MobileActionsPanel({children}: { children: React.ReactNode }) {
    return (
        <div className="glass-surface mb-2 flex items-center gap-2 overflow-x-auto rounded-md px-2 py-1.5">
            {children}
        </div>
    );
}
