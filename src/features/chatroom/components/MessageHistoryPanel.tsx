import React from 'react';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import MessageItem from "@/features/chatroom/components/MessageItem";
import {Message} from "@/models/message";
import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";

interface MessageHistoryPanelProps {
    messages: Message[];
    currentMessage: Message;
}

export const MessageHistoryPanel: React.FC<MessageHistoryPanelProps> = ({
                                                                            messages,
                                                                            currentMessage
                                                                        }) => {
    const {formatMessageDate} = useFormatMessageDate();

    const getVersionTimestamp = (message: Message) =>
        new Date(message.editedAt ?? message.createdAt).getTime();

    const sortedMessages = [...messages].sort((a, b) =>
        getVersionTimestamp(b) - getVersionTimestamp(a)
    );

    return (
        <div
            className="flex h-[80vh] w-[92vw] max-w-[700px] overflow-hidden rounded-lg text-[color:var(--glass-panel-fg)] sm:h-[600px] sm:w-[80vw]">
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-[color:var(--glass-border)] bg-white/10 p-4 pr-12 dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Edit History
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {sortedMessages.length} {sortedMessages.length === 1 ? 'version' : 'versions'}
                            </p>
                        </div>
                        <Badge variant="secondary" className="glass-pill text-xs text-[color:var(--glass-panel-fg)]">
                            {currentMessage.senderUsername}
                        </Badge>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {sortedMessages.length > 0 ? (
                            sortedMessages.map((message, index) => {
                                const isCurrentVersion = message.id === currentMessage.id;
                                const isOriginalVersion = index === sortedMessages.length - 1;

                                return (
                                    <div
                                        key={`${message.id}-${message.editedAt ?? message.createdAt}-${index}`}
                                        className="relative"
                                    >
                                        <div
                                            className="absolute bottom-0 left-4 top-12 w-0.5 bg-[color:var(--glass-border)]"/>

                                        <div className="flex gap-3">
                                            {/* Timeline dot */}
                                            <div className="relative flex-shrink-0 mt-2">
                                                <div
                                                    className={`h-3 w-3 rounded-full ${isCurrentVersion || isOriginalVersion
                                                        ? 'bg-sky-400 ring-4 ring-sky-400/20 shadow-[0_0_14px_rgba(56,189,248,0.36)]'
                                                        : 'bg-white/40 ring-1 ring-[color:var(--glass-border)] dark:bg-white/25'
                                                    }`}/>
                                            </div>

                                            {/* Message content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Version header */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-medium text-foreground">
                                                        Version {sortedMessages.length - index}
                                                    </span>
                                                    {isOriginalVersion && (
                                                        <Badge variant="outline"
                                                               className="glass-pill text-xs text-[color:var(--glass-panel-fg)]">
                                                            Original
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Message display */}
                                                <div
                                                    className={`rounded-lg p-3 ${isCurrentVersion || isOriginalVersion
                                                        ? 'glass-surface-strong'
                                                        : 'glass-surface'
                                                    }`}>
                                                    <MessageItem

                                                        showEditButton={false}
                                                        message={message}
                                                        isOwn={false}
                                                        viewMode="chat"
                                                        handleMessageClick={() => {
                                                        }}
                                                        showSenderName={false}
                                                        showChatRoomName={false}
                                                    />
                                                </div>

                                                {/* Edit timestamp for edited versions */}
                                                {message.editedAt && (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Edited: {formatMessageDate(message.editedAt)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No edit history available
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
