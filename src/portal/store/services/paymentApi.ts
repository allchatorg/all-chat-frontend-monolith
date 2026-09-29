import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';
import type {CardSetupIntent, SavedPaymentCard} from '@/components/billing/types';

// Payment Method DTO
export type PaymentMethodDto = SavedPaymentCard;

// Add Payment Method Request
export interface AddPaymentMethodRequest {
    paymentMethodId: string;
}

export const paymentApi = createApi({
    reducerPath: 'paymentApi',
    baseQuery: baseQuery,
    tagTypes: ['PaymentMethod'],
    endpoints: (builder) => ({
        createCardSetup: builder.mutation<CardSetupIntent, void>({
            query: () => ({url: '/payment/methods/setup-intent', method: 'POST'}),
        }),
        completeCardSetup: builder.mutation<PaymentMethodDto[], {setupIntentId: string}>({
            query: body => ({url: '/payment/methods/setup-complete', method: 'POST', body}),
            invalidatesTags: ['PaymentMethod'],
        }),
        // Get payment methods
        getPaymentMethods: builder.query<PaymentMethodDto[], void>({
            query: () => '/payment/methods',
            providesTags: ['PaymentMethod'],
        }),

        // Add payment method
        addPaymentMethod: builder.mutation<void, AddPaymentMethodRequest>({
            query: (data) => ({
                url: '/payment/methods',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PaymentMethod'],
        }),

        // Remove payment method
        removePaymentMethod: builder.mutation<void, string>({
            query: (id) => ({
                url: `/payment/methods/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PaymentMethod'],
        }),
    }),
});

export const {
    useGetPaymentMethodsQuery,
    useAddPaymentMethodMutation,
    useRemovePaymentMethodMutation,
    useCreateCardSetupMutation,
    useCompleteCardSetupMutation,
} = paymentApi;
