import api from "@/lib/api";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import {UserMinimalDTO} from "@/models/UserMinimalDTO";
import {PaginatedResponse} from "@/models/PaginatedResponse";

const PRIVATE_CHATS_PATH = "/private-chats";
const USERS_PATH = "/users";

export const listPrivateChats = (): Promise<PrivateChatDTO[]> =>
    api.get<PrivateChatDTO[]>(PRIVATE_CHATS_PATH).then(res => res.data);

export const openOrCreatePrivateChat = (otherUserId: number): Promise<PrivateChatDTO> =>
    api.post<PrivateChatDTO>(PRIVATE_CHATS_PATH, {otherUserId}).then(res => res.data);

export const openPrivateChat = (roomId: number): Promise<PrivateChatDTO> =>
    api.get<PrivateChatDTO>(`${PRIVATE_CHATS_PATH}/${roomId}`).then(res => res.data);

export const hidePrivateChat = (roomId: number): Promise<void> =>
    api.delete(`${PRIVATE_CHATS_PATH}/${roomId}`).then(res => res.data);

export const searchUsers = (
    q: string,
    page: number = 0,
    size: number = 20
): Promise<PaginatedResponse<UserMinimalDTO>> =>
    api.get<PaginatedResponse<UserMinimalDTO>>(`${USERS_PATH}/search`, {
        params: {q, page, size},
    }).then(res => res.data);
