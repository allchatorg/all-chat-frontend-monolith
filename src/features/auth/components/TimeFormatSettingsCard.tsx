import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Switch} from "@/components/ui/switch";
import {TimeFormat} from "@/models/TimeFormat";

interface TimeFormatSettingsCardProps {
    timeFormat: TimeFormat;
    onToggle: () => void;
    isUpdating?: boolean;
    error?: string;
}

const TimeFormatSettingsCard: React.FC<TimeFormatSettingsCardProps> = ({
                                                                           timeFormat,
                                                                           onToggle,
                                                                           isUpdating = false,
                                                                           error
                                                                       }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Time Format Preferences</CardTitle>
                <CardDescription>
                    Choose whether you want to see times in 12-hour or 24-hour format.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <span className="text-sm font-medium">Use 24-hour format</span>
                <Switch
                    checked={timeFormat === TimeFormat.H24}
                    onCheckedChange={onToggle}
                    disabled={isUpdating}
                />
            </CardContent>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </Card>
    );
};

export default TimeFormatSettingsCard;
