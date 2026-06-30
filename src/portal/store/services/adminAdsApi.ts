import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {
    Ad,
    AdSearchRequest,
    AdStatusCount,
    MonthlyRevenueResponseDto,
    PaginatedResponse,
    PurchasedAdsDailyCountDto,
    RevenueDto,
    WeeklyRevenueResponseDto
} from '@ads/models/ad';
import {AdStatusDetails} from '@ads/models/ad-status-details';

// Request DTO for ad rejection
export interface AdRejectionRequest {
    adId: number;
    rejectionReason: string;
}

// Admin-specific ads API service
export const adminAdsApi = createApi({
    reducerPath: 'adminAdsApi',
    baseQuery: baseQuery,
    tagTypes: ['AdminAds'],
    endpoints: (builder) => ({
        // Search Ads (Admin)
        searchAds: builder.query<PaginatedResponse<Ad>, AdSearchRequest>({
            query: (params) => ({
                url: '/admin/ads',
                method: 'GET',
                params: {
                    status: params.status,
                    types: params.types,
                    page: params.page,
                    size: params.size,
                    sort: params.sort,
                    userId: params.userId,
                    email: params.email,
                    approvedAtStart: params.approvedAtStart,
                    approvedAtEnd: params.approvedAtEnd,
                },
            }),
            providesTags: ['AdminAds'],
        }),
        // Get Ad Status Counts (Admin)
        getAdStatusCounts: builder.query<AdStatusCount[], void>({
            query: () => ({
                url: '/admin/ads/status-counts',
                method: 'GET',
            }),
            providesTags: ['AdminAds'],
        }),
        // Get Ad Status Counts By User ID (Admin)
        getAdStatusCountsByUserId: builder.query<AdStatusCount[], number>({
            query: (userId) => ({
                url: `/admin/ads/status-counts/${userId}`,
                method: 'GET',
            }),
            providesTags: ['AdminAds'],
        }),
        // Get Purchased Ads Daily Counts (Admin)
        getPurchasedAdsCounts: builder.query<PurchasedAdsDailyCountDto, { fromDate?: string } | void>({
            query: (params) => ({
                url: '/admin/ads/purchased-counts',
                method: 'GET',
                params: params ? {fromDate: params.fromDate} : undefined,
            }),
            providesTags: ['AdminAds'],
        }),
        // Get Daily Revenue
        getDailyRevenue: builder.query<RevenueDto, void>({
            query: () => ({
                url: '/admin/ads/revenue/daily-summary',
                method: 'GET',
            }),
            providesTags: ['AdminAds'],
        }),
        // Get Monthly Revenue
        getMonthlyRevenue: builder.query<MonthlyRevenueResponseDto, void>({
            query: () => ({
                url: '/admin/ads/revenue/monthly',
                method: 'GET',
            }),
            providesTags: ['AdminAds'],
        }),
        // Get Weekly Revenue
        getWeeklyRevenue: builder.query<WeeklyRevenueResponseDto, void>({
            query: () => ({
                url: '/admin/ads/revenue/weekly',
                method: 'GET',
            }),
            providesTags: ['AdminAds'],
        }),
        // Get Ad By ID (Admin)
        getAdById: builder.query<AdStatusDetails, number>({
            query: (id) => ({
                url: `/admin/ads/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'AdminAds', id}],
        }),
        // Reject Ad (Admin)
        rejectAd: builder.mutation<AdStatusDetails, AdRejectionRequest>({
            query: (request) => ({
                url: '/admin/ads/reject',
                method: 'POST',
                body: request,
            }),
            // Invalidate cache to refetch the ad details after rejection
            invalidatesTags: (result, error, request) => [
                {type: 'AdminAds', id: request.adId},
                'AdminAds',
            ],
        }),
        // Approve Ad (Admin)
        approveAd: builder.mutation<AdStatusDetails, number>({
            query: (id) => ({
                url: `/admin/ads/approve/${id}`,
                method: 'POST',
            }),
            // Invalidate cache to refetch the ad details after approval
            invalidatesTags: (result, error, id) => [
                {type: 'AdminAds', id},
                'AdminAds',
            ],
        }),
    }),
});

// Export hooks for usage in functional components
export const {
    useSearchAdsQuery,
    useLazySearchAdsQuery,
    useGetAdStatusCountsQuery,
    useGetAdStatusCountsByUserIdQuery,
    useGetPurchasedAdsCountsQuery,
    useGetDailyRevenueQuery,
    useGetMonthlyRevenueQuery,
    useGetWeeklyRevenueQuery,
    useGetAdByIdQuery,
    useRejectAdMutation,
    useApproveAdMutation,
} = adminAdsApi;
