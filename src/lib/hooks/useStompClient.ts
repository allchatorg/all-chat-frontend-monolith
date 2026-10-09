import {useCallback, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {ReportNotification} from "@/models/ReportNotification";
import {useDispatch, useSelector} from "react-redux";
import {useReportNotification} from "@/lib/hooks/useReportNotification";
import {useIdVerificationNotification} from "@/lib/hooks/useIdVerificationNotification";
import {IdVerificationResultNotification} from "@/models/IdVerificationResultNotification";
import {fetchMe} from "@/redux/user/usersThunk";
import SockJS from "sockjs-client";
import {Client, IMessage, StompSubscription} from "@stomp/stompjs";
import {AppDispatch, resetApp, RootState, store} from "@/redux/store";
import {getSessionToken, removeSessionToken} from "@/lib/tokenManager";
import {
    addMessageReaction,
    applyPromotionUpdate,
    applyRoomPromotionUpdate,
    handleChatRoomArchivedRegularUser,
    handleChatRoomArchivedStaffUser,
    handleChatRoomBanUserNotificationRegularUser,
    handleChatRoomBanUserNotificationStaffUser,
    handleChatRoomUnarchivedStaffUser,
    handleDeletedMessageRegularUser,
    handleDeletedMessageStaffUser,
    handleEditMessage,
    handleNewMessage,
    handlePopularityUpdate,
    removeMessageReaction,
    updateLastReadMessage,
} from "@/redux/chatRoom/chatRoomSlice";
import {markChatRoomsAsStale, setStompReconnected, updateOpenMessageReactions} from "@/redux/chatRoom/chatRoomUiSlice";
import {
    addPrivateMessageReaction,
    handlePrivateMessageDelete,
    handlePrivateMessageEdit,
    handlePrivateNewMessage,
    removePrivateMessageReaction,
} from "@/redux/privateChat/privateChatSlice";
import {markPrivateRoomsAsStale} from "@/redux/privateChat/privateChatUiSlice";
import {handleIncomingPrivateMessageThunk} from "@/redux/privateChat/privateChatThunk";
import {Message} from "@/models/message";
import {WebSocketMessageType} from "@/models/WebSocketMessageType";
import {WebSocketMessage} from "@/models/WebSocketMessage";
import {selectUser} from "@/redux/user/userSelectors";
import {RoomPopulation} from "@/models/roomPopulation";
import {isStaff} from "@/models/Role";
import {BanUserNotification} from "@/models/BanUserNotification";
import {toast} from "sonner";
import {RoleUpdateNotification} from "@/models/RoleUpdate";
import {ChatRoom} from "@/models/ChatRoom";
import {resolveSelectedRoomThunk} from "@/redux/chatRoom/chatRoomThunk";
import {MessagingAvailability} from "@/models/MessagingAvailability";
import {setMessagingAvailability} from "@/redux/messagingAvailability/messagingAvailabilitySlice";
import {fetchMessagingAvailabilityThunk} from "@/redux/messagingAvailability/messagingAvailabilityThunk";
import {PromotedMessageEvent} from "@/models/PromotedMessageEvent";
import {promotedMessagesApi} from "@ads/store/services/promotedMessagesApi";
import {adminPromotedMessagesApi} from "@ads/store/services/adminPromotedMessagesApi";
import {RoomPromotionEvent} from "@/models/RoomPromotionEvent";
import {roomPromotionsApi} from "@ads/store/services/roomPromotionsApi";
import {adminRoomPromotionsApi} from "@ads/store/services/adminRoomPromotionsApi";
import {AppNotification} from "@/models/AppNotification";
import {NotificationType} from "@/models/NotificationType";
import {notificationReceived} from "@/redux/notifications/notificationsSlice";
import {fetchNotificationsThunk, fetchUnreadCountThunk} from "@/redux/notifications/notificationsThunk";
import {getNotificationRoute} from "@/features/notifications/notificationRoutes";
import {adsApi as adsPortalApi} from "@ads/store/services/adsApi";
import {adminAdsApi} from "@ads/store/services/adminAdsApi";
import {applyVipBadgeUpdate, VipBadgeUpdate, refreshRegisteredVipBadges} from "@/lib/vipBadgeStore";
import {applyFontUpdate, ingestFontSnapshots} from '@/lib/fontStore';
import {getMe} from "@/api/user/userAPI";
import {setUser} from "@/redux/user/userSlice";
import {connectTypingTransport} from "@/lib/typingStore";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";
const PUBLIC_TOPIC = ["/topic/public-chat"];
const USER_TOPIC_DESTINATION = "/topic/user.";
const PRIVATE_MESSAGES_QUEUE = "/user/queue/private-messages";

let pendingAccountRefresh: {userId: number; token: string; promise: Promise<void>} | null = null;

function refreshCurrentVipUser(): Promise<void> {
    const userId = selectUser(store.getState())?.id;
    const token = getSessionToken()?.token;
    if (!userId || !token) return Promise.resolve();
    if (pendingAccountRefresh?.userId === userId && pendingAccountRefresh.token === token) {
        return pendingAccountRefresh.promise;
    }
    const promise = (async () => {
        try {
            const user = await getMe();
            if (user.id !== userId || selectUser(store.getState())?.id !== userId ||
                getSessionToken()?.token !== token) return;
            store.dispatch(setUser({user}));
        } catch {
            // A background entitlement refresh must not invalidate an otherwise usable session.
        }
    })();
    pendingAccountRefresh = {userId, token, promise};
    void promise.finally(() => {
        if (pendingAccountRefresh?.promise === promise) pendingAccountRefresh = null;
    });
    return promise;
}

export function useStompWithRedux(
    onMessage?: (topic: string, message: IMessage) => void
) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const userChatRooms = useSelector((state: RootState) =>
        state.chatRoom.joinedUserChatRooms
    );
    const user = useSelector(selectUser);
    const loadedChatRooms = useSelector((state: RootState) =>
        state.chatRoom.loadedChatRooms
    );
    const loadedPrivateRooms = useSelector((state: RootState) =>
        state.privateChat.loadedRooms
    );
    const clientRef = useRef<Client | null>(null);
    const typingCleanupRef = useRef<(() => void) | null>(null);
    const clearTypingConnection = useCallback(() => {
        typingCleanupRef.current?.();
        typingCleanupRef.current = null;
    }, []);
    const subscriptionsRef = useRef<Record<string, StompSubscription>>({});
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shownNotificationIdsRef = useRef(new Set<number>());

    const userRef = useRef(user);
    const loadedChatRoomsRef = useRef(loadedChatRooms);
    const loadedPrivateRoomsRef = useRef(loadedPrivateRooms);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // One account refresh loop lives with the app-level connection, independent
    // of badge visibility or which conversation is selected. This reads our own
    // account snapshot, without polling the billing provider.
    useEffect(() => {
        if (!user?.id || user.banned) return;
        const refresh = () => { void refreshCurrentVipUser(); };
        const refreshVisible = () => {
            if (document.visibilityState === "visible") refresh();
        };
        refresh();
        window.addEventListener("focus", refresh);
        window.addEventListener("online", refresh);
        window.addEventListener("allchat:vip-changed", refresh);
        document.addEventListener("visibilitychange", refreshVisible);
        const timer = window.setInterval(refreshVisible, 60_000);
        return () => {
            window.removeEventListener("focus", refresh);
            window.removeEventListener("online", refresh);
            window.removeEventListener("allchat:vip-changed", refresh);
            document.removeEventListener("visibilitychange", refreshVisible);
            window.clearInterval(timer);
        };
    }, [user?.id, user?.banned]);

    useEffect(() => {
        shownNotificationIdsRef.current.clear();
    }, [user?.id]);

    useEffect(() => {
        if (user) applyFontUpdate({userId: user.id, usernameFont: user.usernameFont,
            messageFont: user.messageFont, fontRevision: user.fontRevision});
        if (user?.vipBadgeVisible !== undefined) {
            applyVipBadgeUpdate({
                userId: user.id,
                vipBadgeVisible: user.vipBadgeVisible,
                vipBadgeRevision: user.vipBadgeRevision ?? 0,
            });
        }
    }, [user?.id, user?.vipBadgeVisible, user?.vipBadgeRevision, user?.usernameFont, user?.messageFont, user?.fontRevision]);

    useEffect(() => {
        loadedChatRoomsRef.current = loadedChatRooms;
    }, [loadedChatRooms]);

    useEffect(() => {
        loadedPrivateRoomsRef.current = loadedPrivateRooms;
    }, [loadedPrivateRooms]);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const {handleReportNotification} = useReportNotification();
    const {handleIdVerificationResult} = useIdVerificationNotification();

    // Memoize the message handler to prevent unnecessary recreations
    const handleWebSocketMessage = useCallback(
        (topic: string, message: IMessage) => {
            try {
                const parsedMessage: WebSocketMessage = JSON.parse(message.body);
                const {type, data} = parsedMessage;
                ingestFontSnapshots(data);
                const msg = data as Message;

                const user = userRef.current;

                switch (type) {
                    case WebSocketMessageType.NEW_MESSAGE:
                        const isByCurrentUser = msg.senderId === user?.id;

                        dispatch(handleNewMessage({message: msg, isByCurrentUser}));

                        if (isByCurrentUser) {
                            dispatch(updateLastReadMessage({updatedMessage: msg, isByCurrentUser}));
                        }
                        break;

                    case WebSocketMessageType.MESSAGE_EDIT:
                        const editedMessage = data as Message;
                        dispatch(handleEditMessage(editedMessage));
                        break;

                    case WebSocketMessageType.DELETE_MESSAGE:
                        const deletedMessage = data as Message;

                        if (user && isStaff(user.role)) {
                            dispatch(handleDeletedMessageStaffUser(deletedMessage));
                        } else {
                            dispatch(handleDeletedMessageRegularUser(deletedMessage));
                        }
                        break;

                    case WebSocketMessageType.POPULARITY_UPDATE:
                        dispatch(handlePopularityUpdate(data as RoomPopulation));
                        break;

                    case WebSocketMessageType.BAN_USER:
                        removeSessionToken();
                        disconnect();
                        dispatch(resetApp());
                        break;

                    case WebSocketMessageType.BAN_USER_CHAT_NOTIFICATION:
                        if (!user) return;
                        if (isStaff(user.role)) {
                            dispatch(handleChatRoomBanUserNotificationStaffUser(data as BanUserNotification))
                        } else {
                            dispatch(handleChatRoomBanUserNotificationRegularUser(data as BanUserNotification))
                        }
                        break;

                    case WebSocketMessageType.NOTIFICATION:
                        if (!user) return;
                        const notification = data as AppNotification;
                        dispatch(notificationReceived(notification));

                        if (notification.type === NotificationType.WARNING) {
                            toast.warning(`You have been warned!${notification.body ? ` Reason: ${notification.body}` : ""}`, {
                                duration: 8000,
                                style: {
                                    background: '#ff8c00',
                                    color: 'white',
                                    border: '1px solid #ff6600'
                                },
                                action: {
                                    label: 'Dismiss',
                                    onClick: () => {
                                    }
                                },
                            });
                        } else {
                            if (shownNotificationIdsRef.current.has(notification.id)) break;
                            shownNotificationIdsRef.current.add(notification.id);
                            // Bound session memory while suppressing repeated deliveries.
                            if (shownNotificationIdsRef.current.size > 200) {
                                const oldestId = shownNotificationIdsRef.current.values().next().value;
                                if (oldestId !== undefined) shownNotificationIdsRef.current.delete(oldestId);
                            }
                            // Notifications arrive after commit. Refresh an open
                            // purchase page even if an earlier room broadcast raced
                            // the transaction or a cancellation request had no broadcast.
                            if (notification.referenceType === "AD") {
                                dispatch(adsPortalApi.util.invalidateTags(['Ads']));
                                dispatch(adminAdsApi.util.invalidateTags(['AdminAds']));
                            } else if (notification.referenceType === "PROMOTED_MESSAGE") {
                                dispatch(promotedMessagesApi.util.invalidateTags(['PromotedMessages']));
                                dispatch(adminPromotedMessagesApi.util.invalidateTags(['AdminPromotedMessages']));
                            } else if (notification.referenceType === "ROOM_PROMOTION") {
                                dispatch(roomPromotionsApi.util.invalidateTags(['RoomPromotions']));
                                dispatch(adminRoomPromotionsApi.util.invalidateTags(['AdminRoomPromotions']));
                            }
                            const route = getNotificationRoute(notification);
                            const options = {
                                id: `notification-${notification.id}`,
                                duration: 8000,
                                description: notification.body?.trim() || undefined,
                                action: route ? {
                                    label: "View details",
                                    onClick: () => router.push(route),
                                } : undefined,
                            };

                            if ([NotificationType.AD_APPROVED, NotificationType.AD_COMPLETED,
                                NotificationType.PROMOTION_APPROVED, NotificationType.ROOM_PROMOTION_APPROVED,
                                NotificationType.MODERATOR_ACCEPTED].includes(notification.type)) {
                                toast.success(notification.title, options);
                            } else if ([NotificationType.AD_REJECTED, NotificationType.PROMOTION_DENIED,
                                NotificationType.ROOM_PROMOTION_DENIED].includes(notification.type)) {
                                toast.error(notification.title, options);
                            } else if ([NotificationType.AD_CANCELED, NotificationType.PROMOTION_CANCELED,
                                NotificationType.ROOM_PROMOTION_CANCELED].includes(notification.type)) {
                                toast.warning(notification.title, options);
                            } else {
                                toast.info(notification.title, options);
                            }
                        }
                        break;

                    case WebSocketMessageType.VIP_BADGE_UPDATED: {
                        const update = data as VipBadgeUpdate;
                        applyVipBadgeUpdate(update);
                        if (update.userId === userRef.current?.id) void refreshCurrentVipUser();
                        break;
                    }

                    case WebSocketMessageType.ROLE_UPDATE_NOTIFICATION:
                        if (!user) return;
                        const roleUpdateNotification = data as RoleUpdateNotification;

                        if (roleUpdateNotification.isPromotion) {
                            toast.success(`Your role has been updated to ${roleUpdateNotification.role}. The page will reload to apply changes.`, {
                                duration: 5000,
                                style: {
                                    background: '#4caf50',
                                    color: 'white',
                                    border: '1px solid #388e3c'
                                },
                                action: {
                                    label: 'Dismiss',
                                    onClick: () => {
                                    }
                                },
                            })
                        }

                        setTimeout(() => {
                            window.location.reload();
                        }, 5000);
                        break;

                    case WebSocketMessageType.MESSAGE_REACTION_UPDATE:
                        if (!user) return;
                        const reactionUpdate = data;
                        const reactedByCurrentUser = user.id === reactionUpdate.reactedBy.id;
                        if (reactionUpdate.responseType === 'ADD') {
                            dispatch(addMessageReaction({
                                reactionRequest: reactionUpdate,
                                reactedByCurrentUser
                            }));
                            dispatch(addPrivateMessageReaction({
                                reactionRequest: reactionUpdate,
                                reactedByCurrentUser
                            }));
                        } else {
                            dispatch(removeMessageReaction({reactionRequest: reactionUpdate, reactedByCurrentUser}));
                            dispatch(removePrivateMessageReaction({reactionRequest: reactionUpdate, reactedByCurrentUser}));
                        }
                        dispatch(updateOpenMessageReactions({reactionRequest: reactionUpdate, reactedByCurrentUser}));
                        break;

                    case WebSocketMessageType.PRIVATE_NEW_MESSAGE: {
                        const privateMsg = data as Message;
                        const isByCurrentUser = privateMsg.senderId === user?.id;
                        dispatch(handlePrivateNewMessage({
                            message: privateMsg,
                            isByCurrentUser,
                        }));
                        dispatch(handleIncomingPrivateMessageThunk({
                            message: privateMsg,
                            isByCurrentUser,
                        }));
                        break;
                    }

                    case WebSocketMessageType.PRIVATE_MESSAGE_EDIT:
                        dispatch(handlePrivateMessageEdit(data as Message));
                        break;

                    case WebSocketMessageType.PRIVATE_MESSAGE_DELETE:
                        dispatch(handlePrivateMessageDelete(data as Message));
                        break;

                    case WebSocketMessageType.REPORT_NOTIFICATION:
                        const reportNotification = data as ReportNotification;
                        handleReportNotification(reportNotification, userRef.current);
                        break;

                    case WebSocketMessageType.ID_VERIFICATION_REQUIRED:
                        // Refetch the current user so the blocking overlay appears live.
                        dispatch(fetchMe());
                        break;

                    case WebSocketMessageType.ID_VERIFICATION_RESULT: {
                        if (!user) return;
                        const idVerificationResult = data as IdVerificationResultNotification;

                        if (idVerificationResult.userId === user.id) {
                            // Refetch the current user so the overlay clears/updates.
                            dispatch(fetchMe());
                        }

                        handleIdVerificationResult(idVerificationResult, user);
                        break;
                    }

                    case WebSocketMessageType.CHATROOM_ARCHIVED:
                        if (!user) return;
                        const archivedChatRoom = data as ChatRoom;

                        if (isStaff(user.role)) {
                            dispatch(handleChatRoomArchivedStaffUser(archivedChatRoom));
                        } else {
                            dispatch(handleChatRoomArchivedRegularUser(archivedChatRoom));
                            dispatch(resolveSelectedRoomThunk());
                        }
                        break;

                    case WebSocketMessageType.CHATROOM_UNARCHIVED:
                        if (!user) return;
                        const unarchivedChatRoom = data as ChatRoom;

                        if (isStaff(user.role)) {
                            dispatch(handleChatRoomUnarchivedStaffUser(unarchivedChatRoom));
                        }
                        break;

                    case WebSocketMessageType.MESSAGE_SENDING_AVAILABILITY_UPDATE:
                        dispatch(setMessagingAvailability(data as MessagingAvailability));
                        break;

                    case WebSocketMessageType.PROMOTED_MESSAGE_UPDATE:
                        dispatch(applyPromotionUpdate(data as PromotedMessageEvent));
                        // Keep the portal RTK Query caches in sync — RTK Query only
                        // refetches queries with active subscribers, so this is cheap
                        // when no portal page is open.
                        dispatch(promotedMessagesApi.util.invalidateTags(['PromotedMessages']));
                        dispatch(adminPromotedMessagesApi.util.invalidateTags(['AdminPromotedMessages']));
                        break;

                    case WebSocketMessageType.ROOM_PROMOTION_UPDATE:
                        // The Promoted rooms list is global — bump the counter so an
                        // open Promoted tab refetches, and sync the portal caches.
                        dispatch(applyRoomPromotionUpdate(data as RoomPromotionEvent));
                        dispatch(roomPromotionsApi.util.invalidateTags(['RoomPromotions']));
                        dispatch(adminRoomPromotionsApi.util.invalidateTags(['AdminRoomPromotions']));
                        break;

                    default:
                        console.warn("[WS] Unknown message type:", type);
                }
            } catch (error) {
                console.error("[WS] Error parsing message:", error);
            }

            if (onMessageRef.current) {
                onMessageRef.current(topic, message);
            }
        },
        [dispatch, router, handleReportNotification, handleIdVerificationResult]
    );

    const disconnect = useCallback(() => {
        clearTypingConnection();
        if (clientRef.current) {
            console.log("[STOMP] Manually disconnecting");

            Object.values(subscriptionsRef.current).forEach((sub) => sub.unsubscribe());
            subscriptionsRef.current = {};

            clientRef.current.deactivate();
            clientRef.current = null;

            setIsConnected(false);
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const manageSubscriptions = useCallback((client: Client) => {
        if (!client.connected || !userRef.current) return;

        const currentTopics = Object.keys(subscriptionsRef.current);

        const targetTopics = [
            USER_TOPIC_DESTINATION + `${userRef.current?.id}`,
            ...PUBLIC_TOPIC,
            ...userChatRooms.map(room => `/topic/chat-room-id.${room.chatRoomId}`),
            ...(userRef.current?.claimed ? [PRIVATE_MESSAGES_QUEUE] : []),
        ];

        targetTopics.forEach((topic) => {
            if (!subscriptionsRef.current[topic]) {
                const sub = client.subscribe(topic, (msg) =>
                    handleWebSocketMessage(topic, msg)
                );
                subscriptionsRef.current[topic] = sub;
            }
        });

        // Unsubscribe from old topics
        currentTopics.forEach((topic) => {
            if (!targetTopics.includes(topic)) {
                subscriptionsRef.current[topic]?.unsubscribe();
                delete subscriptionsRef.current[topic];
            }
        });
    }, [userChatRooms, user?.claimed, handleWebSocketMessage]);

    const manageSubscriptionsRef = useRef(manageSubscriptions);
    useEffect(() => {
        manageSubscriptionsRef.current = manageSubscriptions;
    }, [manageSubscriptions]);

    // Initialize WebSocket connection
    const isInitialConnect = useRef(true);
    const backgroundedAtRef = useRef<number | null>(null);

    useEffect(() => {
        if (!user?.id || user?.banned) {
            return;
        }

        let disposed = false;
        let releaseTyping: (() => void) | null = null;
        const clearOwnTypingConnection = () => {
            releaseTyping?.();
            if (typingCleanupRef.current === releaseTyping) typingCleanupRef.current = null;
            releaseTyping = null;
        };
        const client = new Client({
            webSocketFactory: () => {
                const latestToken = getSessionToken();
                const dynamicUrl = latestToken
                    ? `${WS_URL}?token=${encodeURIComponent(latestToken.token)}`
                    : WS_URL;
                return new SockJS(dynamicUrl);
            },
            connectHeaders: {},
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                if (disposed) { void client.deactivate(); return; }
                console.log("[STOMP] Connected");
                clearTypingConnection();
                releaseTyping = connectTypingTransport({
                    publish: (chatRoomId, typing) => {
                        if (!client.connected) throw new Error('Socket disconnected');
                        client.publish({destination: '/app/chat.typing', body: JSON.stringify({chatRoomId, typing})});
                    },
                    subscribe: (roomId, receive) => {
                        const subscription = client.subscribe(`/topic/chat-typing.${roomId}`, message => {
                            try {
                                const event = JSON.parse(message.body);
                                if (event.type === WebSocketMessageType.TYPING_UPDATE) receive(event.data);
                            } catch { /* Typing is best-effort; malformed activity is ignored. */ }
                        });
                        return () => { if (client.connected) subscription.unsubscribe(); };
                    },
                });
                typingCleanupRef.current = releaseTyping;
                subscriptionsRef.current = {};
                // Subscribe before refreshing persisted notifications so new
                // deliveries cannot slip between the fetch and subscription.
                manageSubscriptionsRef.current(client);
                refreshRegisteredVipBadges();
                if (userRef.current?.id) void refreshCurrentVipUser();
                if (!isInitialConnect.current) {
                    dispatch(setStompReconnected(true));
                    setTimeout(() => dispatch(setStompReconnected(false)), 500);
                    // Notifications created while the socket was down were never pushed.
                    if (userRef.current?.id) {
                        dispatch(fetchUnreadCountThunk());
                        dispatch(fetchNotificationsThunk({page: 0, size: 10}));
                    }
                }
                isInitialConnect.current = false;
                setIsConnected(true);
                dispatch(fetchMessagingAvailabilityThunk());
            },
            onDisconnect: () => {
                clearOwnTypingConnection();
                if (disposed) return;
                console.log("[STOMP] Disconnected");
                setIsConnected(false);
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
                subscriptionsRef.current = {};
            },
            onStompError: (frame) => {
                clearOwnTypingConnection();
                if (disposed) return;
                console.error("[STOMP] Error:", frame);
                setIsConnected(false);
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
                subscriptionsRef.current = {};
            },
            onWebSocketClose: (event) => {
                clearOwnTypingConnection();
                if (disposed) return;
                console.log("[WS] WebSocket closed:", event);
                setIsConnected(false);
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
                subscriptionsRef.current = {};
            },
            onWebSocketError: (event) => {
                clearOwnTypingConnection();
                if (disposed) return;
                console.error("[WS] WebSocket error:", event);
                setIsConnected(false);
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
                subscriptionsRef.current = {};
            },
        });

        client.activate();
        clientRef.current = client;

        const forceReconnect = async () => {
            if (disposed) return;
            clearOwnTypingConnection();
            if (clientRef.current) {
                console.log("[STOMP] Forcing reconnect...");
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));

                try {
                    await clientRef.current.deactivate();
                } catch (error) {
                    // Ignore potential deactivate error
                }
                if (disposed) return;

                // CRITICAL FIX: deactivate() deletes all active subscriptions from the Stomp client. 
                // We must wipe our local track record so that manageSubscriptions() restores them.
                subscriptionsRef.current = {};
                setIsConnected(false);

                clientRef.current?.activate();
            }
        };

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                const backgroundedAt = backgroundedAtRef.current;
                backgroundedAtRef.current = null;

                const timeInBackground = backgroundedAt ? Date.now() - backgroundedAt : 0;
                const isClientConnected = clientRef.current?.connected;

                console.log(`[STOMP] App resumed. Time in background: ${timeInBackground}ms. Connected: ${isClientConnected}`);

                if (clientRef.current) {
                    if (!isClientConnected || timeInBackground > 10000) {
                        console.log("[STOMP] Forcing reconnect due to lost connection or long background sleep.");
                        forceReconnect();
                    }
                }
            } else {
                backgroundedAtRef.current = Date.now();
            }
        };

        const handleOnline = () => {
            console.log("[STOMP] Network online — forcing reconnect");
            // Add a small delay to ensure network interfaces are fully ready
            setTimeout(() => {
                forceReconnect();
            }, 500);
        };

        const handleOffline = () => {
            clearOwnTypingConnection();
            console.log("[STOMP] Network offline");
            setIsConnected(false);
            dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
            dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
            if (clientRef.current) {
                clientRef.current.forceDisconnect();
            }
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
        }

        return () => {
            console.log("[STOMP] Cleaning up connection");
            disposed = true;
            clearOwnTypingConnection();
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
            if (typeof window !== 'undefined') {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            }
            Object.values(subscriptionsRef.current).forEach((sub) => sub.unsubscribe());
            subscriptionsRef.current = {};
            setIsConnected(false);
            client.deactivate();
        };
    }, [user?.id, user?.banned]);

    // Manage subscriptions when rooms change or connection is established
    useEffect(() => {
        const client = clientRef.current;
        if (!client || !isConnected) {
            console.log("[STOMP] Skipping subscription management - client not ready");
            return;
        }

        manageSubscriptions(client);
    }, [userChatRooms, isConnected, manageSubscriptions]);

    const sendMessage = useCallback((destination: string, body: any) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body),
            });
        } else {
            console.warn("[STOMP] Cannot send message - client not connected");
        }
    }, []);

    const sendMessageToChatRoom = useCallback((chatRoomId: number, body: any) => {
        const destination = `/app/chat.sendMessage`;
        sendMessage(destination, {...body, chatRoomId});
    }, [sendMessage]);

    return {
        sendMessage,
        sendMessageToChatRoom,
        isConnected,
        disconnect
    };
}
