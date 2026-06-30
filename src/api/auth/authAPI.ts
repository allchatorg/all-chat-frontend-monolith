import {LoginRequest} from "@/models/LoginRequest";
import {RegisterRequest} from "@/models/RegisterRequest";
import {UnclaimedRegister} from "@/models/UnclaimedRegister";
import {ForgotPasswordRequest} from "@/models/ForgotPasswordRequest";
import {ResetPasswordRequest} from "@/models/ResetPasswordRequest";
import api from "@/lib/api";
import {SessionToken} from "@/models/SessionToken";
import {ClaimAccountRequest} from "@/models/ClaimAccountRequest";
import {ClaimAccountResponse} from "@/models/ClaimAccountResponse";
import {IpDetails} from "@/models/IpDetails";
import {PhonePasswordResetVerificationRequest} from "@/models/PhonePasswordResetVerificationRequest";
import {PhonePasswordResetVerificationResponse} from "@/models/PhonePasswordResetVerificationResponse";

const AUTH_PATH = "/auth";


export const claimAccount = async (
    request: ClaimAccountRequest
): Promise<ClaimAccountResponse> => {
    const res = await api.patch<ClaimAccountResponse>(`${AUTH_PATH}/claim-account`, request);
    return res.data;
};

export const register = async (data: RegisterRequest): Promise<SessionToken> => {
    const res = await api.post<SessionToken>(`${AUTH_PATH}/register`, data);
    return res.data;
};

export const registerGuest = async () => {
    const res = await api.post<SessionToken>(`${AUTH_PATH}/register-guest`, {});
    return res.data;
}

export const registerUnclaimed = async (data: UnclaimedRegister): Promise<SessionToken> => {
    const res = await api.post<SessionToken>(`${AUTH_PATH}/register-unclaimed`, data);
    return res.data;
};

export const login = async (data: LoginRequest): Promise<SessionToken> => {
    const res = await api.post<SessionToken>(`${AUTH_PATH}/login`, data);
    return res.data;
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post(`${AUTH_PATH}/forgot-password`, data);
};

export const verifyPhonePasswordReset = async (
    data: PhonePasswordResetVerificationRequest
): Promise<PhonePasswordResetVerificationResponse> => {
    const res = await api.post<PhonePasswordResetVerificationResponse>(
        `${AUTH_PATH}/forgot-password/verify-phone-code`,
        data
    );
    return res.data;
};

export const resetPassword = async (
    resetPasswordRequest: ResetPasswordRequest
): Promise<SessionToken> => {
    const res = await api.post<SessionToken>(`${AUTH_PATH}/reset-password`, resetPasswordRequest);
    return res.data;
};

export const logout = async (): Promise<void> => {
    await api.post(`${AUTH_PATH}/logout`, {});
};

export const pingServer = async (): Promise<IpDetails> => {
    const res = await api.get<IpDetails>(`${AUTH_PATH}/ping`);
    return res.data;
};
