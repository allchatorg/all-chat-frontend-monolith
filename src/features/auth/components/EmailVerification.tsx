'use client'

import React, {useState} from 'react'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Label} from '@/components/ui/label'
import {ShieldCheck} from 'lucide-react'
import {ConfirmationMessage} from '@/components/ConfirmationMessage'

interface EmailVerificationProps {
    email: string | null | undefined,
    onVerify: (code: string) => void,
    onResend?: () => void,
    verified?: boolean
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
                                                                        email,
                                                                        onVerify,
                                                                        onResend,
                                                                        verified
                                                                    }) => {
    const [showCodeInput, setShowCodeInput] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [hasRequestedCode, setHasRequestedCode] = useState(false)

    const handleVerifyClick = () => {
        setShowCodeInput(true)
        setHasRequestedCode(true)
        onResend?.()
    }

    const handleCodeSubmit = () => {
        if (verificationCode.trim()) {
            onVerify(verificationCode)
        }
    }

    return (
        <Card className="shadow-md transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary"/>
                    Email Verification
                </CardTitle>
                <CardDescription>
                    Verify your email address to secure your account.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={email || ''} disabled className="mt-1"/>
                </div>

                {verified ? (
                    <ConfirmationMessage
                        title="Email Verified"
                        description="Your email is successfully verified."
                        badgeText="Verified"
                    />
                ) : !showCodeInput ? (
                    <div className="flex justify-end">
                        <Button onClick={handleVerifyClick}>
                            Verify Email
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div>
                            <Label htmlFor="code">Verification Code</Label>
                            <div className="mt-1 flex flex-col gap-2">
                                <Input
                                    id="code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="123456"
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleCodeSubmit}>Submit</Button>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleVerifyClick}
                            className="px-0 text-sm text-muted-foreground hover:text-primary"
                        >
                            Resend Code
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
