'use client';

import {useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject} from 'react';
import {getServerTypingSnapshot, getTypingSnapshot, observeTypingRoom, subscribeTyping} from '@/lib/typingStore';

export function TypingIndicator({roomId, currentUserId, blockedUserIds, enabled, showBubble, viewportRef}: {
    roomId: number;
    currentUserId: number;
    blockedUserIds: number[];
    enabled: boolean;
    showBubble: boolean;
    viewportRef: RefObject<HTMLDivElement | null>;
}) {
    const indicatorRef = useRef<HTMLDivElement>(null);
    const previousHeight = useRef(0);
    const participants = useSyncExternalStore(subscribeTyping, () => getTypingSnapshot(roomId), getServerTypingSnapshot);
    useEffect(() => {
        if (enabled) return observeTypingRoom(roomId);
    }, [roomId, currentUserId, enabled]);

    const visible = enabled && showBubble ? participants.filter(user => user.userId !== currentUserId && !blockedUserIds.includes(user.userId)) : [];
    const count = visible.length;
    const namedParticipants = count <= 2 ? visible : [];
    const subject = count > 2 ? `${count} people` : namedParticipants.map(user => user.username).join(' and ');
    const action = count === 1 ? 'is typing…' : 'are typing…';
    const label = count ? `${subject} ${action}` : '';

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const height = indicatorRef.current?.offsetHeight ?? 0;
        const addedHeight = height - previousHeight.current;
        previousHeight.current = height;
        if (!viewport || addedHeight <= 0) return;

        // Measure the distance before this bubble grew. Only follow activity if
        // the reader was already at the end, never while browsing older messages.
        const previousDistanceFromBottom = viewport.scrollHeight - addedHeight - viewport.clientHeight - viewport.scrollTop;
        if (previousDistanceFromBottom <= 2) viewport.scrollTop = viewport.scrollHeight;
    }, [label, viewportRef]);

    if (!enabled) return null;

    return (
        <div ref={indicatorRef} className="min-w-0">
            {/* Keep the live region mounted, including when the bubble is empty. */}
            <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{label}</span>
            {count > 0 && (
                <div className="flex w-full min-w-0 items-start py-1">
                    <div
                        aria-hidden="true"
                        title={label}
                        className="flex w-fit min-w-0 max-w-[70%] items-center gap-2 rounded-lg bg-muted/80 px-3 py-2 text-sm leading-5 text-muted-foreground shadow-sm"
                    >
                        <span className="flex h-4 shrink-0 items-center gap-1">
                            {[0, 1, 2].map(index => (
                                <span key={index}
                                      className="size-1 rounded-full bg-current motion-safe:animate-typing-dot"
                                      style={{animationDelay: `${index * 160}ms`}}/>
                            ))}
                        </span>
                        <span className="flex min-w-0 items-baseline gap-1">
                            <span className="flex min-w-0 items-baseline gap-1 font-medium text-foreground/80">
                                {count > 2 ? subject : namedParticipants.map((user, index) => (
                                    <span key={user.userId} className="contents">
                                        {index > 0 && <span className="shrink-0 font-normal text-muted-foreground">and</span>}
                                        <bdi className="min-w-0 truncate">{user.username}</bdi>
                                    </span>
                                ))}
                            </span>
                            <span className="shrink-0">{action}</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
