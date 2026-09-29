import React from "react";
import {Mic} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

interface DictationButtonProps {
    isSupported: boolean;
    isListening: boolean;
    disabled?: boolean;
    onToggle: () => void;
    className?: string;
}

/**
 * Mic toggle that drives voice dictation in the composer. Renders nothing when
 * the Web Speech API is unsupported (e.g. Firefox) so the toolbar stays clean.
 */
export function DictationButton({
                                    isSupported,
                                    isListening,
                                    disabled,
                                    onToggle,
                                    className,
                                }: DictationButtonProps) {
    if (!isSupported) return null;

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                "composer-action shrink-0 h-10 w-10 lg:h-8 lg:w-8",
                isListening && "dictation-listening hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400",
                className
            )}
            onClick={onToggle}
            disabled={disabled}
            aria-pressed={isListening}
            aria-label={isListening ? "Stop dictation" : "Start dictation"}
            title={isListening ? "Stop dictation" : "Start dictation"}
        >
            <Mic className="h-4 w-4"/>
        </Button>
    );
}
