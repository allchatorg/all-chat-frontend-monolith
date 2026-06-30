'use client'

import React from 'react'
import {useForm} from 'react-hook-form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Label} from '@/components/ui/label'
import {AlertCircle, User} from 'lucide-react'
import {ConfirmationMessage} from '@/components/ConfirmationMessage'

interface ClaimUserFormData {
    email: string
    password: string
    confirmPassword?: string
}

interface ClaimUserProps {
    onClaim: (email: string, password: string) => void,
    claimed?: boolean,
    loading?: boolean
}

export const ClaimUser: React.FC<ClaimUserProps> = ({
                                                        onClaim,
                                                        claimed,
                                                        loading
                                                    }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: {errors, isValid},
        reset
    } = useForm<ClaimUserFormData>({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    })

    const password = watch('password')

    const onSubmit = (data: ClaimUserFormData) => {
        onClaim(data.email, data.password)
    }

    // Reset form when claimed
    React.useEffect(() => {
        if (claimed) {
            reset()
        }
    }, [claimed, reset])

    return (
        <Card className="shadow-md transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary"/>
                    Claim User Account
                </CardTitle>
                <CardDescription>
                    Enter your credentials to claim your user account.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {claimed ? (
                    <ConfirmationMessage
                        title="Account Claimed"
                        description="Your account has been successfully claimed."
                        badgeText="Claimed"
                    />
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Please enter a valid email address'
                                    }
                                })}
                                placeholder="Enter your email"
                                className={`mt-1 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.email && (
                                <div className="mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 text-red-500"/>
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters long'
                                    },
                                    maxLength: {
                                        value: 32,
                                        message: 'Password must be at most 32 characters long'
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                                    }
                                })}
                                placeholder="Enter your password"
                                className={`mt-1 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.password && (
                                <div className="mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 text-red-500"/>
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value => value === password || 'Passwords do not match'
                                })}
                                placeholder="Confirm your password"
                                className={`mt-1 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.confirmPassword && (
                                <div className="mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 text-red-500"/>
                                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="w-fit"
                                disabled={!isValid || loading}
                            >
                                {loading ? 'Claiming...' : 'Claim Account'}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}