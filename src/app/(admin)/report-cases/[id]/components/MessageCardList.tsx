import * as React from 'react';
import {useEffect, useRef} from 'react';
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
    scrollToReported?: boolean,
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
                                                             scrollToReported = false,
                                                             redacted = false
                                                         }) => {
    const reportedMessageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = reportedMessageRef.current;
        const viewport = element?.closest('[data-radix-scroll-area-viewport]');
        if (!scrollToReported || !element || !viewport) {
            return;
        }

        // Scrolls this list only; scrollIntoView would also move the page.
        const offset = element.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
        viewport.scrollTop += offset - (viewport.clientHeight - element.clientHeight) / 2;
    }, [scrollToReported, reportedMessageId, messages.length]);

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
                            messages.map((message) => {
                                const isReported = message.id === reportedMessageId;
                                // On a wrapper: a message's own background is an inline color, and
                                // attachment-only messages have no bubble to style.
                                return (
                                    <div
                                        key={message.id}
                                        ref={isReported ? reportedMessageRef : undefined}
                                        className={isReported ? 'rounded-lg border-l-4 border-destructive bg-destructive/15 p-2' : undefined}
                                    >
                                        {isReported && (
                                            <p className="mb-1 text-xs font-semibold text-red-700 dark:text-red-300">Reported message</p>
                                        )}
                                        <MessageItem
                                            message={message}
                                            viewMode={'chat'}
                                            handleMessageClick={() => onMessageClick(message)}
                                        />
                                    </div>
                                );
                            })
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