import React, {ReactNode, useRef, useState} from "react";
import {Paperclip} from "lucide-react";
import clsx from "clsx";

interface UploadDragAndDropButtonProps {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, nsfw: boolean) => void;
    accept?: string;
    disabled?: boolean;
    title?: string;
    enableDragDrop?: boolean;
    nsfw: boolean;
    icon?: ReactNode;
    label?: string;
    className?: string;
}

export const UploadDragAndDropButton: React.FC<
    UploadDragAndDropButtonProps
> = ({
         onFileSelect,
         accept = "",
         disabled = false,
         title = "Add file",
         enableDragDrop = true,
         nsfw,
         icon,
         label,
         className,
     }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleZoneClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && enableDragDrop) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && enableDragDrop) {
            setIsDragging(true);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled || !enableDragDrop) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const syntheticEvent = {
                target: {
                    files: files,
                },
            } as React.ChangeEvent<HTMLInputElement>;

            onFileSelect(syntheticEvent, nsfw);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, nsfw: boolean) => {
        onFileSelect(e, nsfw);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            onClick={handleZoneClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            title={title}
            className={clsx(
                `
                        inline-flex items-center justify-center gap-1
                        px-3 h-10 rounded-md border-input border transition-all duration-200 cursor-pointer select-none
                        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/35 dark:hover:bg-white/10"}
                        ${isDragging ? "glass-surface-strong" : ""}`, className)}
        >
            <div className="flex items-center gap-2" style={{pointerEvents: "none"}}>
                    <span
                        className={clsx(
                            "flex items-center",
                            isDragging
                                ? "text-blue-500 dark:text-blue-400"
                                : "text-foreground"
                        )}
                    >
                        {icon ? icon : (
                            <Paperclip
                                style={{pointerEvents: "none"}}
                                className={clsx(
                                    "h-4 w-4",
                                    isDragging
                                        ? "text-blue-500 dark:text-blue-400"
                                        : "text-foreground"
                                )}
                            />
                        )}
                    </span>
                {label && (
                    <span
                        className={clsx(
                            "text-sm font-medium",
                            isDragging
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-foreground"
                        )}
                    >
                            {label}
                        </span>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={(e) => handleFileSelect(e, nsfw)}
                className="hidden"
            />
        </div>
    );
};
