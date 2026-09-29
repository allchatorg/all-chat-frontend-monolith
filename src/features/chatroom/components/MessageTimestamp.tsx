import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";
import {cn} from "@/lib/utils";

interface MessageTimestampProps {
    createdAt: string;
    isOwn?: boolean;
    placement?: "below" | "inline";
}

export const MessageTimestamp = ({createdAt, isOwn = false, placement = "below"}: MessageTimestampProps) => {
    const {formatMessageDate} = useFormatMessageDate();

    return (
        <time
            dateTime={createdAt}
            className={cn(
                "min-w-0 whitespace-normal tabular-nums text-muted-foreground",
                placement === "below"
                    ? cn(
                        "block w-fit max-w-[70%] px-1 pt-0.5 text-[11px] leading-4 lg:hidden",
                        isOwn ? "self-end text-right" : "self-start text-left"
                    )
                    : cn("hidden px-2 text-xs italic lg:block", isOwn ? "text-left" : "text-right")
            )}
        >
            {formatMessageDate(createdAt)}
        </time>
    );
};
