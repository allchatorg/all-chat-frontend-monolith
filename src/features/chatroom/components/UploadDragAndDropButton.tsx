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
        <>
            <button
                type="button"
                disabled={disabled}
                onClick={handleZoneClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                title={title}
                aria-label={title}
                className={clsx(
                    "composer-action inline-flex shrink-0 items-center justify-center gap-1 h-10 px-2.5 text-xs font-medium lg:h-8 cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50",
                    isDragging && "composer-action-dragging",
                    className
                )}
            >
                <span className="pointer-events-none flex items-center gap-1">
                    {icon || <Paperclip aria-hidden="true" className="h-4 w-4"/>}
                    {label && <span>{label}</span>}
                </span>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                disabled={disabled}
                onChange={(e) => handleFileSelect(e, nsfw)}
                className="hidden"
            />
        </>
    );
};
