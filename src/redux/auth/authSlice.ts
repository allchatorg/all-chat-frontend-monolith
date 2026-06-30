import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    loginThunk,
    logoutThunk,
    pingServerThunk,
    registerGuestThunk,
    registerThunk,
    registerUnclaimedThunk,
    resetPasswordThunk
} from "@/redux/auth/authThunk";
import {SessionToken} from "@/models/SessionToken";
import {IpDetails} from "@/models/IpDetails";

interface AuthState {
    isAuthenticated: boolean | null;
    loading: boolean;
    pingLoading: boolean;
    ipDetails: IpDetails | null;
    error: string | null;
    sessionToken: SessionToken | null;
}

const initialState: AuthState = {
    isAuthenticated: null,
    ipDetails: null,
    loading: false,
    pingLoading: false,
    error: null,
    sessionToken: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })

            .addCase(logoutThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(resetPasswordThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPasswordThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(resetPasswordThunk.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            .addCase(registerGuestThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerGuestThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerGuestThunk.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            .addCase(registerUnclaimedThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUnclaimedThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUnclaimedThunk.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            .addCase(pingServerThunk.pending, (state) => {
                state.pingLoading = true;
            })
            .addCase(pingServerThunk.fulfilled, (state, action) => {
                state.pingLoading = false;
                state.ipDetails = action.payload;
            })
            .addCase(pingServerThunk.rejected, (state) => {
                state.pingLoading = false;
            })
    }

});

export const {
    setLoading,
    setError,
    setAuthenticated,
    clearError,
} = authSlice.actions;

export default authSlice.reducer;