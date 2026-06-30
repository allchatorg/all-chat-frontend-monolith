import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export const fileApi = createApi({
    reducerPath: 'fileApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        uploadFile: builder.mutation<string, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/files/upload',
                    method: 'POST',
                    body: formData,
                    responseHandler: (response) => response.text(),
                };
            },
        }),
    }),
});

export const {useUploadFileMutation} = fileApi;
