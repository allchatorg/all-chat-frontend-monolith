"use client";

import React, {useId, useRef} from 'react';
import {ChevronRight, MoreVertical, Radio} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import {
    DropdownMenuCheckboxItem, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem,
    DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useRadio} from '@/components/providers/RadioProvider';
import {useIsMobile} from '@/lib/hooks/useIsMobile';
import {RadioStationMode} from '@/features/radio/types';
import {cn} from '@/lib/utils';
import {RADIO_STATION_OPTIONS, useRadioDisplay, useRadioPlaybackControl} from './RadioControls';
import {RadioMenuContent, RadioMenuRoot, useRadioMenu} from './RadioMenuRoot';

function RadioMenuControls() {
    const {station, stationMode, setStationMode, volume, setVolume, muted, setMuted, canSetVolume} = useRadio();
    const {statusLabel, detail} = useRadioDisplay();
    const playback = useRadioPlaybackControl();
    const volumeLabelId = useId();
    const volumeRef = useRef<HTMLDivElement>(null);
    const effectivelyMuted = muted || volume === 0;

    return (
        <>
            <DropdownMenuLabel className="space-y-1 px-2 py-2">
                <span className="block">{station.name}</span>
                <span className="block text-xs font-normal text-muted-foreground" role="status">{statusLabel}</span>
                <span className="block break-words text-xs font-normal leading-relaxed text-muted-foreground">{detail}</span>
            </DropdownMenuLabel>
            <DropdownMenuItem
                disabled={playback.disabled}
                aria-label={`${playback.label} ${station.name} radio`}
                className="cursor-pointer py-2"
                onSelect={(event) => {
                    event.preventDefault();
                    playback.onClick();
                }}
            >
                <playback.Icon className={cn('h-4 w-4', playback.spinning && 'animate-spin')} aria-hidden="true"/>
                {playback.label} radio
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuRadioGroup
                aria-label="Radio station"
                value={stationMode}
                onValueChange={(value) => setStationMode(value as RadioStationMode)}
            >
                {RADIO_STATION_OPTIONS.map(({value, label, Icon}) => (
                    <DropdownMenuRadioItem
                        key={value}
                        value={value}
                        className="cursor-pointer gap-2 py-2"
                        onSelect={(event) => event.preventDefault()}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true"/>
                        {label}
                    </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator/>
            <DropdownMenuCheckboxItem
                checked={effectivelyMuted}
                onCheckedChange={setMuted}
                onSelect={(event) => event.preventDefault()}
                className="cursor-pointer py-2"
            >
                Mute radio
            </DropdownMenuCheckboxItem>
            {canSetVolume === false ? (
                <p className="px-2 py-2 text-xs leading-relaxed text-muted-foreground">Use your device’s volume controls to adjust the radio.</p>
            ) : <DropdownMenuItem
                className="block px-2 py-2 focus:bg-transparent"
                disabled={canSetVolume !== true}
                textValue="Radio volume"
                onSelect={(event) => event.preventDefault()}
                onFocus={(event) => {
                    // Let menu arrow navigation reach the real slider thumb.
                    if (event.target === event.currentTarget) {
                        volumeRef.current?.querySelector<HTMLElement>('[role="slider"]')?.focus();
                    }
                }}
            >
                <div className="flex items-center justify-between gap-3 text-xs">
                    <span id={volumeLabelId}>Radio volume</span>
                    <span className="tabular-nums text-muted-foreground">{effectivelyMuted ? `Muted · ${volume}%` : `${volume}%`}</span>
                </div>
                <Slider
                    ref={volumeRef}
                    disabled={canSetVolume !== true}
                    min={0}
                    max={100}
                    step={1}
                    value={[volume]}
                    aria-labelledby={volumeLabelId}
                    aria-valuetext={`${volume}%`}
                    onKeyDown={(event) => {
                        // Left/Right adjust volume instead of closing the submenu.
                        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
                            event.stopPropagation();
                        }
                    }}
                    onValueChange={([value]) => {
                        setVolume(value);
                        if (value > 0 && muted) setMuted(false);
                    }}
                />
            </DropdownMenuItem>}
        </>
    );
}

export function RadioMenuSub() {
    const {enabled, station} = useRadio();
    const isMobile = useIsMobile();
    const {requestSheet} = useRadioMenu();
    if (!enabled) return null;

    if (isMobile) {
        return (
            <DropdownMenuItem
                className="cursor-pointer gap-2 py-2.5"
                aria-haspopup="dialog"
                onSelect={(event) => requestSheet(event.currentTarget as HTMLElement)}
            >
                <Radio className="h-4 w-4" aria-hidden="true"/>
                Radio
                <span className="ml-auto text-xs text-muted-foreground">{station.name}</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true"/>
            </DropdownMenuItem>
        );
    }

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2 py-2.5">
                <Radio className="h-4 w-4" aria-hidden="true"/>
                Radio
                <span className="ml-auto text-xs text-muted-foreground">{station.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent
                    aria-label="Radio controls"
                    collisionPadding={12}
                    className="glass-popover max-h-(--radix-dropdown-menu-content-available-height) w-72 max-w-[calc(100vw-24px)] overflow-y-auto"
                >
                    <RadioMenuControls/>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}

export function RadioOptionsMenu({buttonClassName, iconClassName, className}: {
    buttonClassName?: string;
    iconClassName?: string;
    className?: string;
}) {
    const {enabled} = useRadio();
    if (!enabled) return null;

    return (
        <RadioMenuRoot>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('glass-control h-9 w-9 shrink-0 p-0', className, buttonClassName)}
                    aria-label="Chat options"
                    title="Chat options"
                >
                    <MoreVertical className={cn('h-5 w-5', iconClassName)}/>
                </Button>
            </DropdownMenuTrigger>
            <RadioMenuContent align="end" className="glass-popover w-56">
                <RadioMenuSub/>
            </RadioMenuContent>
        </RadioMenuRoot>
    );
}
