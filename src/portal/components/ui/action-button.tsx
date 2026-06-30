import * as React from "react"
import {Button} from "@ads/components/ui/button"
import {cn} from "@ads/lib/utils"
import {LucideIcon} from "lucide-react"

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: LucideIcon
    children: React.ReactNode
    variant?: "default" | "negative"
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({className, children, icon: Icon, variant = "default", ...props}, ref) => {
        const variantStyles = {
            default: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50",
            negative: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 dark:shadow-red-900/50"
        }

        return (
            <Button
                ref={ref}
                className={cn(
                    variantStyles[variant],
                    className
                )}
                {...props}
            >
                {children}
                {Icon && <Icon className="w-4 h-4 ml-2"/>}
            </Button>
        )
    }
)
ActionButton.displayName = "ActionButton"

export {ActionButton}
