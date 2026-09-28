import {createApi} from '@reduxjs/toolkit/query/react';
import {chatBaseQuery} from './baseQuery';
import {ProStatistics, ProStatisticsDays} from '@ads/models/pro-statistics';

// Keep all sources of the dashboard total on the same refresh schedule.
export const dashboardRevenueQueryOptions = {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
};

export const adminProApi = createApi({
    reducerPath: 'adminProApi',
    baseQuery: chatBaseQuery,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getProStatistics: builder.query<ProStatistics, ProStatisticsDays>({
            query: (days) => ({url: '/admin/pro/statistics', params: {days}}),
        }),
    }),
});

export const {useGetProStatisticsQuery} = adminProApi;
