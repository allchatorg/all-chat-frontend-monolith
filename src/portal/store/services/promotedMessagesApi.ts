import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {PaginatedResponse} from '@ads/models/ad';
import {
    MyPromotedMessagesRequest,
    PromotedMessage,
    PromotedMessageDetail,
    PromoteMessageRequest,
    PromotionSpendSummary,
} from '@ads/models/promoted-message';

// User-facing promoted-messages API — mirrors adsApi.ts.
export const promotedMessagesApi = createApi({
    reducerPath: 'promotedMessagesApi',
    baseQuery: baseQuery,
    tagTypes: ['PromotedMessages'],
    endpoints: (builder) => ({
        // Promote a message ($0.50 hold until admin review)
        promoteMessage: builder.mutation<PromotedMessageDetail, PromoteMessageRequest>({
            query: (data) => ({
                url: '/promoted-messages',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PromotedMessages'],
        }),
        // List the current user's promotions (default submittedAt desc)
        getMyPromotedMessages: builder.query<PaginatedResponse<PromotedMessage>, MyPromotedMessagesRequest>({
            query: (params) => ({
                url: '/promoted-messages',
                method: 'GET',
                params: {
                    status: params.status,
                    page: params.page,
                    size: params.size,
                },
            }),
            providesTags: ['PromotedMessages'],
        }),
        // The current user's promotion spend summary for the dashboard card
        getMyPromotionSpendSummary: builder.query<PromotionSpendSummary, void>({
            query: () => ({
                url: '/promoted-messages/summary',
                method: 'GET',
            }),
            providesTags: ['PromotedMessages'],
        }),
        // Get promotion detail (owner or staff)
        getPromotedMessageById: builder.query<PromotedMessageDetail, number>({
            query: (id) => ({
                url: `/promoted-messages/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'PromotedMessages', id}],
        }),
        // Cancel own APPROVED promotion (no refund); PENDING must use request-cancel
        cancelPromotedMessage: builder.mutation<PromotedMessageDetail, number>({
            query: (id) => ({
                url: `/promoted-messages/${id}/cancel`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'PromotedMessages', id},
                'PromotedMessages',
            ],
        }),
        // Ask an admin to cancel a PENDING promotion (reason required; no payment action)
        requestCancelPromotedMessage: builder.mutation<PromotedMessageDetail, { id: number; reason: string }>({
            query: ({id, reason}) => ({
                url: `/promoted-messages/${id}/request-cancel`,
                method: 'POST',
                body: {reason},
            }),
            invalidatesTags: (result, error, {id}) => [
                {type: 'PromotedMessages', id},
                'PromotedMessages',
            ],
        }),
    }),
});

export const {
    usePromoteMessageMutation,
    useGetMyPromotedMessagesQuery,
    useGetMyPromotionSpendSummaryQuery,
    useGetPromotedMessageByIdQuery,
    useCancelPromotedMessageMutation,
    useRequestCancelPromotedMessageMutation,
} = promotedMessagesApi;
