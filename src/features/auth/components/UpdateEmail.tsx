'use client'

import React, {useMemo, useState} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Button} from '@/components/ui/button'
import {Mail} from 'lucide-react'
import {toast} from 'sonner'
import {useThunk} from '@/lib/hooks/useThunk'
import {requestEmailUpdateThunk, verifyEmailUpdateThunk} from '@/redux/user/usersThunk'

interface UpdateEmailProps {
    currentEmail?: string | null
}

export const UpdateEmail: React.FC<UpdateEmailProps> = ({currentEmail}) => {
    const [newEmail, setNewEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isVerificationStep, setIsVerificationStep] = useState(false)

    const [runRequestEmailUpdate, isRequesting] = useThunk(requestEmailUpdateThunk)
    const [runVerifyEmailUpdate, isVerifying] = useThunk(verifyEmailUpdateThunk)

    const displayedCurrentEmail = useMemo(() => currentEmail || 'No email set', [currentEmail])

    const handleRequestUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        const normalizedEmail = newEmail.trim()
        try {
            await runRequestEmailUpdate({
                newEmail: normalizedEmail,
                currentPassword: currentPassword.trim()
            })
            setNewEmail(normalizedEmail)
            setIsVerificationStep(true)
            toast.success('Verification code sent to your new email!')
        } catch (error: any) {
            toast.error(error?.message || 'Failed to request email update.')
        }
    }

    const handleVerifyUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await runVerifyEmailUpdate({
                verificationCode: verificationCode.trim()
            })
            toast.success('Email updated successfully!')
            setNewEmail('')
            setCurrentPassword('')
            setVerificationCode('')
            setIsVerificationStep(false)
        } catch (error: any) {
            toast.error(error?.message || 'Failed to verify email update.')
        }
    }

    return (
        <Card className="shadow-md transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary"/>
                    Change Email
                </CardTitle>
                <CardDescription>
                    Update your email address. You will need to verify the new email.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="mb-4 text-sm text-muted-foreground">
                    Current Email: <span className="font-medium text-foreground">{displayedCurrentEmail}</span>
                </div>

                {!isVerificationStep ? (
                    <form onSubmit={handleRequestUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-email">New Email Address</Label>
                            <Input
                                id="new-email"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current-password-email-update">Current Password</Label>
                            <Input
                                id="current-password-email-update"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isRequesting}>
                                {isRequesting ? 'Sending Code...' : 'Request Change'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyUpdate} className="space-y-4">
                        <div className="mb-4 rounded-md bg-muted p-3 text-sm">
                            Please enter the verification code sent to <strong>{newEmail}</strong>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="verification-code-email-update">Verification Code</Label>
                            <Input
                                id="verification-code-email-update"
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="submit" disabled={isVerifying || verificationCode.length !== 6}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify & Update'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setVerificationCode('')
                                    setIsVerificationStep(false)
                                }}
                                disabled={isVerifying}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
