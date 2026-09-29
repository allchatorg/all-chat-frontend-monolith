import React from "react";
import {ChevronUp} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

// Mobile composer submenu, replacing the old Plus popover. The chevron sits in
// the input row and expands an inline row of actions below the editor — an
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
            variant="ghost"
            size="icon"
            className="composer-action shrink-0 h-10 w-10"
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
        <div role="group" aria-label="Message options" className="flex min-w-0 items-center gap-1 overflow-x-auto p-1">
            {children}
        </div>
    );
}
