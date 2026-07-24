import api from "@/lib/api";
import {IdVerificationStatus} from "@/models/IdVerificationStatus";

const ID_VERIFICATION_PATH = '/id-verification';

export interface CreateVerificationSessionResponse {
    clientSecret: string;
}

export interface IdVerificationStatusResponse {
    status: IdVerificationStatus;
}

export const createVerificationSession = async (): Promise<CreateVerificationSessionResponse> => {
    const res = await api.post<CreateVerificationSessionResponse>(`${ID_VERIFICATION_PATH}/session`);
    return res.data;
};

export const getIdVerificationStatus = async (): Promise<IdVerificationStatusResponse> => {
    const res = await api.get<IdVerificationStatusResponse>(`${ID_VERIFICATION_PATH}/status`);
    return res.data;
};
