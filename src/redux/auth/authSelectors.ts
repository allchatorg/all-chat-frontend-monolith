import {RootState} from "@/redux/store";

export const selectAuthState = (state: RootState) => state.auth;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIpDetails = (state: RootState) => state.auth.ipDetails;
export const selectPingLoading = (state: RootState) => state.auth.pingLoading;
