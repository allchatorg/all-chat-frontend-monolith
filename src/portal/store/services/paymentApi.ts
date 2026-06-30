import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

// Payment Method DTO
export interface PaymentMethodDto {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    cardholderName: string;
}

// Add Payment Method Request
export interface AddPaymentMethodRequest {
    paymentMethodId: string;
}

export const paymentApi = createApi({
    reducerPath: 'paymentApi',
    baseQuery: baseQuery,
    tagTypes: ['PaymentMethod'],
    endpoints: (builder) => ({
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
} = paymentApi;
