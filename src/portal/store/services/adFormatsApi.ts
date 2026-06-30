import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {AdFormatDto} from "@ads/data/adFormats";

export const adFormatsApi = createApi({
    reducerPath: 'adFormatsApi',
    baseQuery: baseQuery,
    tagTypes: ['AdFormat'],
    endpoints: (builder) => ({
        getAdFormats: builder.query<AdFormatDto[], void>({
            query: () => '/ad-formats',
            providesTags: ['AdFormat'],
        }),
    }),
});

export const {
    useGetAdFormatsQuery,
} = adFormatsApi;
