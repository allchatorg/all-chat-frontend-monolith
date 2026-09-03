import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {PaginatedResponse} from '@ads/models/ad';
import {
    MyRoomPromotionsRequest,
    PromoteRoomRequest,
    RoomPromotion,
    RoomPromotionDetail,
} from '@ads/models/room-promotion';

// User-facing room-promotions API — mirrors promotedMessagesApi.ts.
export const roomPromotionsApi = createApi({
    reducerPath: 'roomPromotionsApi',
    baseQuery: baseQuery,
    tagTypes: ['RoomPromotions'],
    endpoints: (builder) => ({
        // Promote a chat room ($2.50 hold until admin review)
        promoteRoom: builder.mutation<RoomPromotionDetail, PromoteRoomRequest>({
            query: (data) => ({
                url: '/room-promotions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['RoomPromotions'],
        }),
        // List the current user's room promotions (default submittedAt desc)
        getMyRoomPromotions: builder.query<PaginatedResponse<RoomPromotion>, MyRoomPromotionsRequest>({
            query: (params) => ({
                url: '/room-promotions',
                method: 'GET',
                params: {
                    status: params.status,
                    page: params.page,
                    size: params.size,
                },
            }),
            providesTags: ['RoomPromotions'],
        }),
        // Get promotion detail (owner or staff)
        getRoomPromotionById: builder.query<RoomPromotionDetail, number>({
            query: (id) => ({
                url: `/room-promotions/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'RoomPromotions', id}],
        }),
        // Ask an admin to cancel a PENDING promotion (reason required; no payment action)
        requestCancelRoomPromotion: builder.mutation<RoomPromotionDetail, { id: number; reason: string }>({
            query: ({id, reason}) => ({
                url: `/room-promotions/${id}/request-cancel`,
                method: 'POST',
                body: {reason},
            }),
            invalidatesTags: (result, error, {id}) => [
                {type: 'RoomPromotions', id},
                'RoomPromotions',
            ],
        }),
    }),
});

export const {
    usePromoteRoomMutation,
    useGetMyRoomPromotionsQuery,
    useGetRoomPromotionByIdQuery,
    useRequestCancelRoomPromotionMutation,
} = roomPromotionsApi;
