'use client'

import React, {useState} from 'react'
import {Separator} from '@ads/components/ui/separator'
import {useUser} from '@ads/hooks/use-user'
import {EmailVerification} from './components/email-verification'
import {ChangePassword} from './components/change-password'
import {PhoneSettings} from './components/phone-settings'
import {EmailSettings} from './components/email-settings'
import {UpdateEmail} from './components/update-email'
import {toast} from 'sonner'
import {SiteHeader} from '@ads/components/site-header'
import {
    useChangePasswordMutation,
    useGetCurrentUserQuery,
    useSendPhoneVerificationMutation,
    useSendVerificationEmailMutation,
    useUpdateMarketingPreferencesMutation,
    useVerifyEmailMutation,
    useVerifyPhoneMutation
} from '@ads/store/services/userApi'

export default function AccountSettingsPage() {
    const {user} = useUser()
    const [verificationError, setVerificationError] = useState<string | undefined>()
    const [phoneError, setPhoneError] = useState<string | undefined>()

    // Fetch current user data from API
    const {data: currentUser, isLoading: isLoadingUser} = useGetCurrentUserQuery()

    // Email verification mutations
    const [sendVerificationEmail, {isLoading: isSendingVerification}] = useSendVerificationEmailMutation()
    const [verifyEmail] = useVerifyEmailMutation()

    // Change password mutation
    const [changePassword, {isLoading: isChangingPassword}] = useChangePasswordMutation()

    // Marketing preferences mutation
    const [updateMarketingPreferences] = useUpdateMarketingPreferencesMutation()

    // Phone verification mutations
    const [sendPhoneVerification, {isLoading: isSendingPhoneVerification}] = useSendPhoneVerificationMutation()
    const [verifyPhone, {isLoading: isVerifyingPhone}] = useVerifyPhoneMutation()

    // Email verification handlers
    const handleVerifyEmail = async (token: string) => {
        try {
            setVerificationError(undefined)
            await verifyEmail({token}).unwrap()
            toast.success('Email verified successfully!')
        } catch (error) {
            console.error('Email verification error:', error)
            const err = error as { data?: { message?: string } }
            const errorMessage = err?.data?.message || 'Failed to verify email. Please check your code and try again.'
            setVerificationError(errorMessage)
            toast.error(errorMessage)
        }
    }

    const handleResendEmailVerification = async () => {
        try {
            setVerificationError(undefined)
            await sendVerificationEmail().unwrap()
            toast.success('Verification email sent!')
        } catch (error) {
            console.error('Send verification error:', error)
            const err = error as { data?: { message?: string } }
            const errorMessage = err?.data?.message || 'Failed to send verification email. Please try again.'
            setVerificationError(errorMessage)
            toast.error(errorMessage)
        }
    }

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        try {
            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword: newPassword
            }).unwrap()
            toast.success('Password changed successfully!')
        } catch (error) {
            console.error('Change password error:', error)
            const err = error as { data?: { message?: string } }
            const errorMessage = err?.data?.message || 'Failed to change password. Please try again.'
            toast.error(errorMessage)
        }
    }

    const handleSendPhoneVerification = async (phoneNumber: string) => {
        try {
            setPhoneError(undefined)
            await sendPhoneVerification({phoneNumber}).unwrap()
            toast.success('Verification code sent to phone!')
        } catch (error) {
            console.error('Send phone verification error:', error)
            const errorMessage = getApiErrorMessage(error, 'Failed to send phone verification code. Please try again.')
            setPhoneError(errorMessage)
            toast.error(errorMessage)
            throw error
        }
    }

    const handleVerifyPhone = async (code: string) => {
        try {
            setPhoneError(undefined)
            await verifyPhone({verificationCode: code}).unwrap()
            toast.success('Phone verified successfully!')
        } catch (error) {
            console.error('Verify phone error:', error)
            const errorMessage = getApiErrorMessage(error, 'Failed to verify phone. Please check your code and try again.')
            setPhoneError(errorMessage)
            toast.error(errorMessage)
            throw error
        }
    }

    const handleUpdateMarketing = async (marketing: boolean) => {
        try {
            await updateMarketingPreferences({subscribedToMarketingEmails: marketing}).unwrap()
            toast.success('Marketing preferences updated!')
        } catch (error) {
            console.error('Update marketing preferences error:', error)
            const err = error as { data?: { message?: string } }
            const errorMessage = err?.data?.message || 'Failed to update marketing preferences. Please try again.'
            toast.error(errorMessage)
        }
    }

    if (isLoadingUser) {
        return (
            <div className="w-full">
                <SiteHeader
                    title="Account Settings"
                    description="Manage your account security and preferences."
                />
                <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 md:gap-6 md:py-6">
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <SiteHeader
                title="Account Settings"
                description="Manage your account security and preferences."
            />
            {/* Added max-w-4xl and mx-auto to center content with max width */}
            <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 md:gap-6 md:py-6 space-y-6">
                <Separator/>

                {/* Email Verification */}
                <EmailVerification
                    verified={currentUser?.emailVerified ?? false}
                    email={currentUser?.email ?? user?.email}
                    onVerify={handleVerifyEmail}
                    onResend={handleResendEmailVerification}
                    error={verificationError}
                    sending={isSendingVerification}
                />

                <Separator/>

                {/* Change Password */}
                <ChangePassword onChangePassword={handleChangePassword} loading={isChangingPassword}/>

                <Separator/>

                {/* Update Email */}
                <UpdateEmail currentEmail={currentUser?.email ?? user?.email}/>

                <Separator/>

                {/* Email Settings */}
                <EmailSettings
                    subscribedToMarketingEmails={currentUser?.subscribedToMarketingEmails ?? false}
                    onUpdateMarketing={handleUpdateMarketing}
                />

                <Separator/>

                <PhoneSettings
                    user={{
                        phoneNumber: currentUser?.phoneNumber ?? null,
                        phoneVerified: Boolean(currentUser?.phoneNumberVerificationDate),
                    }}
                    onAddPhone={handleSendPhoneVerification}
                    onVerifyCode={handleVerifyPhone}
                    onUpdatePhone={handleSendPhoneVerification}
                    error={phoneError ? new Error(phoneError) : null}
                    loading={isSendingPhoneVerification || isVerifyingPhone}
                />
            </div>
        </div>
    )
}

function getApiErrorMessage(error: unknown, fallback: string) {
    if (error && typeof error === 'object' && 'data' in error) {
        const data = (error as { data?: { message?: unknown } }).data
        if (typeof data?.message === 'string') {
            return data.message
        }
    }

    if (error instanceof Error) {
        return error.message
    }

    return fallback
}
