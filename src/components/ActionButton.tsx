import {cn} from "@/lib/utils";

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
                                                       icon,
                                                       label,
                                                       onClick,
                                                       className,
                                                       disabled = false,
                                                   }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex flex-col items-center justify-center p-3 rounded-md border transition-colors w-full h-full",
                disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent hover:text-accent-foreground",
                className
            )}
        >
            {icon}
            <span
                className={cn("mt-1 text-xs font-medium text-center leading-tight", className?.includes("text-") ? "" : "text-xs")}>{label}</span>
        </button>
    );
};

export default ActionButton;
