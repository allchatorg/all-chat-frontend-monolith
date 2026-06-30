'use client'

import React, {useState} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@ads/components/ui/card'
import {Label} from '@ads/components/ui/label'
import {Checkbox} from '@ads/components/ui/checkbox'
import {Mail} from 'lucide-react'

interface EmailSettingsProps {
    subscribedToMarketingEmails?: boolean
    onUpdateMarketing?: (marketing: boolean) => void
}

export const EmailSettings: React.FC<EmailSettingsProps> = ({
                                                                subscribedToMarketingEmails = false,
                                                                onUpdateMarketing,
                                                            }) => {
    const [receiveMarketing, setReceiveMarketing] = useState(subscribedToMarketingEmails)

    const handleMarketingChange = (checked: boolean) => {
        setReceiveMarketing(checked)
        onUpdateMarketing?.(checked)
    }

    return (
        <Card className="shadow-md transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary"/>
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
                    />
                    <Label htmlFor="marketing-emails" className="text-sm font-normal cursor-pointer">
                        Receive marketing emails
                    </Label>
                </div>
            </CardContent>
        </Card>
    )
}
