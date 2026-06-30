import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import {AdminUserDto} from '@ads/models/admin-user';
import {PaginatedResponse} from '@ads/models/ad';

export const adminUsersApi = createApi({
    reducerPath: 'adminUsersApi',
    baseQuery: baseQuery,
    tagTypes: ['AdminUsers'],
    endpoints: (builder) => ({
        getUsers: builder.query<PaginatedResponse<AdminUserDto>, {
            userId?: number;
            email?: string;
            page: number;
            size: number;
            sort?: string
        }>({
            query: (params) => ({
                url: '/admin/users',
                method: 'GET',
                params: {
                    userId: params.userId,
                    email: params.email,
                    page: params.page,
                    size: params.size,
                    sort: params.sort,
                },
            }),
            providesTags: ['AdminUsers'],
        }),
        getUserById: builder.query<AdminUserDto, number>({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'AdminUsers', id}],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
} = adminUsersApi;
