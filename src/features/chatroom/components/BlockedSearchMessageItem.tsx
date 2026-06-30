import React from "react";
import {Message} from "@/models/message";
import MessageItem from "@/features/chatroom/components/MessageItem";

export const BlockedSearchMessageItem: React.FC<{
    message: Message;
    showChatRoomName?: boolean;
    onMessageClick: (message: Message) => void;
}> = ({message, showChatRoomName, onMessageClick}) => {
    const [isRevealed, setIsRevealed] = React.useState(false);

    if (isRevealed) {
        return (
            <div className="relative group/blocked">
                <div className="absolute top-3 right-16 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsRevealed(false);
                        }}
                        className="glass-pill text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 hover:underline px-1 rounded"
                        title="Hide this message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                            <path
                                d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path
                                d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                            <line x1="2" x2="22" y1="2" y2="22"/>
                        </svg>
                        Hide
                    </button>
                </div>
                <MessageItem
                    message={message}
                    showChatRoomName={showChatRoomName}
                    viewMode="search"
                    handleMessageClick={onMessageClick}
                />
            </div>
        );
    }

    return (
        <div className="glass-surface relative mb-3 rounded-lg p-4">
            <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <span>Blocked User</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm italic text-muted-foreground">Blocked Message</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsRevealed(true);
                        }}
                        className="text-xs font-medium text-primary hover:underline focus:outline-none"
                    >
                        Show Message
                    </button>
                </div>
            </div>
        </div>
    );
};
