import {createApi} from '@reduxjs/toolkit/query/react';
import {chatBaseQuery} from './baseQuery';

// Role enum matching backend
export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

// Define the User type based on the backend structure. Account/auth is now owned
// by chat; this is the portal-facing shape, mapped from chat's UserDTO.
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    phoneNumber?: string | null;
    phoneNumberVerificationDate?: string | null;
    subscribedToMarketingEmails: boolean;
    role: Role;
}

// Chat UserDTO (the /api/v1/users/me response shape we care about here).
interface ChatUserDTO {
    id: number;
    username: string;
    email: string;
    phoneNumber?: string | null;
    phoneNumberVerificationDate?: string | null;
    verified?: boolean;
    subscribedToMarketingEmails?: boolean;
}

// Generic message response
export interface MessageResponse {
    message: string;
}

// Verify email request (token is the 6-digit/verification code)
export interface VerifyEmailRequest {
    token: string;
}

export interface SendPhoneVerificationRequest {
    phoneNumber: string;
}

export interface VerifyPhoneRequest {
    verificationCode: string;
}

// Change password request
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Request email update
export interface RequestEmailUpdateRequest {
    currentPassword: string;
    newEmail: string;
}

// Verify email update
export interface VerifyEmailUpdateRequest {
    verificationCode: string; // 6 digits
}

// Email update verification response
export interface EmailUpdateResponse {
    message: string;
    newEmail: string;
}

// Update marketing preferences request
export interface UpdateMarketingPreferencesRequest {
    subscribedToMarketingEmails: boolean;
}

// Account/auth service, unified onto chat's /api/v1/auth/** and /api/v1/users/**.
export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: chatBaseQuery,
    tagTypes: ['User', 'Auth'],
    endpoints: (builder) => ({
        // Current user — chat GET /users/me (UserDTO). Map to the portal User shape.
        getCurrentUser: builder.query<User, void>({
            query: () => '/users/me',
            transformResponse: (dto: ChatUserDTO): User => ({
                id: dto.id,
                firstName: dto.username ?? '',
                lastName: '',
                email: dto.email,
                emailVerified: Boolean(dto.verified),
                phoneNumber: dto.phoneNumber ?? null,
                phoneNumberVerificationDate: dto.phoneNumberVerificationDate ?? null,
                subscribedToMarketingEmails: Boolean(dto.subscribedToMarketingEmails),
                role: Role.USER,
            }),
            providesTags: ['User'],
        }),

        // Send verification email — chat POST /users/send-email-verification
        sendVerificationEmail: builder.mutation<void, void>({
            query: () => ({
                url: '/users/send-email-verification',
                method: 'POST',
            }),
        }),

        // Verify email with token — chat PATCH /users/verify?token=...
        verifyEmail: builder.mutation<unknown, VerifyEmailRequest>({
            query: ({token}) => ({
                url: '/users/verify',
                method: 'PATCH',
                params: {token},
            }),
            invalidatesTags: ['User'],
        }),

        // Send phone verification code — chat POST /users/send-phone-verification
        sendPhoneVerification: builder.mutation<void, SendPhoneVerificationRequest>({
            query: (data) => ({
                url: '/users/send-phone-verification',
                method: 'POST',
                body: data,
            }),
        }),

        // Verify phone code — chat PATCH /users/verify-phone?token=<code>
        verifyPhone: builder.mutation<unknown, VerifyPhoneRequest>({
            query: ({verificationCode}) => ({
                url: '/users/verify-phone',
                method: 'PATCH',
                params: {token: verificationCode},
            }),
            invalidatesTags: ['User'],
        }),

        // Change password — chat PATCH /users/change-password
        changePassword: builder.mutation<void, ChangePasswordRequest>({
            query: ({currentPassword, newPassword}) => ({
                url: '/users/change-password',
                method: 'PATCH',
                body: {currentPassword, newPassword},
            }),
        }),

        // Request email update — chat POST /users/request-email-update
        requestEmailUpdate: builder.mutation<MessageResponse, RequestEmailUpdateRequest>({
            query: (data) => ({
                url: '/users/request-email-update',
                method: 'POST',
                body: data,
            }),
        }),

        // Verify email update — chat PATCH /users/verify-email-update
        verifyEmailUpdate: builder.mutation<EmailUpdateResponse, VerifyEmailUpdateRequest>({
            query: (data) => ({
                url: '/users/verify-email-update',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        // Update marketing preferences — chat PATCH /users/marketing-preferences
        updateMarketingPreferences: builder.mutation<void, UpdateMarketingPreferencesRequest>({
            query: (data) => ({
                url: '/users/marketing-preferences',
                method: 'PATCH',
                body: {subscribedToMarketingEmails: data.subscribedToMarketingEmails},
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

// Export hooks for usage in functional components.
export const {
    useGetCurrentUserQuery,
    useSendVerificationEmailMutation,
    useVerifyEmailMutation,
    useSendPhoneVerificationMutation,
    useVerifyPhoneMutation,
    useChangePasswordMutation,
    useRequestEmailUpdateMutation,
    useVerifyEmailUpdateMutation,
    useUpdateMarketingPreferencesMutation,
} = userApi;
