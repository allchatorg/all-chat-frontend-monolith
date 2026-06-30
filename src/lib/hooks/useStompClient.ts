import {useCallback, useEffect, useRef, useState} from "react";
import {ReportNotification} from "@/models/ReportNotification";
import {useDispatch, useSelector} from "react-redux";
import {useReportNotification} from "@/lib/hooks/useReportNotification";
import SockJS from "sockjs-client";
import {Client, IMessage, StompSubscription} from "@stomp/stompjs";
import {AppDispatch, resetApp, RootState} from "@/redux/store";
import {getSessionToken, removeSessionToken} from "@/lib/tokenManager";
import {
    addMessageReaction,
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
import {markChatRoomsAsStale, setStompReconnected} from "@/redux/chatRoom/chatRoomUiSlice";
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

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";
const PUBLIC_TOPIC = ["/topic/public-chat"];
const USER_TOPIC_DESTINATION = "/topic/user.";
const PRIVATE_MESSAGES_QUEUE = "/user/queue/private-messages";

interface WarnUserResponse {
    description: string;
}

export function useStompWithRedux(
    onMessage?: (topic: string, message: IMessage) => void
) {
    const dispatch = useDispatch<AppDispatch>();
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
    const subscriptionsRef = useRef<Record<string, StompSubscription>>({});
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const userRef = useRef(user);
    const loadedChatRoomsRef = useRef(loadedChatRooms);
    const loadedPrivateRoomsRef = useRef(loadedPrivateRooms);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

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

    // Memoize the message handler to prevent unnecessary recreations
    const handleWebSocketMessage = useCallback(
        (topic: string, message: IMessage) => {
            try {
                const parsedMessage: WebSocketMessage = JSON.parse(message.body);
                const {type, data} = parsedMessage;
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

                    case WebSocketMessageType.WARN_USER:
                        if (!user) return;
                        const warnUserResponse = data as WarnUserResponse;
                        toast.warning(`You have been warned! Reason: ${warnUserResponse.description}`, {
                            duration: Infinity,
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
                        break;

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
                            dispatch(removeMessageReaction(reactionUpdate));
                            dispatch(removePrivateMessageReaction(reactionUpdate));
                        }
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
        [dispatch, handleReportNotification]
    );

    const disconnect = useCallback(() => {
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
            ...userChatRooms.map(room => `/topic/chat-room.${room.chatRoomName}`),
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

    // Initialize WebSocket connection
    const isInitialConnect = useRef(true);
    const backgroundedAtRef = useRef<number | null>(null);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

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
                console.log("[STOMP] Connected");
                subscriptionsRef.current = {};
                if (!isInitialConnect.current) {
                    dispatch(setStompReconnected(true));
                    setTimeout(() => dispatch(setStompReconnected(false)), 500);
                }
                isInitialConnect.current = false;
                setIsConnected(true);
                dispatch(fetchMessagingAvailabilityThunk());
            },
            onDisconnect: () => {
                console.log("[STOMP] Disconnected");
                setIsConnected(false);
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
                subscriptionsRef.current = {};
            },
            onStompError: (frame) => {
                console.error("[STOMP] Error:", frame);
                setIsConnected(false);
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
                subscriptionsRef.current = {};
            },
            onWebSocketClose: (event) => {
                console.log("[WS] WebSocket closed:", event);
                setIsConnected(false);
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));
                subscriptionsRef.current = {};
            },
            onWebSocketError: (event) => {
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
            if (clientRef.current) {
                console.log("[STOMP] Forcing reconnect...");
                dispatch(markChatRoomsAsStale(loadedChatRoomsRef.current.map(r => r.id)));
                dispatch(markPrivateRoomsAsStale(loadedPrivateRoomsRef.current.map(r => r.id)));

                try {
                    await clientRef.current.deactivate();
                } catch (error) {
                    // Ignore potential deactivate error
                }

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
    }, [user?.id]);

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

    const sendMessageToChatRoom = useCallback((chatRoomName: string, body: any) => {
        const destination = `/app/chat.sendMessage`;
        sendMessage(destination, {...body, chatRoomName});
    }, [sendMessage]);

    return {
        sendMessage,
        sendMessageToChatRoom,
        isConnected,
        disconnect
    };
}
