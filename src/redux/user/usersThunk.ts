import {createAsyncThunk} from "@reduxjs/toolkit";
import {
    blockUser,
    changeUsername,
    deleteAccount,
    getBlockedUsers,
    getMe,
    requestEmailUpdate,
    sendEmailVerification,
    sendPhoneVerification,
    unblockUser,
    updateAge,
    updateBlurredContent,
    updateMarketingPreferences,
    updateUserDisplayColor,
    verifyEmail,
    verifyEmailUpdate,
    verifyPhone,
} from "@/api/user/userAPI";
import {User, UserMinimal} from "@/models/User";
import {Tag} from "@/models/Tag";
import {DeleteAccountRequest} from "@/models/DeleteAccountRequest";
import {removeSessionToken} from "@/lib/tokenManager";
import {setAuthenticated} from "@/redux/auth/authSlice";
import {updateUserMessageColor} from "../chatRoom/chatRoomSlice";
import {updatePrivateUserMessageColor} from "../privateChat/privateChatSlice";
import {UpdateColorRequest} from "@/models/UpdateColorRequest";
import {AddPhoneNumberRequest} from "@/models/AddPhoneNumberRequest";
import {UpdateTimeFormatRequest} from "@/models/UpdateTimeFormatRequest";
import {updateTimeFormat} from "@/api/settings/settingsAPI";
import {ModeratorApplicationRequest} from "@/models/ModeratorApplicationRequest";
import {RequestEmailUpdateRequest} from "@/models/RequestEmailUpdateRequest";
import {VerifyEmailUpdateRequest} from "@/models/VerifyEmailUpdateRequest";
import {UpdateMarketingPreferencesRequest} from "@/models/UpdateMarketingPreferencesRequest";

export const fetchMe = createAsyncThunk<User>(
    "user/fetchMe",
    async (_, {rejectWithValue, dispatch}) => {
        try {
            return await getMe();
        } catch (error: any) {
            dispatch(setAuthenticated(false));
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const changeUsernameThunk = createAsyncThunk<string, string>(
    "user/changeUsername",
    async (username, {rejectWithValue}) => {
        try {
            await changeUsername(username);
            return username;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const verifyEmailThunk = createAsyncThunk<User, string>(
    "user/verifyEmail",
    async (token, {rejectWithValue}) => {
        try {
            return await verifyEmail(token);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const requestEmailUpdateThunk = createAsyncThunk<void, RequestEmailUpdateRequest>(
    "user/requestEmailUpdate",
    async (request, {rejectWithValue}) => {
        try {
            await requestEmailUpdate(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const verifyEmailUpdateThunk = createAsyncThunk<User, VerifyEmailUpdateRequest>(
    "user/verifyEmailUpdate",
    async (request, {rejectWithValue}) => {
        try {
            return await verifyEmailUpdate(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateAgeThunk = createAsyncThunk<boolean, boolean>(
    "user/updateAge",
    async (isOver18, {rejectWithValue}) => {
        try {
            return await updateAge(isOver18);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateBlurredContentThunk = createAsyncThunk<Tag[], number[]>(
    "user/updateBlurredContent",
    async (tagIds, {rejectWithValue}) => {
        try {
            return await updateBlurredContent(tagIds);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteAccountThunk = createAsyncThunk<void, DeleteAccountRequest>(
    "user/deleteAccount",
    async (deleteAccountRequest, {rejectWithValue}) => {
        try {
            await deleteAccount(deleteAccountRequest)
            removeSessionToken();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateUserDisplayColorThunk = createAsyncThunk(
    "user/updateUserDisplayColor",
    async ({userId, color}: UpdateColorRequest, {dispatch, rejectWithValue}) => {
        try {
            const responseMessage = await updateUserDisplayColor(color);
            dispatch(updateUserMessageColor({userId: userId, hexColor: color}));
            dispatch(updatePrivateUserMessageColor({userId: userId, hexColor: color}));

            return responseMessage;

        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const sendPhoneVerificationThunk = createAsyncThunk<void, AddPhoneNumberRequest>(
    "user/sendPhoneVerification",
    async (request, {rejectWithValue}) => {
        try {

            await sendPhoneVerification(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const verifyPhoneThunk = createAsyncThunk<User, string>(
    "user/verifyPhone",
    async (token, {rejectWithValue}) => {
        try {
            return await verifyPhone(token);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const sendEmailVerificationThunk = createAsyncThunk<void>(
    "user/sendEmailVerification",
    async (_, {rejectWithValue}) => {
        try {
            await sendEmailVerification();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateTimeFormatThunk = createAsyncThunk(
    "user/updateTimeFormat",
    async (timeFormatRequest: UpdateTimeFormatRequest, {rejectWithValue}) => {
        try {
            await updateTimeFormat(timeFormatRequest);
            return timeFormatRequest.timeFormat;
        } catch (e: any) {
            return rejectWithValue(e.response?.data || e.message);
        }
    }
);

export const updateMarketingPreferencesThunk = createAsyncThunk<boolean, UpdateMarketingPreferencesRequest>(
    "user/updateMarketingPreferences",
    async (request, {rejectWithValue}) => {
        try {
            await updateMarketingPreferences(request);
            return request.subscribedToMarketingEmails;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchBlockedUsersThunk = createAsyncThunk<UserMinimal[]>(
    "user/fetchBlockedUsers",
    async (_, {rejectWithValue}) => {
        try {
            return await getBlockedUsers();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const unblockUserThunk = createAsyncThunk<number, number>(
    "user/unblockUser",
    async (userId, {rejectWithValue}) => {
        try {
            await unblockUser(userId);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const blockUserThunk = createAsyncThunk<UserMinimal, UserMinimal>(
    "user/blockUser",
    async (userToBlock, {rejectWithValue}) => {
        try {
            await blockUser(userToBlock.id);
            return userToBlock;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const submitModeratorApplicationThunk = createAsyncThunk<void, ModeratorApplicationRequest>(
    "user/submitModeratorApplication",
    async (request, {rejectWithValue}) => {
        try {
            await import("@/api/user/userAPI").then(m => m.submitModeratorApplication(request));
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
