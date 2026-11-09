import {createApi} from '@reduxjs/toolkit/query/react';
import {chatBaseQuery} from './baseQuery';
import {VipStatistics, VipStatisticsDays} from '@ads/models/vip-statistics';
import {VipPayment, VipRefundRequest} from '@ads/models/vip-payment';

// Keep all sources of the dashboard total on the same refresh schedule.
export const dashboardRevenueQueryOptions = {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
};

export const adminVipApi = createApi({
    reducerPath: 'adminVipApi',
    baseQuery: chatBaseQuery,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    tagTypes: ['VipPayments'],
    endpoints: (builder) => ({
        getVipStatistics: builder.query<VipStatistics, VipStatisticsDays>({
            query: (days) => ({url: '/admin/vip/statistics', params: {days}}),
        }),
        getVipPayments: builder.query<VipPayment[], number>({
            query: (userId) => ({url: `/admin/vip/users/${userId}/payments`}),
            providesTags: (result, error, userId) => [{type: 'VipPayments', id: userId}],
        }),
        refundVipPayment: builder.mutation<VipPayment, VipRefundRequest>({
            query: ({userId, invoiceId, reason}) => ({
                url: `/admin/vip/users/${userId}/payments/${invoiceId}/refund`,
                method: 'POST',
                body: {reason},
            }),
            invalidatesTags: (result, error, {userId}) => [{type: 'VipPayments', id: userId}],
        }),
    }),
});

export const {useGetVipStatisticsQuery, useGetVipPaymentsQuery, useRefundVipPaymentMutation} = adminVipApi;
