"use client";

import {Diamond} from "lucide-react";
import {cn} from "@/lib/utils";

export function ProBadge({className, onClick}: {className?: string; onClick?: () => void}) {
    const badgeClassName = cn("inline-flex shrink-0 items-center gap-0.5 rounded-full border border-violet-400/40 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-violet-700 dark:text-violet-200", className);
    const content = <><Diamond aria-hidden="true" className="h-2.5 w-2.5"/><span aria-hidden="true">VIP</span></>;

    if (onClick) {
        return (
            <button
                type="button"
                aria-label="Learn about allchat VIP"
                aria-haspopup="dialog"
                title="Learn about allchat VIP"
                data-message-reaction-block="true"
                data-message-item-interaction="true"
                onClick={event => {event.stopPropagation(); onClick();}}
                onPointerDown={event => event.stopPropagation()}
                onTouchStart={event => event.stopPropagation()}
                onDoubleClick={event => event.stopPropagation()}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
                }}
                className={cn(badgeClassName, "cursor-pointer transition-colors hover:border-violet-500/70 hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background")}
            >
                {content}
            </button>
        );
    }

    return (
        <span
            role="img"
            aria-label="allchat VIP"
            title="allchat VIP"
            className={badgeClassName}
        >
            {content}
        </span>
    );
}
