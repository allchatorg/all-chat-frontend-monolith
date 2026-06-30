import * as React from 'react';
import MessageItem from "@/features/chatroom/components/MessageItem";
import {ScrollArea} from '@/components/ui/scroll-area';
import {Card, CardHeader} from '@/components/ui/card';
import {ShieldAlert} from 'lucide-react';

type MessageCardListProps = {
    messages: any[],
    title?: string,
    height?: string,
    maxHeight?: string,
    onMessageClick?: (message: any) => void,
    reportedMessageId?: number,
    redacted?: boolean
};

const MessageCardList: React.FC<MessageCardListProps> = ({
                                                             messages,
                                                             title,
                                                             height = 'auto',
                                                             maxHeight,
                                                             onMessageClick = () => {
                                                             },
                                                             reportedMessageId,
                                                             redacted = false
                                                         }) => {
    return (
        <Card className="flex w-full flex-col" style={{minHeight: height, maxHeight}}>
            {title && (
                <CardHeader className="border-b border-border">
                    <h2 className="text-lg font-semibold">{title}</h2>
                </CardHeader>
            )}

            <ScrollArea className="flex-1">
                {redacted ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                        <ShieldAlert className="h-10 w-10 text-destructive"/>
                        <div>
                            <p className="text-lg font-semibold text-destructive">Content Redacted</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Message content has been redacted because this CSAM case has been resolved.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 p-4">
                        {messages && messages.length > 0 ? (
                            messages.map((message) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    viewMode={'chat'}
                                    className={
                                        message.id === reportedMessageId ? 'bg-destructive/15 rounded-lg p-2' : ''
                                    }
                                    handleMessageClick={() => onMessageClick(message)}
                                />
                            ))
                        ) : (
                            <div className="py-4 text-center text-gray-500">
                                No messages found.
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </Card>
    );
};

export default MessageCardList;