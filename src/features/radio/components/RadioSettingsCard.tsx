"use client";

import React from "react";
import {IconRadio} from "@tabler/icons-react";
import {useRadio} from "@/components/providers/RadioProvider";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {RADIO_STATION_OPTIONS, RadioPlaybackButton, RadioVolumeControl, useRadioDisplay} from "./RadioControls";
import type {RadioStationMode} from "@/features/radio/types";
import {cn} from "@/lib/utils";

export function RadioSettingsCard() {
    const {enabled, stationMode, setStationMode, station} = useRadio();
    const {statusLabel, detail} = useRadioDisplay();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><IconRadio className="h-5 w-5" aria-hidden="true"/>Radio</CardTitle>
                <CardDescription>Two stations for your day and night. Choose a station or let your theme decide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <RadioGroup
                    aria-label="Radio station preference"
                    value={stationMode}
                    onValueChange={(value) => setStationMode(value as RadioStationMode)}
                    className="gap-2"
                >
                    {RADIO_STATION_OPTIONS.map(({value, label, description, Icon}) => (
                        <Label
                            key={value}
                            className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors", stationMode === value ? "border-primary bg-primary/5" : "hover:bg-muted/50")}
                        >
                            <RadioGroupItem value={value}/>
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true"/>
                            <span className="space-y-1">
                                <span className="block text-sm font-medium">{label}</span>
                                <span className="block text-xs font-normal leading-relaxed text-muted-foreground">{description}</span>
                            </span>
                        </Label>
                    ))}
                </RadioGroup>
                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium">{station.name}</p>
                            <p className="text-xs text-muted-foreground" role="status">{statusLabel}</p>
                        </div>
                        <RadioPlaybackButton showLabel/>
                    </div>
                    <p className="break-words text-sm text-muted-foreground">{detail}</p>
                    {!enabled && <p className="text-xs text-muted-foreground">Open a public or private chat to listen.</p>}
                    <RadioVolumeControl/>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Radio starts when you press Play. These preferences are saved on this device. Radio volume does not change message notification sounds.
                </p>
            </CardContent>
        </Card>
    );
}
