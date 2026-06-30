'use client'

import React, {useState} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@ads/components/ui/card'
import {Input} from '@ads/components/ui/input'
import {Label} from '@ads/components/ui/label'
import {Button} from '@ads/components/ui/button'
import {Mail} from 'lucide-react'
import {toast} from 'sonner'
import {useRequestEmailUpdateMutation, useVerifyEmailUpdateMutation} from '@ads/store/services/userApi'

interface UpdateEmailProps {
    currentEmail?: string
}

export const UpdateEmail: React.FC<UpdateEmailProps> = ({currentEmail}) => {
    const [newEmail, setNewEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isVerificationStep, setIsVerificationStep] = useState(false)

    const [requestEmailUpdate, {isLoading: isRequesting}] = useRequestEmailUpdateMutation()
    const [verifyEmailUpdate, {isLoading: isVerifying}] = useVerifyEmailUpdateMutation()

    const handleRequestUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await requestEmailUpdate({
                newEmail,
                currentPassword
            }).unwrap()
            setIsVerificationStep(true)
            toast.success('Verification code sent to your new email!')
        } catch (error) {
            console.error('Request email update error:', error)
            const err = error as { data?: { message?: string } }
            const errorMessage = err?.data?.message || 'Failed to request email update.'
            toast.error(errorMessage)
        }
    }

    const handleVerifyUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await verifyEmailUpdate({
                verificationCode
            }).unwrap()
            toast.success('Email updated successfully!')
            // Reset form
            setNewEmail('')
            setCurrentPassword('')
            setVerificationCode('')
            setIsVerificationStep(false)
        } catch (error) {
            console.error('Verify email update error:', error)
            const err = error as { data?: { message?: string } }
            const errorMessage = err?.data?.message || 'Failed to verify email update.'
            toast.error(errorMessage)
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
                <div className="text-sm text-muted-foreground mb-4">
                    Current Email: <span className="font-medium text-foreground">{currentEmail}</span>
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
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isRequesting} className="w-full sm:w-auto">
                            {isRequesting ? 'Sending Code...' : 'Request Change'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyUpdate} className="space-y-4">
                        <div className="p-3 bg-muted rounded-md text-sm mb-4">
                            Please enter the verification code sent to <strong>{newEmail}</strong>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="verification-code">Verification Code</Label>
                            <Input
                                id="verification-code"
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isVerifying} className="flex-1 sm:flex-none">
                                {isVerifying ? 'Verifying...' : 'Verify & Update'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsVerificationStep(false)}
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
