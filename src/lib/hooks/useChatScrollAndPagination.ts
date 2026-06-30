import {ChatRoom} from "@/models/ChatRoom";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/redux/store";
import {selectChatRoomScrollPosition, selectJumpToMessageId} from "@/redux/chatRoom/chatRoomSelectors";
import {
    setChatRoomScrollPosition,
    setChatRoomTopMostVisibleMessageId,
    setJumpToMessageId
} from "@/redux/chatRoom/chatRoomUiSlice";
import debounce from "lodash/debounce";
import {useThunk} from "./useThunk";
import {fetchChatRoomMessagesThunk} from "@/redux/chatRoom/chatRoomThunk";
import {useIntersectionObserver} from "@/lib/hooks/useIntersectionObserver";
import {usePullToRefresh} from "@/lib/hooks/usePullToRefresh";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

const SHOW_JUMP_TO_PRESENT_THRESHOLD = 15;
export const CHAT_PULL_TO_REFRESH_THRESHOLD = 70;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ConversationLike {
    id?: number;
    lastMessage?: { id: number } | null;
    lastReadMessage?: { id: number } | null;
}

export interface ConversationPagingConfig {
    selectScrollPositions: (state: RootState) => Record<number, number>;
    selectJumpToMessageId: (state: RootState) => number | null | undefined;
    fetchMessagesThunk: typeof fetchChatRoomMessagesThunk;
    setScrollPosition: (payload: { roomId: number; scrollTop: number }) => any;
    setTopMostVisibleMessageId: (payload: { roomId: number; messageId: number }) => any;
    setJumpToMessageId: (id: number | null) => any;
}

export const PUBLIC_CHAT_PAGING_CONFIG: ConversationPagingConfig = {
    selectScrollPositions: selectChatRoomScrollPosition,
    selectJumpToMessageId: selectJumpToMessageId,
    fetchMessagesThunk: fetchChatRoomMessagesThunk,
    setScrollPosition: ({roomId, scrollTop}) => setChatRoomScrollPosition({chatRoomId: roomId, scrollTop}),
    setTopMostVisibleMessageId: ({roomId, messageId}) => setChatRoomTopMostVisibleMessageId({
        chatRoomId: roomId,
        messageId
    }),
    setJumpToMessageId: (id) => setJumpToMessageId(id),
};

// Re-exported lazily-resolved private config — the actual values are set in
// src/lib/hooks/privateChatPagingConfig.ts to avoid cross-imports between this
// hook and the private-chat slice.

export const useChatScrollAndPagination = (
    chatRoom: ChatRoom | undefined,
    selectedUserChatRoom: ConversationLike | null | undefined,
    config: ConversationPagingConfig = PUBLIC_CHAT_PAGING_CONFIG
) => {
    const dispatch = useDispatch<AppDispatch>();

    const chatRoomScrollPositions = useSelector(config.selectScrollPositions);
    const jumpMessageId = useSelector(config.selectJumpToMessageId);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const parsedUrlChatRoomId = searchParams.get('chatRoomId') ? parseInt(searchParams.get('chatRoomId') as string, 10) : undefined;
    const parsedUrlMessageId = searchParams.get('jumpTo') ? parseInt(searchParams.get('jumpTo') as string, 10) : undefined;
    const hasValidUrlJumpParameters = !!chatRoom && (parsedUrlChatRoomId && parsedUrlMessageId) && (parsedUrlChatRoomId === chatRoom.id);

    const [viewport, setViewport] = useState<HTMLElement | null>(null);
    const [highlightData, setHighlightData] = useState<{ id: number, ts: number } | null>(null);

    const restoredRoomId = useRef<number | null>(null);

    const scrollRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            // Disable native browser scroll anchoring which fights with our manual JS math on Safari
            node.style.setProperty('overflow-anchor', 'none');
            setViewport(node);
        }
    }, []);

    useEffect(() => {
        if (!viewport || !chatRoom?.id) return;
        const handleScroll = debounce(() => {
            dispatch(config.setScrollPosition({
                roomId: chatRoom.id,
                scrollTop: viewport.scrollTop
            }));
        }, 50);

        viewport.addEventListener("scroll", handleScroll);

        return () => {
            viewport.removeEventListener("scroll", handleScroll);
            handleScroll.cancel();
        };
    }, [viewport, chatRoom?.id, dispatch]);

    const scrollToBottom = useCallback(() => {
        if (viewport) {
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: "instant"
            });
        }
    }, [viewport]);

    const scrollToMessageById = useCallback((messageId: number | null, highlight: boolean = false, behavior: ScrollBehavior = "smooth") => {
        if (!viewport || !messageId) return;

        const messageElement = viewport.querySelector(`[data-message-id="${messageId}"]`);

        if (messageElement) {
            messageElement.scrollIntoView({
                behavior: behavior,
                block: "center",
            });

            if (highlight) {
                setHighlightData({id: messageId, ts: Date.now()});
            }
        }
    }, [viewport]);

    // --- 2. PAGINATION ---
    const [runFetchMessages, fetchMessagesLoading] = useThunk(config.fetchMessagesThunk);
    const previousFirstMessageId = useRef<number | null>(null);
    // Viewport-relative top of the previous first message, captured right before an
    // older-messages fetch so we can restore the exact visual position afterwards.
    const previousAnchorTop = useRef<number | null>(null);
    const isRestoringScroll = useRef<boolean>(false);
    const scrollRestorationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- PULL-TO-REFRESH ---
    const pullToRefreshState = usePullToRefresh({
        scrollElement: viewport,
        enabled: !!chatRoom?.hasPrevious && !fetchMessagesLoading && !isRestoringScroll.current,
        threshold: CHAT_PULL_TO_REFRESH_THRESHOLD,
        onRefresh: async () => {
            if (!chatRoom) return;
            isRestoringScroll.current = true;
            previousFirstMessageId.current = chatRoom.firstMessageId ?? null;
            // Capture the current first message's on-screen position so we can pin it back
            // after the prepend. Using the element rect (not scrollHeight) keeps the anchor
            // stable even as the pull-to-refresh indicator changes height.
            const anchorEl = chatRoom.firstMessageId != null
                ? viewport?.querySelector(`[data-message-id="${chatRoom.firstMessageId}"]`)
                : null;
            previousAnchorTop.current = anchorEl ? anchorEl.getBoundingClientRect().top : null;

            await runFetchMessages({
                roomId: chatRoom.id,
                beforeMessageId: chatRoom.firstMessageId ?? undefined
            }).finally(() => {
                if (scrollRestorationTimeout.current) clearTimeout(scrollRestorationTimeout.current);
                scrollRestorationTimeout.current = setTimeout(() => {
                    isRestoringScroll.current = false;
                }, 500);
            });
        },
    });

    const {elementRef: nextMessageRef} = useIntersectionObserver(
        (entry) => {
            if (entry.isIntersecting && chatRoom?.hasNext && !fetchMessagesLoading) {
                runFetchMessages({
                    roomId: chatRoom.id,
                    afterMessageId: chatRoom.lastMessageId ?? undefined,
                });
            }
        },
        {
            threshold: 1,
            rootMargin: '0px',
        }
    );

    useIsomorphicLayoutEffect(() => {
        if (
            previousFirstMessageId.current &&
            chatRoom?.firstMessageId !== previousFirstMessageId.current
        ) {
            // Preserve the user's visual position after older messages are prepended by
            // pinning the previous first message back to the exact viewport offset it had
            // before the fetch. Anchoring on the element rect (rather than a raw scrollHeight
            // diff) is immune to the pull-to-refresh indicator changing height between
            // measurements, which previously caused the jump to jitter or snap to the bottom.
            if (viewport && previousAnchorTop.current !== null) {
                // Force a synchronous reflow. Safari is notorious for deferring layout calculations
                // which leaves element rects stale if read without this.
                void viewport.offsetHeight;

                const anchorEl = viewport.querySelector(
                    `[data-message-id="${previousFirstMessageId.current}"]`
                );
                if (anchorEl) {
                    const delta = anchorEl.getBoundingClientRect().top - previousAnchorTop.current;

                    // Safari ignores `scrollTop` changes if kinetic/momentum scrolling is currently active.
                    // Briefly toggling overflow to 'hidden' kills the momentum and forces Safari to honor the new scrollTop.
                    const originalOverflow = viewport.style.overflowY;
                    viewport.style.overflowY = 'hidden';
                    viewport.scrollTop = viewport.scrollTop + delta;
                    viewport.style.overflowY = originalOverflow;
                }
            }
            previousFirstMessageId.current = null;
            previousAnchorTop.current = null;

            // Reset lock safely AFTER DOM structure and layout have fully updated to avoid double triggers
            if (scrollRestorationTimeout.current) clearTimeout(scrollRestorationTimeout.current);
            scrollRestorationTimeout.current = setTimeout(() => {
                isRestoringScroll.current = false;
            }, 250);
        }
    }, [chatRoom?.firstMessageId, viewport]);

    // --- 3. VISIBILITY & TOPMOST MESSAGE ---
    const visibleMessageIds = useRef<Set<number>>(new Set());
    const [topMostVisibleMessageId, setTopMostVisibleMessageId] = useState<number | null>(null);

    useEffect(() => {
        if (!viewport || !chatRoom?.id) return;

        const calculateTopMost = debounce(() => {
            if (visibleMessageIds.current.size === 0) return;

            const querySelectorAll = viewport.querySelectorAll('[data-message-id]');
            let topMostId: number | null = null;
            let minTop = Infinity;

            const viewportRectTop = viewport.getBoundingClientRect().top;

            querySelectorAll.forEach(el => {
                const idAttr = el.getAttribute('data-message-id');
                if (!idAttr) return;
                const messageId = parseInt(idAttr, 10);

                if (visibleMessageIds.current.has(messageId)) {
                    const rect = el.getBoundingClientRect();
                    const topOffset = Math.abs(rect.top - viewportRectTop);

                    if (topOffset < minTop || (rect.top >= viewportRectTop && rect.top < minTop)) {
                        minTop = topOffset;
                        topMostId = messageId;
                    }
                }
            });

            if (topMostId !== null) {
                setTopMostVisibleMessageId(topMostId);
                dispatch(config.setTopMostVisibleMessageId({
                    roomId: chatRoom.id,
                    messageId: topMostId
                }));
            }
        }, 150);

        const observer = new IntersectionObserver((entries) => {
            let changed = false;
            entries.forEach(entry => {
                const idAttr = entry.target.getAttribute('data-message-id');
                if (!idAttr) return;
                const messageId = parseInt(idAttr, 10);
                if (entry.isIntersecting) {
                    if (!visibleMessageIds.current.has(messageId)) {
                        visibleMessageIds.current.add(messageId);
                        changed = true;
                    }
                } else {
                    if (visibleMessageIds.current.has(messageId)) {
                        visibleMessageIds.current.delete(messageId);
                        changed = true;
                    }
                }
            });
            if (changed) {
                calculateTopMost();
            }
        }, {
            root: viewport,
            threshold: 1,
        });

        const observeElements = () => {
            const messageElements = viewport.querySelectorAll('[data-message-id]');
            messageElements.forEach(el => observer.observe(el));
        };

        observeElements();

        const mutationObserver = new MutationObserver((mutations) => {
            let shouldRecalculate = false;
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        if (node.hasAttribute('data-message-id')) {
                            observer.observe(node);
                        }
                        const messages = node.querySelectorAll('[data-message-id]');
                        messages.forEach(msg => observer.observe(msg));
                    }
                });
                mutation.removedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        let localRemoved = false;
                        if (node.hasAttribute('data-message-id')) {
                            const idAttr = node.getAttribute('data-message-id');
                            if (idAttr) {
                                visibleMessageIds.current.delete(parseInt(idAttr, 10));
                                localRemoved = true;
                            }
                        }
                        const messages = node.querySelectorAll('[data-message-id]');
                        messages.forEach(msg => {
                            const idAttr = msg.getAttribute('data-message-id');
                            if (idAttr) {
                                visibleMessageIds.current.delete(parseInt(idAttr, 10));
                                localRemoved = true;
                            }
                        });
                        if (localRemoved) shouldRecalculate = true;
                    }
                });
            });
            if (shouldRecalculate) {
                calculateTopMost();
            }
        });

        mutationObserver.observe(viewport.querySelector('div') || viewport, {
            childList: true,
            subtree: true
        });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
            calculateTopMost.cancel();
            visibleMessageIds.current.clear();
        };
    }, [viewport, chatRoom?.id, dispatch]);

    const isLastMessageVisible = useRef<boolean>(false);
    const [showJumpToPresentPill, setShowJumpToPresentPill] = useState(false);

    // Track the id of the newest in-memory message (per room) so we can distinguish a
    // genuinely-appended new message from an older-messages prepend during pagination.
    const previousLastMessageId = useRef<number | null>(null);
    const lastMessageTrackedRoomId = useRef<number | null>(null);

    const isLastMessageInMemory = useCallback(() => {
        const lastLoadedChatMessage = [...(chatRoom?.messages ?? [])]
            .reverse()
            .find(message => !message.advert);

        return lastLoadedChatMessage?.id === selectedUserChatRoom?.lastMessage?.id;
    }, [chatRoom?.messages, selectedUserChatRoom?.lastMessage?.id]);

    const shouldShowJumpToPresent = useCallback((topMostId: number | null) => {
        if (!topMostId || !chatRoom) return false;
        if (chatRoom.hasNext) return true;

        const chatMessages = chatRoom.messages.filter(message => !message.advert);
        const index = chatMessages.findIndex(msg => msg.id === topMostId);
        if (index === -1) return false;

        return isLastMessageInMemory() && index <= chatMessages.length - SHOW_JUMP_TO_PRESENT_THRESHOLD;
    }, [chatRoom, isLastMessageInMemory]);

    useEffect(() => {
        setShowJumpToPresentPill(shouldShowJumpToPresent(topMostVisibleMessageId));
    }, [topMostVisibleMessageId, shouldShowJumpToPresent]);

    const jumpToMessageId = useCallback((messageId: number, highlight: boolean = true, behavior: ScrollBehavior = "smooth") => {
        if (!chatRoom) return;
        const jumpMessageIndex = chatRoom.messages.findIndex(m => !m.advert && m.id === messageId);

        if (jumpMessageIndex !== -1) {
            scrollToMessageById(messageId, highlight, behavior);
        } else {
            runFetchMessages({roomId: chatRoom.id, aroundMessageId: messageId}).then(
                () => {
                    setTimeout(() => {
                        scrollToMessageById(messageId, highlight, behavior);
                    }, 50);
                }
            );
        }
    }, [chatRoom, runFetchMessages, scrollToMessageById]);

    useEffect(() => {
        if (!viewport || !chatRoom?.id) return;

        if (restoredRoomId.current === chatRoom.id) return;

        const savedPosition = chatRoomScrollPositions[chatRoom.id];

        requestAnimationFrame(() => {
            if (hasValidUrlJumpParameters || jumpMessageId) {
                // Do nothing, let the jump logic handle scrolling
            } else if (typeof savedPosition === "number") {
                viewport.scrollTop = savedPosition;
            } else if (chatRoom.lastReadMessage) {
                jumpToMessageId(chatRoom.lastReadMessage, false, "instant");
            } else {
                scrollToBottom();
            }
            restoredRoomId.current = chatRoom.id;
        });
    }, [chatRoom?.id, viewport, scrollToBottom, hasValidUrlJumpParameters, jumpMessageId, chatRoom?.lastReadMessage, jumpToMessageId]);

    // Handle URL-driven jump
    useEffect(() => {
        if (!hasValidUrlJumpParameters || !parsedUrlMessageId) {
            return;
        }
        jumpToMessageId(parsedUrlMessageId);
        router.replace(pathname);
    }, [hasValidUrlJumpParameters, parsedUrlMessageId, jumpToMessageId, router, pathname]);

    // Handle app-driven jump
    useEffect(() => {
        if (!jumpMessageId || fetchMessagesLoading) {
            return;
        }
        jumpToMessageId(jumpMessageId);
        dispatch(config.setJumpToMessageId(null));
    }, [jumpMessageId, fetchMessagesLoading, jumpToMessageId, dispatch]);

    const {elementRef: lastMessageVisibilityRef} = useIntersectionObserver(
        (entry) => {
            isLastMessageVisible.current = entry.isIntersecting;
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px 10px 0px',
        }
    );

    useEffect(() => {
        if (!chatRoom || fetchMessagesLoading) return;

        const lastChatMessage = [...chatRoom.messages].reverse().find(m => !m.advert);
        const lastChatMessageId = lastChatMessage?.id ?? null;

        // Reset tracking on room switch so we never compare last-message ids across rooms.
        if (lastMessageTrackedRoomId.current !== chatRoom.id) {
            lastMessageTrackedRoomId.current = chatRoom.id;
            previousLastMessageId.current = lastChatMessageId;
            return;
        }

        const previousId = previousLastMessageId.current;
        previousLastMessageId.current = lastChatMessageId;

        // Only auto-follow to the bottom when a genuinely newer message was appended —
        // NOT when older messages were prepended via pagination (last id is unchanged),
        // and never while an older-messages scroll restoration is in flight. Otherwise the
        // view snaps to the bottom instead of anchoring to where the user was reading.
        const newerMessageAppended =
            previousId !== null && lastChatMessageId !== null && lastChatMessageId > previousId;
        if (!newerMessageAppended || isRestoringScroll.current) return;

        const shouldScrollToBottom = !chatRoom.hasNext && isLastMessageVisible.current && isLastMessageInMemory();
        if (shouldScrollToBottom) {
            scrollToBottom();
        }
    }, [chatRoom?.messages, chatRoom?.hasNext, chatRoom?.id, fetchMessagesLoading, isLastMessageInMemory, scrollToBottom, selectedUserChatRoom?.id]);

    const handleJumpToPresent = useCallback(() => {
        if (!chatRoom) return;
        runFetchMessages({roomId: chatRoom.id}).then(() => {
            setShowJumpToPresentPill(false);
            scrollToBottom();
        });
    }, [chatRoom, runFetchMessages, scrollToBottom]);

    return {
        scrollRef,
        scrollToBottom,
        scrollToMessageById,
        viewport,
        fetchMessagesLoading,
        nextMessageRef,
        showJumpToPresentPill,
        handleJumpToPresent,
        isLastMessageVisible,
        lastMessageVisibilityRef,
        isLastMessageInMemory,
        highlightData,
        pullToRefreshState,
    };
};
