import {createSlice} from "@reduxjs/toolkit";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {BanAppealAdminDetail, BanAppealAdminList, BanAppealUserView, MyBanContext} from "@/models/BanAppeal";
import {createEmptyPaginatedResponse} from "@/lib/utils";
import {
    claimAppealThunk,
    getAppealThunk,
    getMyAppealThunk,
    getMyBanThunk,
    resolveAppealThunk,
    searchAppealsThunk,
    submitAppealThunk
} from "@/redux/appeals/appealsThunk";

interface AppealsState {
    myBanContext: MyBanContext | null;
    myAppeal: BanAppealUserView | null;
    appeals: PaginatedResponse<BanAppealAdminList>;
    selectedAppeal: BanAppealAdminDetail | null;
}

const initialState: AppealsState = {
    myBanContext: null,
    myAppeal: null,
    appeals: createEmptyPaginatedResponse<BanAppealAdminList>(),
    selectedAppeal: null,
}

const appealsSlice = createSlice({
    name: 'appeals',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMyBanThunk.fulfilled, (state, action) => {
                state.myBanContext = action.payload;
                state.myAppeal = action.payload.appeal;
            })
            .addCase(submitAppealThunk.fulfilled, (state, action) => {
                state.myAppeal = action.payload;
                if (state.myBanContext) {
                    state.myBanContext = {...state.myBanContext, appealable: false, appeal: action.payload};
                }
            })
            .addCase(getMyAppealThunk.fulfilled, (state, action) => {
                state.myAppeal = action.payload;
            })
            .addCase(searchAppealsThunk.fulfilled, (state, action) => {
                state.appeals = action.payload;
            })
            .addCase(getAppealThunk.fulfilled, (state, action) => {
                state.selectedAppeal = action.payload;
            })
            .addCase(claimAppealThunk.fulfilled, (state, action) => {
                state.selectedAppeal = action.payload;
            })
            .addCase(resolveAppealThunk.fulfilled, (state, action) => {
                state.selectedAppeal = action.payload;
            });
    }
})

export const appealsReducer = appealsSlice.reducer;
