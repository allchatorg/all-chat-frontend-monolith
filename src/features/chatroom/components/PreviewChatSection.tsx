"use client";

import React from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {Message} from "@/models/message";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import ChatSectionHeader from "@/features/chatroom/components/ChatSectionHeader";
import ChatMessage from "@/features/chatroom/components/ChatMessage";
import {AdvertMessage} from "@/features/chatroom/components/AdvertMessage";
import {ChatInputShowcase} from "@/features/chatroom/components/ChatInput";

interface PreviewChatSectionProps {
    chatRoomName: string;
    totalMessages: number;
    messages: Message[];
    currentUserId: number;
    currentUsername: string;
    noiseLevel?: ChatRoomNoiseLevelEnum;
    className?: string;
}

export function PreviewChatSection({
                                       chatRoomName,
                                       totalMessages,
                                       messages,
                                       currentUserId,
                                       currentUsername,
                                       noiseLevel = ChatRoomNoiseLevelEnum.CONVERSATIONAL,
                                       className,
                                   }: PreviewChatSectionProps) {
    const [activeMobileMessageId, setActiveMobileMessageId] = React.useState<number | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const messagesContentRef = React.useRef<HTMLDivElement | null>(null);

    React.useLayoutEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        const messagesContent = messagesContentRef.current;

        if (!scrollContainer || !messagesContent) {
            return;
        }

        const scrollToBottom = () => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        };

        scrollToBottom();

        const frameIds: number[] = [];
        frameIds.push(window.requestAnimationFrame(scrollToBottom));
        frameIds.push(window.requestAnimationFrame(() => {
            frameIds.push(window.requestAnimationFrame(scrollToBottom));
        }));

        let resizeObserver: ResizeObserver | null = null;

        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                scrollToBottom();
            });
            resizeObserver.observe(messagesContent);
        }

        return () => {
            frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId));
            resizeObserver?.disconnect();
        };
    }, [messages]);

    return (
        <Card className={cn(
            "flex h-full min-h-full w-full flex-col rounded-none border-0 shadow-none",
            className,
        )}>
            <CardHeader className="p-2 px-5">
                <div className="pointer-events-none select-none">
                    <ChatSectionHeader
                        chatRoomName={chatRoomName}
                        totalMessages={totalMessages}
                        noiseLevel={noiseLevel}
                        popularitySidebarActive={false}
                        onTogglePopularitySidebar={() => {
                        }}
                    />
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col overflow-hidden px-2">
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden select-none touch-pan-y"
                    >
                        <div className="sticky top-0 z-10 flex justify-center px-4 pb-2 pt-3">
                            <div
                                className="pointer-events-none rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-xs backdrop-blur-sm">
                                Preview Only • Message Interactions Disabled
                            </div>
                        </div>
                        <div ref={messagesContentRef}>
                            {messages.map((message) => (
                                <div key={message.id} data-message-id={message.id}>
                                    <div
                                        aria-disabled={message.advert ? undefined : true}
                                        className={cn(
                                            "group relative flex w-full min-w-0 items-center pr-2 transition-all duration-200",
                                            message.advert ? "cursor-default" : "cursor-not-allowed",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex w-full min-w-0 items-center pr-2",
                                                message.advert ? "pointer-events-auto" : "pointer-events-none",
                                            )}
                                        >
                                            {message.advert ? (
                                                <AdvertMessage
                                                    message={message}
                                                    onHide={() => {
                                                    }}
                                                    interactionsDisabled
                                                    allowAttachmentPreview
                                                />
                                            ) : (
                                                <ChatMessage
                                                    message={message}
                                                    currentUserId={currentUserId}
                                                    currentUsername={currentUsername}
                                                    isOwn={message.senderId === currentUserId}
                                                    removeMessage={() => {
                                                    }}
                                                    isBlocked={false}
                                                    showMobileMenu={activeMobileMessageId === message.id}
                                                    onToggleMobileMenu={(show) => setActiveMobileMessageId(show ? message.id : null)}
                                                    interactionsDisabled
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <ChatInputShowcase/>
            </CardContent>
        </Card>
    );
}
