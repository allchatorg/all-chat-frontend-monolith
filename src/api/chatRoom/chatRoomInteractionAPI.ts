import {ChatRoom} from "@/models/ChatRoom";
import {UserChatRoom} from "@/models/UserChatRoom";
import {CreateChatRoomRequest} from "@/models/CreateChatRoomRequest";
import api from "@/lib/api";
import {RoomPopulation} from "@/models/roomPopulation";
import {MessagePage} from "@/models/MessagePage";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {Message} from "@/models/message";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {ReportRequest} from "@/models/ReportRequest";
import {Reaction} from "@/models/Reaction";
import {ReactionRequest} from "@/models/ReactionRequest";

const CHAT_ROOMS_PATH = "/chat-rooms";

export const joinChatRoom = (roomId: number): Promise<UserChatRoom> =>
    api.post(`${CHAT_ROOMS_PATH}/${roomId}/join`).then(res => res.data);

export const joinRandomChatRoom = (): Promise<UserChatRoom> =>
    api.post(`${CHAT_ROOMS_PATH}/random/join`).then(res => res.data);

export const leaveChatRoom = (roomId: number): Promise<void> =>
    api.delete(`${CHAT_ROOMS_PATH}/${roomId}/leave`).then(res => res.data);

export const createAndJoinChatRoom = (data: CreateChatRoomRequest): Promise<UserChatRoom> =>
    api.post<UserChatRoom>(CHAT_ROOMS_PATH, data).then(res => res.data);

export const getAllUserChatRooms = (): Promise<UserChatRoom[]> =>
    api.get<UserChatRoom[]>(CHAT_ROOMS_PATH + '/me').then(res => res.data);

export const getChatRoomDetails = (roomId: number): Promise<ChatRoom> =>
    api.get<ChatRoom>(`${CHAT_ROOMS_PATH}/${roomId}`).then(res => res.data);

export const setActiveChatRoom = (currentRoomId: number, previousActiveRoomId?: number): Promise<RoomPopulation> =>
    api.patch<RoomPopulation>(`${CHAT_ROOMS_PATH}/${currentRoomId}/active`, null, {
        params: previousActiveRoomId ? {previousActiveRoomId} : undefined,
    }).then(res => res.data);

export const searchChatRoomsByName = (name: string): Promise<RoomPopulation[]> =>
    api.get<RoomPopulation[]>(CHAT_ROOMS_PATH, {params: {name}}).then(res => res.data);

export const getChatRoomMessages = (
    roomId: number,
    afterMessageId?: number,
    beforeMessageId?: number,
    aroundMessageId?: number
): Promise<MessagePage> =>
    api.get<MessagePage>(`${CHAT_ROOMS_PATH}/${roomId}/messages`, {
        params: {
            afterMessageId,
            beforeMessageId,
            aroundMessageId
        },
    }).then(res => res.data);

export const searchChatRoomMessages = (
    roomId: number,
    request: SearchMessageRequest
): Promise<PaginatedResponse<Message>> => api.post<PaginatedResponse<Message>>(`${CHAT_ROOMS_PATH}/${roomId}/messages/search`, {
    ...request,
    page: request.page || 0,
    size: request.size || 20,
}).then(res => res.data);

export const updateLastReadMessage = (roomId: number, messageId: number): Promise<Message> =>
    api.patch(`${CHAT_ROOMS_PATH}/${roomId}/messages/${messageId}/acknowledge`).then(res => res.data);

export const reportMessage = (request: ReportRequest): Promise<void> =>
    api.post(`${CHAT_ROOMS_PATH}/report/message`, request).then(res => res.data);

export const getReactionsByEmoji = (
    messageId: number,
    emoji: string,
    limit?: number
): Promise<Reaction> =>
    api.get<Reaction>(
        `${CHAT_ROOMS_PATH}/messages/${messageId}/reactions/${emoji}`,
        {
            params: {limit},
        }
    ).then((res) => res.data);

export const reactToMessage = (request: ReactionRequest): Promise<void> =>
    api.patch(`${CHAT_ROOMS_PATH}/message-reactions`, request).then(res => res.data);

export const deleteReaction = (request: ReactionRequest): Promise<void> =>
    api.delete(`${CHAT_ROOMS_PATH}/message-reactions`, {data: request}).then(res => res.data);

export const getTopOnlineRoomsPaginated = (
    page: number = 0,
    size: number = 10,
    popularitySort?: string,
    chatRoomNoiseLevel?: string
): Promise<PaginatedResponse<RoomPopulation>> =>
    api.get<PaginatedResponse<RoomPopulation>>(`${CHAT_ROOMS_PATH}/chatroom-leaderboard`, {
        params: {
            page,
            size,
            popularitySort,
            chatRoomNoiseLevel,
        }
    }).then(res => res.data);

export const getTopReactedMessages = (
    roomId: number,
    page: number = 0,
    size: number = 10
): Promise<PaginatedResponse<Message>> =>
    api.get<PaginatedResponse<Message>>(`${CHAT_ROOMS_PATH}/${roomId}/messages/top-reacted`, {
        params: {
            page,
            size,
        }
    }).then(res => res.data);

export const sendHeartbeat = (activeRoomId: number | null): Promise<void> =>
    api.post(`${CHAT_ROOMS_PATH}/heartbeat`, {activeRoomId}).then(res => res.data);
