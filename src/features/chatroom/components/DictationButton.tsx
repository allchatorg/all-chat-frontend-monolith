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
            variant="outline"
            size="icon"
            className={cn(
                "glass-control shrink-0 h-10 w-10",
                isListening && "text-red-500 hover:text-red-500 animate-pulse",
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
