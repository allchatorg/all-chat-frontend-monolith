import {createAsyncThunk} from "@reduxjs/toolkit";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {
    BanAppealAdminDetail,
    BanAppealAdminList,
    BanAppealRequest,
    BanAppealResolutionRequest,
    BanAppealUserView,
    MyBanContext
} from "@/models/BanAppeal";
import {getMyAppeal, getMyBan, submitAppeal} from "@/api/banAppeals/banAppealsAPI";
import {claimAppeal, getAppeal, resolveAppeal, searchAppeals, SearchAppealsRequest} from "@/api/admin/banAppealsAdminAPI";

export const getMyBanThunk = createAsyncThunk<MyBanContext, void>(
    "appeals/getMyBan",
    async (_, {rejectWithValue}) => {
        try {
            return await getMyBan();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const submitAppealThunk = createAsyncThunk<BanAppealUserView, BanAppealRequest>(
    "appeals/submitAppeal",
    async (request, {rejectWithValue}) => {
        try {
            return await submitAppeal(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getMyAppealThunk = createAsyncThunk<BanAppealUserView, void>(
    "appeals/getMyAppeal",
    async (_, {rejectWithValue}) => {
        try {
            return await getMyAppeal();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const searchAppealsThunk = createAsyncThunk<PaginatedResponse<BanAppealAdminList>, SearchAppealsRequest>(
    "appeals/searchAppeals",
    async (request, {rejectWithValue}) => {
        try {
            return await searchAppeals(request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getAppealThunk = createAsyncThunk<BanAppealAdminDetail, number>(
    "appeals/getAppeal",
    async (appealId, {rejectWithValue}) => {
        try {
            return await getAppeal(appealId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const claimAppealThunk = createAsyncThunk<BanAppealAdminDetail, number>(
    "appeals/claimAppeal",
    async (appealId, {rejectWithValue}) => {
        try {
            return await claimAppeal(appealId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const resolveAppealThunk = createAsyncThunk<
    BanAppealAdminDetail,
    { appealId: number; request: BanAppealResolutionRequest }
>(
    "appeals/resolveAppeal",
    async ({appealId, request}, {rejectWithValue}) => {
        try {
            return await resolveAppeal(appealId, request);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
