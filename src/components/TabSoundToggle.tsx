import {MouseEvent} from "react";
import {Volume2, VolumeX} from "lucide-react";
import {useChatRoomSoundSettings} from "@/lib/hooks/useChatRoomSoundSettings";
import {cn} from "@/lib/utils";

/**
 * Per-room speaker toggle tucked inside a tab's top-right corner so it doesn't widen the tab's
 * stats row; the tab's title row carries right padding so a long name never runs under it.
 * Inert unless the global sound mode is 'ALL'.
 */
export function TabSoundToggle({isSoundOn, onToggle}: {
    isSoundOn: boolean;
    onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
    const {soundMode} = useChatRoomSoundSettings();
    const isInert = soundMode !== 'ALL';
    const label = soundMode === 'MUTED'
        ? "Sounds are muted globally"
        : soundMode === 'FOCUSED'
            ? "Only the focused room plays sound"
            : isSoundOn ? "Mute notifications" : "Unmute notifications";
    const Icon = isSoundOn ? Volume2 : VolumeX;

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                if (isInert) return;
                onToggle(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title={label}
            aria-label={label}
            aria-pressed={isSoundOn}
            aria-disabled={isInert}
            className={cn(
                "absolute top-0.5 right-0.5 z-20 rounded-full shrink-0 p-1 transition-colors text-muted-foreground",
                isInert
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-sky-100/35 hover:text-sky-700 dark:hover:bg-white/15 dark:hover:text-white",
            )}
        >
            <Icon className="h-3.5 w-3.5"/>
        </button>
    );
}
