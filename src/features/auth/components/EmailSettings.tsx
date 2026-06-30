import React, {useEffect, useState} from "react";
import type {CheckedState} from "@radix-ui/react-checkbox";
import {Mail} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";

interface EmailSettingsProps {
    subscribedToMarketingEmails?: boolean;
    onUpdateMarketing?: (marketing: boolean) => Promise<void> | void;
    isLoading?: boolean;
}

export const EmailSettings: React.FC<EmailSettingsProps> = ({
                                                                subscribedToMarketingEmails = false,
                                                                onUpdateMarketing,
                                                                isLoading = false,
                                                            }) => {
    const [receiveMarketing, setReceiveMarketing] = useState(subscribedToMarketingEmails);

    useEffect(() => {
        setReceiveMarketing(subscribedToMarketingEmails);
    }, [subscribedToMarketingEmails]);

    const handleMarketingChange = async (checked: CheckedState) => {
        const marketingEnabled = checked === true;
        const previousValue = receiveMarketing;
        setReceiveMarketing(marketingEnabled);

        try {
            await onUpdateMarketing?.(marketingEnabled);
        } catch {
            setReceiveMarketing(previousValue);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5"/>
                    Email Preferences
                </CardTitle>
                <CardDescription>
                    Manage your email notification settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="marketing-emails"
                        checked={receiveMarketing}
                        onCheckedChange={handleMarketingChange}
                        disabled={isLoading}
                    />
                    <Label htmlFor="marketing-emails" className="cursor-pointer text-sm font-normal">
                        Receive marketing emails
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
};
