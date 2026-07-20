import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {PaginatedResponse} from '@ads/models/ad';
import {
    BanPromotionsSummary,
    PromotedMessage,
    PromotedMessageDetail,
    PromotedMessageSearchRequest,
    PromotedRevenueDailyResponse,
    PromotedRevenueSummary,
    PromotionReasonRequest,
} from '@ads/models/promoted-message';

// Admin promoted-messages API — mirrors adminAdsApi.ts.
export const adminPromotedMessagesApi = createApi({
    reducerPath: 'adminPromotedMessagesApi',
    baseQuery: baseQuery,
    tagTypes: ['AdminPromotedMessages'],
    endpoints: (builder) => ({
        // Search promotions (default submittedAt asc — oldest first)
        searchPromotedMessages: builder.query<PaginatedResponse<PromotedMessage>, PromotedMessageSearchRequest>({
            query: (params) => ({
                url: '/admin/promoted-messages',
                method: 'GET',
                params: {
                    status: params.status,
                    email: params.email,
                    userId: params.userId,
                    page: params.page,
                    size: params.size,
                    sort: params.sort,
                },
            }),
            providesTags: ['AdminPromotedMessages'],
        }),
        // Get promotion detail (Admin)
        getPromotedMessageById: builder.query<PromotedMessageDetail, number>({
            query: (id) => ({
                url: `/admin/promoted-messages/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'AdminPromotedMessages', id}],
        }),
        // Approve a PENDING promotion (captures the payment)
        approvePromotedMessage: builder.mutation<PromotedMessageDetail, number>({
            query: (id) => ({
                url: `/admin/promoted-messages/${id}/approve`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'AdminPromotedMessages', id},
                'AdminPromotedMessages',
            ],
        }),
        // Deny a PENDING promotion (releases the hold; reason required)
        denyPromotedMessage: builder.mutation<PromotedMessageDetail, PromotionReasonRequest>({
            query: (request) => ({
                url: '/admin/promoted-messages/deny',
                method: 'POST',
                body: request,
            }),
            invalidatesTags: (result, error, request) => [
                {type: 'AdminPromotedMessages', id: request.promotionId},
                'AdminPromotedMessages',
            ],
        }),
        // Cancel a PENDING (hold released) or APPROVED (stopped, NO refund) promotion; reason required
        cancelPromotedMessage: builder.mutation<PromotedMessageDetail, PromotionReasonRequest>({
            query: (request) => ({
                url: '/admin/promoted-messages/cancel',
                method: 'POST',
                body: request,
            }),
            invalidatesTags: (result, error, request) => [
                {type: 'AdminPromotedMessages', id: request.promotionId},
                'AdminPromotedMessages',
            ],
        }),
        // Get Ban Promotions Summary (Staff) — counts + release/refund totals for the ban form
        getBanPromotionsSummary: builder.query<BanPromotionsSummary, number>({
            query: (userId) => ({
                url: `/admin/promoted-messages/ban-summary/${userId}`,
                method: 'GET',
            }),
            providesTags: ['AdminPromotedMessages'],
        }),
        // Platform promoted-revenue summary for the dashboard cards (Super Admin)
        getPromotedRevenueSummary: builder.query<PromotedRevenueSummary, void>({
            query: () => ({
                url: '/admin/promoted-messages/revenue/summary',
                method: 'GET',
            }),
            providesTags: ['AdminPromotedMessages'],
        }),
        // Daily captured promoted revenue for the dashboard chart (Super Admin)
        getPromotedRevenueDaily: builder.query<PromotedRevenueDailyResponse, { fromDate?: string } | void>({
            query: (params) => ({
                url: '/admin/promoted-messages/revenue/daily',
                method: 'GET',
                params: params ? {fromDate: params.fromDate} : undefined,
            }),
            providesTags: ['AdminPromotedMessages'],
        }),
    }),
});

export const {
    useSearchPromotedMessagesQuery,
    useGetPromotedMessageByIdQuery,
    useApprovePromotedMessageMutation,
    useDenyPromotedMessageMutation,
    useCancelPromotedMessageMutation,
    useGetBanPromotionsSummaryQuery,
    useGetPromotedRevenueSummaryQuery,
    useGetPromotedRevenueDailyQuery,
} = adminPromotedMessagesApi;
