import {createAsyncThunk} from "@reduxjs/toolkit";
import {LoginRequest} from "@/models/LoginRequest";
import {
    claimAccount,
    login,
    logout,
    pingServer,
    register,
    registerGuest,
    registerUnclaimed,
    resetPassword
} from "@/api/auth/authAPI";
import {ResetPasswordRequest} from "@/models/ResetPasswordRequest";
import {RegisterRequest} from "@/models/RegisterRequest";
import {UnclaimedRegister} from "@/models/UnclaimedRegister";
import {User} from "@/models/User";
import {ClaimAccountRequest} from "@/models/ClaimAccountRequest";
import {removeSessionToken, setHasAccount, setSessionToken} from "@/lib/tokenManager";
import {SessionToken} from "@/models/SessionToken";
import {AppDispatch} from "@/redux/store";
import {fetchMe} from "@/redux/user/usersThunk";
import {IpDetails} from "@/models/IpDetails";


const handleAuthSuccess = async (
    sessionToken: SessionToken,
    dispatch: AppDispatch,
    isGuest = false
): Promise<User> => {
    if (!isGuest) {
        setHasAccount(true);
    }
    setSessionToken(sessionToken);
    return await dispatch(fetchMe()).unwrap();
};

export const loginThunk = createAsyncThunk<User, LoginRequest, { dispatch: AppDispatch }>(
    'auth/login',
    async (credentials, {dispatch, rejectWithValue}) => {
        try {
            const sessionToken = await login(credentials);
            return await handleAuthSuccess(sessionToken, dispatch);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const resetPasswordThunk = createAsyncThunk<void, ResetPasswordRequest>(
    'auth/resetPassword',
    async (resetPasswordRequest, {rejectWithValue}) => {
        try {
            await resetPassword(resetPasswordRequest);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const registerThunk = createAsyncThunk<User, RegisterRequest, { dispatch: AppDispatch }>(
    'auth/register',
    async (registerData, {dispatch, rejectWithValue}) => {
        try {
            const sessionToken = await register(registerData);
            return await handleAuthSuccess(sessionToken, dispatch);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const registerGuestThunk = createAsyncThunk<User, void, { dispatch: AppDispatch }>(
    "auth/registerGuest",
    async (_, {dispatch, rejectWithValue}) => {
        try {
            const sessionToken = await registerGuest();
            return await handleAuthSuccess(sessionToken, dispatch, true);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const registerUnclaimedThunk = createAsyncThunk<User, UnclaimedRegister, { dispatch: AppDispatch }>(
    'auth/registerUnclaimed',
    async (data, {dispatch, rejectWithValue}) => {
        try {
            const sessionToken = await registerUnclaimed(data);
            return await handleAuthSuccess(sessionToken, dispatch);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const claimAccountThunk = createAsyncThunk<User, ClaimAccountRequest, { dispatch: AppDispatch }>(
    "auth/claimAccount",
    async (request, {dispatch, rejectWithValue}) => {
        try {
            const {sessionToken} = await claimAccount(request);
            return await handleAuthSuccess(sessionToken, dispatch);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const logoutThunk = createAsyncThunk<void>(
    "auth/logout",
    async (_, {rejectWithValue}) => {
        try {
            await logout();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        } finally {
            removeSessionToken()
        }
    }
);

export const pingServerThunk = createAsyncThunk<IpDetails, void, {
    state: { auth: { pingLoading: boolean; pingError: string | null; ipDetails: IpDetails | null } }
}>(
    "auth/pingServer",
    async (_, {rejectWithValue}) => {
        try {
            return await pingServer();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    },
    {
        condition: (_, {getState}) => {
            const {auth} = getState();
            // Skip if already loading, if ipDetails already exists, or if a
            // previous attempt failed this page load (retry only on reload) —
            // otherwise every mounted useIpDetails instance re-fires the ping
            // when the server is unreachable.
            if (auth.pingLoading || auth.ipDetails || auth.pingError) {
                return false;
            }
        }
    }
);
