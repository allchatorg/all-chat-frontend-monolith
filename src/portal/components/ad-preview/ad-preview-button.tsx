"use client";

import React from "react";
import {Eye} from "lucide-react";
import {Button} from "@ads/components/ui/button";
import {useDialog} from "@ads/components/providers/DialogProvider";
import {PreviewDialogContent} from "@ads/components/ad-preview/preview-dialog-content";
import {buildPreviewUrl, PreviewAdData} from "@ads/components/ad-preview/preview-utils";
import {cn} from "@ads/lib/utils";

interface AdPreviewButtonProps {
    ad: PreviewAdData;
    title: string;
    label?: string;
    className?: string;
    dialogClassName?: string;
    disabled?: boolean;
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
}

export function AdPreviewButton({
                                    ad,
                                    title,
                                    label = "See Preview",
                                    className,
                                    dialogClassName = "w-[96vw] h-[90%] max-w-5xl overflow-hidden border-0 p-0 shadow-2xl",
                                    disabled,
                                    variant = "outline",
                                    size = "default",
                                }: AdPreviewButtonProps) {
    const {open} = useDialog();
    const previewUrl = buildPreviewUrl(ad);

    const handleOpen = () => {
        open(
            <PreviewDialogContent
                previewUrl={previewUrl}
                title={title}
            />,
            {
                className: dialogClassName,
            }
        );
    };

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            disabled={disabled}
            onClick={handleOpen}
            className={cn("rounded-xl", className)}
        >
            <Eye className="h-4 w-4"/>
            {label}
        </Button>
    );
}
