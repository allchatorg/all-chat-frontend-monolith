import api from "@/lib/api";
import {User} from "@/models/User";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {Message} from "@/models/message";
import {BanRequest} from "@/models/BanRequest";
import {Ban} from "@/models/Ban";
import {UserSearchRequest} from "@/models/UserSearchRequest";
import {UserAdminView} from "@/models/UserAdminView";
import {SearchAuditLogsRequest} from "@/models/SearchAuditLogsRequest";
import {AuditLogUnion} from "@/models/AuditLog";

const ADMIN_PATH = '/admin';

export const getUserAdminDetails = async (userId: number): Promise<User> => {
    const res = await api.get<User>(`${ADMIN_PATH}/users/${userId}`);
    return res.data;
};

export const getUserMessages = async (searchChatRoomMessagesRequest: SearchMessageRequest): Promise<PaginatedResponse<Message>> => {
    const res = await api.post<PaginatedResponse<Message>>(`${ADMIN_PATH}/user-messages`, searchChatRoomMessagesRequest);
    return res.data;
}

export const banUser = async (banRequest: BanRequest): Promise<void> => {
    await api.post(`${ADMIN_PATH}/bans`, banRequest);
};

export const revokeBan = async (userId: number): Promise<void> => {
    await api.delete(`${ADMIN_PATH}/bans/${userId}`);
};

export const warnUser = async (warnRequest: WarnUserRequest): Promise<void> => {
    await api.post(`${ADMIN_PATH}/warnings`, warnRequest);
};

export const searchActiveBans = async (
    userNameOrId: string | undefined,
    page: number,
    pageSize: number
): Promise<PaginatedResponse<Ban>> => {
    const params: Record<string, any> = {page, pageSize};
    if (userNameOrId) params.userNameOrId = userNameOrId;

    const res = await api.get(`${ADMIN_PATH}/bans`, {params});
    return res.data;
};

export const searchUsers = async (request: UserSearchRequest
): Promise<PaginatedResponse<User>> => {
    const res = await api.post<PaginatedResponse<User>>(
        `${ADMIN_PATH}/users`,
        request
    );
    return res.data;
};

export const updateUserRole = async (userId: number, role: string): Promise<void> => {
    await api.put(`${ADMIN_PATH}/users/role`, {userId, role});
};

export const getUserAdminViewDetails = async (userId: number): Promise<UserAdminView> => {
    const res = await api.get<UserAdminView>(`${ADMIN_PATH}/users/${userId}/details`);
    return res.data;
}

export const getAuditLogs = async (request: SearchAuditLogsRequest
): Promise<PaginatedResponse<AuditLogUnion>> => {
    const res = await api.get<PaginatedResponse<AuditLogUnion>>(
        `${ADMIN_PATH}/audit-logs`,
        {params: request}
    );
    return res.data;
}

export const archiveChatRoom = async (roomId: number): Promise<void> => {
    await api.put(`${ADMIN_PATH}/chat-rooms/${roomId}/archive`);
};

export const unarchiveChatRoom = async (roomId: number): Promise<void> => {
    await api.put(`${ADMIN_PATH}/chat-rooms/${roomId}/unarchive`);
};
