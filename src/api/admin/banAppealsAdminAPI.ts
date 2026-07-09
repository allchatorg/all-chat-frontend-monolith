import api from "@/lib/api";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {
    BanAppealAdminDetail,
    BanAppealAdminList,
    BanAppealResolutionRequest,
    BanAppealStatus
} from "@/models/BanAppeal";

const ADMIN_BAN_APPEALS_PATH = '/admin/ban-appeals';

export interface SearchAppealsRequest {
    status?: BanAppealStatus;
    openOnly?: boolean;
    page: number;
    pageSize: number;
}

export const searchAppeals = async (request: SearchAppealsRequest): Promise<PaginatedResponse<BanAppealAdminList>> => {
    const res = await api.get<PaginatedResponse<BanAppealAdminList>>(ADMIN_BAN_APPEALS_PATH, {
        params: {
            status: request.status,
            openOnly: request.openOnly,
            page: request.page,
            pageSize: request.pageSize,
        }
    });
    return res.data;
};

export const getAppeal = async (appealId: number): Promise<BanAppealAdminDetail> => {
    const res = await api.get<BanAppealAdminDetail>(`${ADMIN_BAN_APPEALS_PATH}/${appealId}`);
    return res.data;
};

export const claimAppeal = async (appealId: number): Promise<BanAppealAdminDetail> => {
    const res = await api.post<BanAppealAdminDetail>(`${ADMIN_BAN_APPEALS_PATH}/${appealId}/claim`);
    return res.data;
};

export const resolveAppeal = async (
    appealId: number,
    request: BanAppealResolutionRequest
): Promise<BanAppealAdminDetail> => {
    const res = await api.post<BanAppealAdminDetail>(`${ADMIN_BAN_APPEALS_PATH}/${appealId}/resolve`, request);
    return res.data;
};
