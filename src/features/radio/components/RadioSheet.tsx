"use client";

import React from 'react';
import {MoonStar, Sun} from 'lucide-react';
import {useRadio} from '@/components/providers/RadioProvider';
import {BottomSheet} from '@/components/ui/bottom-sheet';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import type {RadioStationMode} from '@/features/radio/types';
import {cn} from '@/lib/utils';
import {RADIO_STATION_OPTIONS, RadioPlaybackButton, RadioVolumeControl, useRadioDisplay} from './RadioControls';

export function RadioSheet({open, onOpenChange, onCloseAutoFocus}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCloseAutoFocus: (event: Event) => void;
}) {
    const {station, stationMode, setStationMode} = useRadio();
    const {statusLabel, detail} = useRadioDisplay();
    const StationIcon = station.key === 'daybreak' ? Sun : MoonStar;

    return (
        <BottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Radio"
            description="Choose your station and set the volume."
            closeLabel="Close radio settings"
            onCloseAutoFocus={onCloseAutoFocus}
            bodyClassName="space-y-5"
        >
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <StationIcon className="h-5 w-5 shrink-0" aria-hidden="true"/>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">{station.name}</p>
                            <p className="text-xs text-muted-foreground" role="status">{statusLabel}</p>
                        </div>
                    </div>
                    <RadioPlaybackButton showLabel className="h-11 px-4"/>
                </div>
                <p className="break-words text-sm leading-relaxed text-muted-foreground">{detail}</p>
            </div>
            <RadioGroup
                aria-label="Radio station"
                value={stationMode}
                onValueChange={(value) => setStationMode(value as RadioStationMode)}
                className="gap-2"
            >
                {RADIO_STATION_OPTIONS.map(({value, label, description, Icon}) => (
                    <Label key={value} className={cn('flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3', stationMode === value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50')}>
                        <RadioGroupItem value={value}/>
                        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true"/>
                        <span className="space-y-1">
                            <span className="block text-sm font-medium">{label}</span>
                            <span className="block text-xs font-normal leading-relaxed text-muted-foreground">{description}</span>
                        </span>
                    </Label>
                ))}
            </RadioGroup>
            <RadioVolumeControl touchFriendly/>
            <p className="text-xs leading-relaxed text-muted-foreground">Changes save automatically. Closing this panel keeps the radio playing.</p>
        </BottomSheet>
    );
}
