import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {CreateAdRequest} from '@ads/utils/pricing-utils';
import {
    Ad,
    AdDailyStatsResponse,
    AdSearchRequest,
    AdStatus,
    AdStatusCount,
    PaginatedResponse,
    ServeAdRequest,
    ServedAd,
    UserAdViewsDailyBreakdownDto,
    UserAdViewsSummary
} from '@ads/models/ad';
import {AdStatusDetails} from '@ads/models/ad-status-details';

// Returned by POST /ads — the created ad plus the (authorized) payment receipt,
// so the UI can render a real confirmation instead of a blind success toast.
export interface CreateAdReceipt {
    id: number;
    amountPaid: number;
    currency: string;
    status: string; // AUTHORIZED / CAPTURED
    cardBrand?: string;
    cardLast4?: string;
}

export interface CreateAdResponse {
    adId: number;
    title: string;
    status: AdStatus;
    submittedAt: string;
    receipt: CreateAdReceipt | null;
}

// Define the service using a base URL and expected endpoints
export const adsApi = createApi({
    reducerPath: 'adsApi',
    baseQuery: baseQuery,
    tagTypes: ['Ads'],
    endpoints: (builder) => ({
        // Create Ad
        createAd: builder.mutation<CreateAdResponse, CreateAdRequest>({
            query: (data) => ({
                url: '/ads',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Ads'],
        }),
        // Search Ads
        searchAds: builder.query<PaginatedResponse<Ad>, AdSearchRequest>({
            query: (params) => ({
                url: '/ads',
                method: 'GET',
                params: {
                    status: params.status,
                    types: params.types, // Arrays might need special handling depending on backend (e.g. types=A&types=B or types=A,B)
                    page: params.page,
                    size: params.size,
                    sort: params.sort,
                    userId: params.userId,
                    email: params.email
                },
            }),
            providesTags: ['Ads'],
        }),
        // Get Ad Status Counts By User (Regular users - their own ads only)
        getAdStatusCountsByUser: builder.query<AdStatusCount[], void>({
            query: () => ({
                url: '/ads/status-counts-by-user',
                method: 'GET',
            }),
            providesTags: ['Ads'],
        }),
        // Get Ad By ID
        getAdById: builder.query<AdStatusDetails, number>({
            query: (id) => ({
                url: `/ads/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'Ads', id}],
        }),
        // Serve Ad
        serveAd: builder.mutation<ServedAd, ServeAdRequest>({
            query: (data) => ({
                url: '/ads/serve',
                method: 'POST',
                body: data,
            }),
        }),
        // Get Ad Daily Stats
        getAdDailyStats: builder.query<AdDailyStatsResponse, { id: number, fromDate?: string }>({
            query: ({id, fromDate}) => ({
                url: `/ads/${id}/daily-stats`,
                method: 'GET',
                params: {fromDate},
            }),
            providesTags: (result, error, {id}) => [{type: 'Ads', id}],
        }),
        // Get User's Aggregated Views/Clicks Summary
        getUserAdViewsSummary: builder.query<UserAdViewsSummary, void>({
            query: () => ({
                url: '/ads/my-stats/summary',
                method: 'GET',
            }),
            providesTags: ['Ads'],
        }),
        // Get User's Aggregated Daily Views
        getUserAdViewsDailyBreakdown: builder.query<UserAdViewsDailyBreakdownDto, { fromDate?: string } | void>({
            query: (params) => ({
                url: '/ads/my-stats/daily',
                method: 'GET',
                params: params ? {fromDate: params.fromDate} : undefined,
            }),
            providesTags: ['Ads'],
        }),
    }),
});

// Export hooks for usage in functional components
export const {
    useCreateAdMutation,
    useSearchAdsQuery,
    useGetAdStatusCountsByUserQuery,
    useGetAdByIdQuery,
    useServeAdMutation,
    useGetAdDailyStatsQuery,
    useGetUserAdViewsSummaryQuery,
    useGetUserAdViewsDailyBreakdownQuery,
} = adsApi;
