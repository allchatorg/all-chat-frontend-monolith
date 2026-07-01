'use client'

import React, {useState} from 'react'
import {Input} from '@ads/components/ui/input'
import {Button} from '@ads/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@ads/components/ui/card'
import {Label} from '@ads/components/ui/label'
import {CheckCircle, Mail} from 'lucide-react'
import {Badge} from '@ads/components/ui/badge'

interface EmailVerificationProps {
    verified?: boolean
    email?: string
    onVerify?: (token: string) => void
    onResend?: () => void
    error?: string
    sending?: boolean
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
                                                                        verified,
                                                                        email,
                                                                        onVerify,
                                                                        onResend,
                                                                        sending = false,
                                                                    }) => {
    const [verificationToken, setVerificationToken] = useState('')
    const [showCodeInput, setShowCodeInput] = useState(false)

    const handleSendCode = () => {
        onResend?.()
        setShowCodeInput(true)
    }

    const handleVerify = () => {
        if (!verificationToken.trim()) return
        onVerify?.(verificationToken.trim())
        setVerificationToken('')
    }

    if (verified) {
        return (
            <Card className="shadow-md transition-all duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary"/>
                        Email Verification
                    </CardTitle>
                    <CardDescription>Your email address verification status.</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/40">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400"/>
                        <div>
                            <p className="font-medium text-green-700 dark:text-green-300">Email Verified</p>
                            <p className="text-sm text-green-600 dark:text-green-400">{email}</p>
                        </div>
                        <Badge variant="default" className="ml-auto">
                            Verified
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-md transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary"/>
                    Email Verification
                </CardTitle>
                <CardDescription>Verify your email address to secure your account.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="mt-1 flex gap-2">
                        <Input
                            id="email"
                            value={email}
                            disabled
                            className="flex-1"
                        />
                        <Button onClick={handleSendCode} disabled={sending}>
                            {sending ? 'Sending...' : showCodeInput ? 'Resend Code' : 'Verify Email'}
                        </Button>
                    </div>
                </div>

                {showCodeInput && (
                    <div>
                        <Label htmlFor="verification-token">Verification Code</Label>
                        <div className="mt-1 flex gap-2">
                            <Input
                                id="verification-token"
                                value={verificationToken}
                                onChange={(e) => setVerificationToken(e.target.value)}
                                placeholder="Enter verification code"
                                className="flex-1"
                            />
                            <Button onClick={handleVerify} disabled={!verificationToken.trim()}>
                                Verify
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
