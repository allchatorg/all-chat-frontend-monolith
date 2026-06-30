'use client'

import React, {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Input} from '@ads/components/ui/input'
import {Button} from '@ads/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@ads/components/ui/card'
import {Label} from '@ads/components/ui/label'
import {Lock} from 'lucide-react'

interface ChangePasswordProps {
    onChangePassword: (currentPassword: string, newPassword: string) => void
    loading?: boolean
}

interface FormData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({onChangePassword, loading}) => {
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: {errors}
    } = useForm<FormData>({
        mode: 'onChange'
    })

    const newPassword = watch('newPassword')

    const onSubmit = (data: FormData) => {
        setSuccess(false)
        onChangePassword(data.currentPassword, data.newPassword)
        setSuccess(true)
        reset()
    }

    return (
        <Card className="w-full shadow-md transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary"/>
                    Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                            id="current-password"
                            type="password"
                            {...register('currentPassword', {
                                required: 'Current password is required'
                            })}
                            placeholder="Enter current password"
                            autoComplete="current-password"
                            className="mt-1"
                        />
                        {errors.currentPassword && (
                            <p className="mt-1 text-sm text-destructive">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            {...register('newPassword', {
                                required: 'Password is required',
                                pattern: {
                                    value: /^[^\s\x00-\x1F\x7F]{8,128}$/,
                                    message: 'Password must be between 8 and 128 characters and contain no whitespace'
                                }
                            })}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            className="mt-1"
                        />
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-destructive">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your new password',
                                validate: (value) =>
                                    value === newPassword || 'Passwords do not match'
                            })}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            className="mt-1"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {success && (
                        <p className="text-sm text-green-600">Password changed successfully.</p>
                    )}

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
