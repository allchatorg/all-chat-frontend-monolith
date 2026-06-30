import {User, UserMinimal} from "@/models/User";
import api from "@/lib/api";
import {AuthenticationResponse} from "@/models/AuthenticationResponse";
import {ChangePasswordRequest} from "@/models/ChangePasswordRequest";
import {Tag} from "@/models/Tag";
import {DeleteAccountRequest} from "@/models/DeleteAccountRequest";
import {AddPhoneNumberRequest} from "@/models/AddPhoneNumberRequest";
import {RequestEmailUpdateRequest} from "@/models/RequestEmailUpdateRequest";
import {VerifyEmailUpdateRequest} from "@/models/VerifyEmailUpdateRequest";
import {UpdateMarketingPreferencesRequest} from "@/models/UpdateMarketingPreferencesRequest";

const USERS_PATH = "/users";

export const getMe = async (): Promise<User> => {
    const res = await api.get<User>(USERS_PATH + "/me");
    return res.data;
};

export const changeUsername = async (username: string): Promise<AuthenticationResponse> => {
    const res = await api.patch<AuthenticationResponse>(USERS_PATH + "/change-username", null, {
        params: {username},
    });
    return res.data;
};

export const updateAge = async (isOver18: boolean): Promise<boolean> => {
    const res = await api.patch<boolean>(USERS_PATH + `/update-age?isOver18=${isOver18}`);
    return res.data;
};

export const sendEmailVerification = async (): Promise<void> => {
    await api.post(`${USERS_PATH}/send-email-verification`, {});
};

export const verifyEmail = async (token: string): Promise<User> => {
    const res = await api.patch<User>(`${USERS_PATH}/verify`, null, {
        params: {token},
    });
    return res.data;
};

export const requestEmailUpdate = async (
    request: RequestEmailUpdateRequest
): Promise<void> => {
    await api.post<void>(`${USERS_PATH}/request-email-update`, request);
};

export const verifyEmailUpdate = async (
    request: VerifyEmailUpdateRequest
): Promise<User> => {
    const res = await api.patch<User>(`${USERS_PATH}/verify-email-update`, request);
    return res.data;
};

export const changePassword = async (
    passwordChangeRequest: ChangePasswordRequest
): Promise<void> => {

    await api.patch<void>(`${USERS_PATH}/change-password`, passwordChangeRequest);
};

export const updateBlurredContent = async (tagIds: number[]): Promise<Tag[]> => {
    const res = await api.patch<Tag[]>(`${USERS_PATH}/update-blurred-content`, tagIds);
    return res.data;
};

export const deleteAccount = async (
    deleteAccountRequest: DeleteAccountRequest
): Promise<void> => {
    await api.delete<void>(`${USERS_PATH}/delete-account`, {data: deleteAccountRequest,});
};

export const updateUserDisplayColor = async (color: string): Promise<string> => {
    const res = await api.patch<string>(
        USERS_PATH + "/update-display-color",
        null,
        {params: {color}}
    );
    return res.data;
};

export const sendPhoneVerification = async (
    request: AddPhoneNumberRequest
): Promise<void> => {
    await api.post<void>(`${USERS_PATH}/send-phone-verification`, request);
};

export const verifyPhone = async (token: string): Promise<User> => {
    const res = await api.patch<User>(`${USERS_PATH}/verify-phone`, null, {
        params: {token},
    });
    return res.data;
};

export const updateMarketingPreferences = async (
    request: UpdateMarketingPreferencesRequest
): Promise<void> => {
    await api.patch<void>(`${USERS_PATH}/marketing-preferences`, request);
};

export const unblockUser = async (userId: number): Promise<void> => {
    await api.post<void>(`${USERS_PATH}/unblock/${userId}`);
};

export const getBlockedUsers = async (): Promise<UserMinimal[]> => {
    const res = await api.get<UserMinimal[]>(`${USERS_PATH}/blocked`);
    return res.data;
};

export const blockUser = async (userId: number): Promise<void> => {
    await api.post<void>(`${USERS_PATH}/block/${userId}`);
};

export const submitModeratorApplication = async (
    request: import("@/models/ModeratorApplicationRequest").ModeratorApplicationRequest
): Promise<void> => {
    await api.post<void>(`${USERS_PATH}/moderator-application`, request);
};
