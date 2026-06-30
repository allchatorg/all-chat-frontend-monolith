import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';
import {AppDispatch} from "@/redux/store";
import type {AsyncThunk} from '@reduxjs/toolkit';
import {ApiError} from "@/models/ApiError";

export function useThunk<TArg = void, TResult = any>(
    thunk: AsyncThunk<TResult, TArg, any>
): [
    runThunk: TArg extends void ? () => Promise<TResult> : (arg: TArg) => Promise<TResult>,
    isLoading: boolean,
    error: ApiError | null
] {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const runThunk = useCallback(
        async (arg?: TArg): Promise<TResult> => {
            setIsLoading(true);
            setError(null);

            try {
                // @ts-ignore
                return await dispatch(thunk(arg as TArg)).unwrap();
            } catch (err: unknown) {
                let apiError: ApiError;

                if (err && typeof err === "object" && "status" in err) {
                    apiError = err as ApiError;
                } else {
                    apiError = {
                        status: 500,
                        message: err instanceof Error ? err.message : "Unknown error",
                        error: "Error",
                        timestamp: new Date().toISOString(),
                    };
                }

                setError(apiError);
                throw apiError;
            } finally {
                setIsLoading(false);
            }
        },
        [dispatch, thunk]
    ) as TArg extends void ? () => Promise<TResult> : (arg: TArg) => Promise<TResult>;

    return [runThunk, isLoading, error];
}