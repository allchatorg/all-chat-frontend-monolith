"use client";

import React from "react";
import {Focus, Volume2, VolumeX} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useChatRoomSoundSettings} from "@/lib/hooks/useChatRoomSoundSettings";
import {NotificationSoundMode} from "@/models/NotificationSoundMode";

const MODE_OPTIONS: {
    mode: NotificationSoundMode;
    label: string;
    description: string;
    Icon: typeof Volume2;
}[] = [
    {mode: 'ALL', label: "All rooms", description: "Per-room speaker toggles decide", Icon: Volume2},
    {mode: 'FOCUSED', label: "Focused room only", description: "Only the room you're viewing plays sound", Icon: Focus},
    {mode: 'MUTED', label: "Muted", description: "No message sounds", Icon: VolumeX},
];

interface NotificationSoundModeMenuProps {
    buttonClassName: string;
    iconClassName: string;
    variant: "ghost" | "outline" | "secondary";
}

const NotificationSoundModeMenu: React.FC<NotificationSoundModeMenuProps> = ({
                                                                                 buttonClassName,
                                                                                 iconClassName,
                                                                                 variant,
                                                                             }) => {
    const {soundMode, setSoundMode} = useChatRoomSoundSettings();

    const current = MODE_OPTIONS.find(o => o.mode === soundMode) ?? MODE_OPTIONS[0];
    const triggerLabel = `Notification sounds: ${current.label}`;
    const triggerTint = soundMode === 'FOCUSED' ? "text-primary" : soundMode === 'MUTED' ? "text-red-500" : "";

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={soundMode !== 'ALL' ? "secondary" : variant}
                    size="sm"
                    className={`${buttonClassName} ${triggerTint}`}
                    aria-label={triggerLabel}
                    title={triggerLabel}
                >
                    <current.Icon className={iconClassName}/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-popover w-64">
                <DropdownMenuRadioGroup
                    value={soundMode}
                    onValueChange={(value) => setSoundMode(value as NotificationSoundMode)}
                >
                    {MODE_OPTIONS.map(({mode, label, description, Icon}) => (
                        <DropdownMenuRadioItem
                            key={mode}
                            value={mode}
                            className="cursor-pointer py-2.5 focus:bg-white/30 dark:focus:bg-white/10"
                        >
                            <span className="flex items-center gap-3">
                                <Icon className="h-4 w-4 shrink-0"/>
                                <span className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium">{label}</span>
                                    <span className="text-xs text-muted-foreground">{description}</span>
                                </span>
                            </span>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationSoundModeMenu;
