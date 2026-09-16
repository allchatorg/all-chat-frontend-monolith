"use client";

import React, {useId} from "react";
import {Loader2, MoonStar, Pause, Play, RotateCcw, Sun, SunMoon, Volume1, Volume2, VolumeX} from "lucide-react";
import {useRadio} from "@/components/providers/RadioProvider";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Slider} from "@/components/ui/slider";
import type {RadioStationMode} from "@/features/radio/types";
import {cn} from "@/lib/utils";

export const RADIO_STATION_OPTIONS: {
    value: RadioStationMode;
    label: string;
    description: string;
    Icon: typeof Sun;
}[] = [
    {value: "theme", label: "Follow theme", description: "Daybreak in light mode, Nightwave in dark mode.", Icon: SunMoon},
    {value: "daybreak", label: "Daybreak", description: "Keep Daybreak playing in either theme.", Icon: Sun},
    {value: "nightwave", label: "Nightwave", description: "Keep Nightwave playing in either theme.", Icon: MoonStar},
];

export function useRadioPlaybackControl() {
    const {enabled, isListening, status, canPlay, play, pause, retry, station} = useRadio();
    const needsResume = status === "interrupted";
    const canPause = isListening && !needsResume;
    const needsRetry = !canPause && (status === "error" || status === "offline" || status === "unavailable");
    const isLoading = status === "loading" || status === "buffering";
    const label = canPause ? "Pause" : needsResume ? "Resume" : needsRetry ? "Retry" : "Play";
    const Icon = canPause ? isLoading ? Loader2 : Pause : needsRetry ? RotateCcw : Play;

    return {
        label, Icon, station,
        spinning: canPause && isLoading,
        active: canPause,
        disabled: !enabled || (!canPause && !needsRetry && !canPlay),
        onClick: canPause ? pause : needsRetry ? retry : play,
    };
}

export function RadioPlaybackButton({showLabel = false, className}: {showLabel?: boolean; className?: string}) {
    const {label, Icon, station, spinning, active, disabled, onClick} = useRadioPlaybackControl();

    return (
        <Button
            type="button"
            size="sm"
            variant={active ? "secondary" : "outline"}
            className={cn("glass-control h-8 shrink-0 rounded-lg", showLabel ? "px-3" : "w-8 p-0", className)}
            disabled={disabled}
            onClick={onClick}
            aria-label={`${label} ${station.name} radio`}
            title={`${label} radio`}
        >
            <Icon className={cn("h-3.5 w-3.5", spinning && "animate-spin")} aria-hidden="true"/>
            {showLabel && label}
        </Button>
    );
}

export function useRadioDisplay() {
    const {station, status, error, metadataError, nowPlaying, muted, volume} = useRadio();
    const song = nowPlaying?.is_online ? nowPlaying.now_playing?.song : null;
    const title = song?.title?.trim();
    const artist = song?.artist?.trim();
    const track = title ? [artist, title].filter(Boolean).join(" — ") : song?.text?.trim();
    const labels = {
        idle: "Ready to listen",
        loading: "Connecting…",
        buffering: "Buffering…",
        playing: muted || volume === 0 ? "Playing · muted" : "Live",
        paused: "Paused",
        offline: "Station offline",
        unavailable: "Station unavailable",
        error: "Connection interrupted",
        interrupted: "Tap play to resume",
        suspended: "Paused for media",
    };
    const statusLabel = labels[status];
    const message = error || (status === "offline"
        ? "This station is offline. Try again in a moment."
        : status === "unavailable"
            ? "This station is not available yet. Choose another station or press Retry to check again."
            : null);
    const detail = message || (metadataError ? "Track information is temporarily unavailable." : track || station.description);

    return {statusLabel, track, detail, message};
}

export function RadioVolumeControl({className, touchFriendly = false}: {className?: string; touchFriendly?: boolean}) {
    const {volume, setVolume, muted, setMuted} = useRadio();
    const id = useId();
    const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

    return (
        <div className={cn("space-y-1", className)}>
            <div className="flex items-center justify-between gap-3 text-xs">
                <Label id={id} className="text-xs font-medium">Radio volume</Label>
                <span className="tabular-nums text-muted-foreground">{muted ? `Muted · ${volume}%` : `${volume}%`}</span>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn("glass-control h-8 w-8 shrink-0 rounded-lg", touchFriendly && "h-11 w-11")}
                    onClick={() => setMuted(!muted)}
                    aria-label={muted ? "Unmute radio" : "Mute radio"}
                    aria-pressed={muted}
                    title={muted ? "Unmute radio" : "Mute radio"}
                >
                    <VolumeIcon className="h-4 w-4" aria-hidden="true"/>
                </Button>
                <Slider
                    className={touchFriendly ? "h-11" : undefined}
                    min={0}
                    max={100}
                    step={1}
                    value={[volume]}
                    aria-labelledby={id}
                    aria-valuetext={`${volume}%`}
                    onValueChange={([value]) => {
                        setVolume(value);
                        if (value > 0 && muted) setMuted(false);
                    }}
                />
            </div>
        </div>
    );
}
