import api from "@/lib/api";
import {BanAppealRequest, BanAppealUserView, MyBanContext} from "@/models/BanAppeal";

const BAN_APPEALS_PATH = '/ban-appeals';

export const getMyBan = async (): Promise<MyBanContext> => {
    const res = await api.get<MyBanContext>(`${BAN_APPEALS_PATH}/my-ban`);
    return res.data;
};

export const submitAppeal = async (request: BanAppealRequest): Promise<BanAppealUserView> => {
    const res = await api.post<BanAppealUserView>(BAN_APPEALS_PATH, request);
    return res.data;
};

export const getMyAppeal = async (): Promise<BanAppealUserView> => {
    const res = await api.get<BanAppealUserView>(`${BAN_APPEALS_PATH}/my-appeal`);
    return res.data;
};
