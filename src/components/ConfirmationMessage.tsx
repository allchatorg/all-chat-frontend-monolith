import React from 'react'
import {CheckCircle} from 'lucide-react'
import {Badge} from '@/components/ui/badge'

interface ConfirmationMessageProps {
    title: string
    description: string
    badgeText?: string
}

export const ConfirmationMessage: React.FC<ConfirmationMessageProps> = ({
                                                                            title,
                                                                            description,
                                                                            badgeText
                                                                        }) => {
    return (
        <div
            className="mt-4 flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500"/>
            <div>
                <p className="font-medium text-green-700 dark:text-green-400">{title}</p>
                <p className="text-sm text-green-600 dark:text-green-500/90">{description}</p>
            </div>
            {badgeText && (
                <Badge variant="default"
                       className="ml-auto bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:text-white">
                    {badgeText}
                </Badge>
            )}
        </div>
    )
}
