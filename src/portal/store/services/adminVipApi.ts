import {createApi} from '@reduxjs/toolkit/query/react';
import {chatBaseQuery} from './baseQuery';
import {VipStatistics, VipStatisticsDays} from '@ads/models/vip-statistics';

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
    endpoints: (builder) => ({
        getVipStatistics: builder.query<VipStatistics, VipStatisticsDays>({
            query: (days) => ({url: '/admin/vip/statistics', params: {days}}),
        }),
    }),
});

export const {useGetVipStatisticsQuery} = adminVipApi;
