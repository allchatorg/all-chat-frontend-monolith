import React from 'react';
import {Card, CardHeader, CardTitle} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Separator} from '@/components/ui/separator';
import {Message} from '@/models/message';
import MessageItem from '@/features/chatroom/components/MessageItem';
import PaginationFooter from "@/components/PaginationFooter";
import {Spinner} from "@/components/Spinner";
import {Button} from "@/components/ui/button";
import {X} from "lucide-react";
import {BlockedSearchMessageItem} from "@/features/chatroom/components/BlockedSearchMessageItem";

interface Props {
    title?: string;
    showTitle: boolean;
    showMessageChatRoomName?: boolean;
    messages: Message[];
    isLoading: boolean;
    error?: any;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onMessageClick: (message: Message) => void;
    onClose?: () => void;
    blockedUserIds?: number[];
}

const SearchMessagesDisplay: React.FC<Props> = ({
                                                    title,
                                                    showTitle,
                                                    showMessageChatRoomName,
                                                    messages,
                                                    isLoading,
                                                    error,
                                                    totalPages,
                                                    currentPage,
                                                    onPageChange,
                                                    onMessageClick,
                                                    onClose,
                                                    blockedUserIds = [],
                                                }) => {

    return (
        <Card className="glass-panel flex h-full min-h-0 w-full flex-1 flex-col border-0">
            {showTitle && (
                <>
                    <CardHeader className="flex shrink-0 flex-row items-center justify-between p-4">
                        <CardTitle>{title}</CardTitle>
                        <Button variant="ghost" size="sm" className="glass-control" onClick={onClose}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </CardHeader>
                    <Separator className="shrink-0"/>
                </>
            )}

            {isLoading || messages.length > 0 ? (
                <ScrollArea className="min-h-0 flex-1">
                    <div className="relative min-h-full p-4">
                        {isLoading ? (
                            <div className="absolute inset-0 z-10 flex items-center justify-center /50">
                                <Spinner/>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isBlocked = blockedUserIds.includes(message.senderId);

                                if (isBlocked) {
                                    return (
                                        <div key={message.id}>
                                            <BlockedSearchMessageItem
                                                message={message}
                                                showChatRoomName={showMessageChatRoomName}
                                                onMessageClick={onMessageClick}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={message.id}>
                                        <MessageItem
                                            message={message}
                                            showChatRoomName={showMessageChatRoomName}
                                            viewMode="search"
                                            handleMessageClick={onMessageClick}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    <p>No messages found</p>
                </div>
            )}

            <div className="shrink-0 border-t border-white/20 dark:border-white/10">
                <PaginationFooter
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                />
            </div>
        </Card>
    );
};

export default SearchMessagesDisplay;
