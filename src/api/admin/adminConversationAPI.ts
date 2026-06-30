import api from "@/lib/api";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {AdminConversationDTO} from "@/models/AdminConversationDTO";
import {MessagePage} from "@/models/MessagePage";
import {Message} from "@/models/message";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";

const ADMIN_PATH = '/admin';

export const getUserConversations = async (
    userId: number,
    search: string | undefined,
    page: number,
    pageSize: number,
): Promise<PaginatedResponse<AdminConversationDTO>> => {
    const params: Record<string, any> = {page, pageSize};
    if (search && search.trim().length > 0) {
        params.search = search.trim();
    }
    const res = await api.get<PaginatedResponse<AdminConversationDTO>>(
        `${ADMIN_PATH}/users/${userId}/conversations`,
        {params},
    );
    return res.data;
};

export const getObserverConversationMessages = async (
    userId: number,
    roomId: number,
    afterMessageId?: number,
    beforeMessageId?: number,
    aroundMessageId?: number,
): Promise<MessagePage> => {
    const res = await api.get<MessagePage>(
        `${ADMIN_PATH}/users/${userId}/conversations/${roomId}/messages`,
        {params: {afterMessageId, beforeMessageId, aroundMessageId}},
    );
    return res.data;
};

export const deleteObserverMessage = async (
    userId: number,
    roomId: number,
    messageId: number,
): Promise<void> => {
    await api.delete(`${ADMIN_PATH}/users/${userId}/conversations/${roomId}/messages/${messageId}`);
};

export const searchObserverConversationMessages = async (
    userId: number,
    request: SearchMessageRequest,
): Promise<PaginatedResponse<Message>> => {
    const res = await api.post<PaginatedResponse<Message>>(
        `${ADMIN_PATH}/users/${userId}/conversations/messages/search`,
        request,
    );
    return res.data;
};
