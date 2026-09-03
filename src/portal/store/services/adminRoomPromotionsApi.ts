import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {PaginatedResponse} from '@ads/models/ad';
import {PromotedRevenueDailyResponse, PromotedRevenueSummary} from '@ads/models/promoted-message';
import {
    BanRoomPromotionsSummary,
    PromotionReasonRequest,
    RoomPromotion,
    RoomPromotionDetail,
    RoomPromotionSearchRequest,
} from '@ads/models/room-promotion';

// Admin room-promotions API — mirrors adminPromotedMessagesApi.ts.
export const adminRoomPromotionsApi = createApi({
    reducerPath: 'adminRoomPromotionsApi',
    baseQuery: baseQuery,
    tagTypes: ['AdminRoomPromotions'],
    endpoints: (builder) => ({
        // Search room promotions (default submittedAt asc — oldest first)
        searchRoomPromotions: builder.query<PaginatedResponse<RoomPromotion>, RoomPromotionSearchRequest>({
            query: (params) => ({
                url: '/admin/room-promotions',
                method: 'GET',
                params: {
                    status: params.status,
                    email: params.email,
                    userId: params.userId,
                    chatRoomId: params.chatRoomId,
                    page: params.page,
                    size: params.size,
                    sort: params.sort,
                },
            }),
            providesTags: ['AdminRoomPromotions'],
        }),
        // Get promotion detail (Admin)
        getRoomPromotionById: builder.query<RoomPromotionDetail, number>({
            query: (id) => ({
                url: `/admin/room-promotions/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'AdminRoomPromotions', id}],
        }),
        // Approve a PENDING promotion (captures the payment, bumps the room to the top)
        approveRoomPromotion: builder.mutation<RoomPromotionDetail, number>({
            query: (id) => ({
                url: `/admin/room-promotions/${id}/approve`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'AdminRoomPromotions', id},
                'AdminRoomPromotions',
            ],
        }),
        // Deny a PENDING promotion (releases the hold; reason required)
        denyRoomPromotion: builder.mutation<RoomPromotionDetail, PromotionReasonRequest>({
            query: (request) => ({
                url: '/admin/room-promotions/deny',
                method: 'POST',
                body: request,
            }),
            invalidatesTags: (result, error, request) => [
                {type: 'AdminRoomPromotions', id: request.promotionId},
                'AdminRoomPromotions',
            ],
        }),
        // Cancel a PENDING (hold released) or APPROVED (stopped, NO refund) promotion; reason required
        cancelRoomPromotion: builder.mutation<RoomPromotionDetail, PromotionReasonRequest>({
            query: (request) => ({
                url: '/admin/room-promotions/cancel',
                method: 'POST',
                body: request,
            }),
            invalidatesTags: (result, error, request) => [
                {type: 'AdminRoomPromotions', id: request.promotionId},
                'AdminRoomPromotions',
            ],
        }),
        // Ban summary (Staff) — counts + release/refund totals for the ban form
        getBanRoomPromotionsSummary: builder.query<BanRoomPromotionsSummary, number>({
            query: (userId) => ({
                url: `/admin/room-promotions/ban-summary/${userId}`,
                method: 'GET',
            }),
            providesTags: ['AdminRoomPromotions'],
        }),
        // Platform room-promotion revenue summary for the dashboard cards (Super Admin)
        getRoomPromotedRevenueSummary: builder.query<PromotedRevenueSummary, void>({
            query: () => ({
                url: '/admin/room-promotions/revenue/summary',
                method: 'GET',
            }),
            providesTags: ['AdminRoomPromotions'],
        }),
        // Daily captured room-promotion revenue for the dashboard chart (Super Admin)
        getRoomPromotedRevenueDaily: builder.query<PromotedRevenueDailyResponse, { fromDate?: string } | void>({
            query: (params) => ({
                url: '/admin/room-promotions/revenue/daily',
                method: 'GET',
                params: params ? {fromDate: params.fromDate} : undefined,
            }),
            providesTags: ['AdminRoomPromotions'],
        }),
    }),
});

export const {
    useSearchRoomPromotionsQuery,
    useGetRoomPromotionByIdQuery,
    useApproveRoomPromotionMutation,
    useDenyRoomPromotionMutation,
    useCancelRoomPromotionMutation,
    useGetBanRoomPromotionsSummaryQuery,
    useGetRoomPromotedRevenueSummaryQuery,
    useGetRoomPromotedRevenueDailyQuery,
} = adminRoomPromotionsApi;
