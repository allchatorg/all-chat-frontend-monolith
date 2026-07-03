import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './baseQuery';

export interface FileUploadResponse {
    // Bare storage object key to submit in the create-ad request
    key: string;
    // Renderable URL for immediate preview
    url: string;
}

export const fileApi = createApi({
    reducerPath: 'fileApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        uploadFile: builder.mutation<FileUploadResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/files/upload',
                    method: 'POST',
                    body: formData,
                };
            },
        }),
    }),
});

export const {useUploadFileMutation} = fileApi;
