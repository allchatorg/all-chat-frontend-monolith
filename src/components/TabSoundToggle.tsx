import {MouseEvent} from "react";
import {Volume2, VolumeX} from "lucide-react";
import {useChatRoomSoundSettings} from "@/lib/hooks/useChatRoomSoundSettings";
import {cn} from "@/lib/utils";

/**
 * Per-room speaker toggle pinned to a tab's top-right corner, mirroring the close badge on the
 * top-left, so it doesn't widen the tab's stats row. Inert unless the global sound mode is 'ALL'.
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
                // Same box, ring and shadow as the close badge so both corners read as a pair.
                "absolute -top-1 -right-1 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-primary shadow-md transition-colors",
                // Bigger hit area on touch screens without growing the badge itself.
                "pointer-coarse:after:absolute pointer-coarse:after:-inset-1.5 pointer-coarse:after:rounded-full",
                isSoundOn
                    ? "bg-sky-500 text-white dark:bg-emerald-500 dark:text-emerald-950"
                    : "bg-white text-slate-600 dark:bg-slate-700 dark:text-slate-100",
                isInert
                    ? "cursor-not-allowed opacity-40"
                    : isSoundOn
                        ? "hover:bg-sky-600 dark:hover:bg-emerald-400"
                        : "hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-slate-600 dark:hover:text-white",
            )}
        >
            <Icon className="h-3 w-3"/>
        </button>
    );
}
