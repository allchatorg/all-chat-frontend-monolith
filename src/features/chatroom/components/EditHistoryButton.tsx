import React, {useRef, useState} from 'react';
import {Message} from "@/models/message";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchMessageHistoryThunk} from "@/redux/chatRoom/chatRoomThunk";
import {useDialog} from "@/components/providers/DialogProvider";
import {History} from "lucide-react";
import {MessageHistoryPanel} from "@/features/chatroom/components/MessageHistoryPanel";

interface EditHistoryButtonProps {
    message: Message
}

export const EditHistoryButton: React.FC<EditHistoryButtonProps> = ({message}) => {
    const {open} = useDialog();
    const [fetchHistory, historyLoading] = useThunk(fetchMessageHistoryThunk);
    const [previewCount, setPreviewCount] = useState<number | null>(null);

    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const historyDialogClassName = "glass-dialog gap-0 overflow-hidden p-0";
    const historyDialogOverlayClassName = "bg-slate-950/30 backdrop-blur-[2px] dark:bg-black/45";

    const handleHoverStart = () => {
        hoverTimeout.current = setTimeout(async () => {
            if (!historyLoading && message.editedAt && previewCount === null) {
                const result = await fetchHistory(message.id);
                if (result && Array.isArray(result)) {
                    setPreviewCount(result.length);
                }
            }
        }, 400);
    };

    const handleHoverEnd = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
    };

    const handleTooltipContentClick = async () => {
        const result = await fetchHistory(message.id);
        if (result && Array.isArray(result)) {
            open(<MessageHistoryPanel messages={result} currentMessage={message}/>, {
                className: historyDialogClassName,
                overlayClassName: historyDialogOverlayClassName,
            });
        }
    };

    const handleButtonClick = async () => {
        const result = await fetchHistory(message.id);
        if (result && Array.isArray(result)) {
            open(<MessageHistoryPanel messages={result} currentMessage={message}/>, {
                className: historyDialogClassName,
                overlayClassName: historyDialogOverlayClassName,
            });
        }
    };

    if (!message.editedAt) {
        return null;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleButtonClick}
                        onMouseEnter={handleHoverStart}
                        onMouseLeave={handleHoverEnd}
                        className="
                            glass-control inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium leading-none
                            transition-all duration-200 ease-in-out
                            text-(--glass-control-fg) hover:text-(--glass-control-fg)
                            active:scale-95
                        "
                        aria-label="View edit history"
                    >
                        <History className="w-3 h-3"/>
                        <span>edited</span>
                    </button>
                </TooltipTrigger>
                {!historyLoading && (
                    <TooltipContent className="glass-popover cursor-pointer text-slate-950 dark:text-slate-50">
                        <div className="flex flex-col gap-1" onClick={handleTooltipContentClick}>
                            <p className="flex items-center gap-1.5 font-semibold">
                                <History className="w-4 h-4"/>
                                <span>Edit History</span>
                            </p>

                            {previewCount !== null ? (
                                <div className="text-sm text-slate-900 dark:text-slate-300">
                                    {previewCount} {previewCount === 1 ? 'version' : 'versions'} available
                                    <span className="mt-1 block text-xs">
                                        Click to view full history
                                    </span>
                                </div>
                            ) : (
                                <span
                                    className="text-xs text-slate-900 dark:text-slate-300">Hover to see edit count</span>
                            )}
                        </div>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};
