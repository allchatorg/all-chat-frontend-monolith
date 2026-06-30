'use client'

import React, {useState} from 'react'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Label} from '@/components/ui/label'
import {AlertTriangle, CheckCircle, Edit, Phone, X} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {PhoneInput} from '@/components/ui/phone-input'
import {AddPhoneNumberRequest} from "@/models/AddPhoneNumberRequest";
import {Alert, AlertDescription} from "@/components/ui/alert";

interface User {
    phoneNumber?: string | null
    phoneVerified?: boolean
}

interface PhoneSettingsProps {
    user: User
    onAddPhone?: (phoneNumber: AddPhoneNumberRequest) => Promise<unknown> | void
    onVerifyCode?: (code: string) => Promise<unknown> | void
    onUpdatePhone?: (phoneNumber: string) => Promise<unknown> | void
    error?: { message?: string } | Error | null
    loading?: boolean
}

export const PhoneSettings: React.FC<PhoneSettingsProps> = ({
                                                                user,
                                                                onAddPhone,
                                                                onVerifyCode,
                                                                onUpdatePhone,
                                                                error,
                                                                loading,
                                                            }) => {
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showVerificationInput, setShowVerificationInput] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [verificationCode, setVerificationCode] = useState('')


    const hasPhoneNumber = !!user.phoneNumber
    const isVerified = user.phoneVerified

    const maskPhoneNumber = (phone: string) => {
        if (phone.length <= 4) return phone
        const lastFour = phone.slice(-4)
        return '*'.repeat(phone.length - 4) + lastFour
    }

    const handleAddPhone = async () => {
        if (phoneNumber.trim()) {
            try {
                await onAddPhone?.({phoneNumber: phoneNumber})
                setShowVerificationInput(true)
            } catch {
                // Keep phone input visible when sending verification fails.
            }
        }
    }

    const handleUpdatePhone = async () => {
        if (phoneNumber.trim() === user.phoneNumber?.trim()) {
            handleCancel();
            return;
        }
        if (phoneNumber.trim()) {
            try {
                await onUpdatePhone?.(phoneNumber)
                setIsEditing(false)
                setShowVerificationInput(true)
            } catch {
                // Keep phone input visible when sending verification fails.
            }
        }
    }

    const handleVerifyCode = async () => {
        if (verificationCode.trim()) {
            try {
                await onVerifyCode?.(verificationCode)
                setShowVerificationInput(false)
                setIsAdding(false)
                setIsEditing(false)
                setVerificationCode('')
            } catch {
                // Keep verification input visible when verification fails.
            }
        }
    }

    const handleCancel = () => {
        setIsAdding(false)
        setIsEditing(false)
        setShowVerificationInput(false)
        setPhoneNumber('')
        setVerificationCode('')
    }

    return (
        <Card className="shadow-md transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary"/>
                    Phone Number
                </CardTitle>
                <CardDescription>
                    Manage your phone number for account security and notifications.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription className="m-0 p-0">
                            {(error as any)?.message || "Something went wrong. Please try again."}
                        </AlertDescription>
                    </Alert>
                )}
                {!hasPhoneNumber && !isAdding ? (
                    <div className="flex justify-end">
                        <Button onClick={() => setIsAdding(true)} className="w-fit">
                            Add Phone Number
                        </Button>
                    </div>
                ) : hasPhoneNumber && !isEditing && !showVerificationInput ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="mt-1 flex gap-2">
                                <Input
                                    id="phone"
                                    value={maskPhoneNumber(user.phoneNumber || '')}
                                    disabled
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setIsEditing(true)
                                        setPhoneNumber(user.phoneNumber || '')
                                    }}
                                >
                                    <Edit className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>

                        {isVerified && (
                            <div className="flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600"/>
                                <div>
                                    <p className="font-medium text-green-700">Phone Verified</p>
                                    <p className="text-sm text-green-600">Your phone number is verified.</p>
                                </div>
                                <Badge variant="default" className="ml-auto">
                                    Verified
                                </Badge>
                            </div>
                        )}
                    </div>
                ) : !showVerificationInput ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone-input">Phone Number</Label>
                            <PhoneInput
                                defaultCountry="us"
                                value={phoneNumber}
                                onChange={(phone) => setPhoneNumber(phone)}
                                className="w-full mt-1"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="hidden md:block h-4 w-4 mr-1"/>
                                Cancel
                            </Button>
                            <Button
                                onClick={isEditing ? handleUpdatePhone : handleAddPhone}
                                disabled={!phoneNumber.trim()}
                            >
                                {isEditing ? 'Update' : 'Add'} Phone Number
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm text-blue-800">
                                A verification code has been sent to {phoneNumber}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="verification-code">Verification Code</Label>
                            <div className="mt-1 flex gap-2">
                                <Input
                                    id="verification-code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                />
                                <Button onClick={handleVerifyCode} disabled={!verificationCode.trim()}>
                                    Verify
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-sm">
                                Cancel
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-0 text-sm text-muted-foreground hover:text-primary"
                            >
                                Resend Code
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
