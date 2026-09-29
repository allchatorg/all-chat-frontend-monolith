import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';
import {AppDispatch} from "@/redux/store";
import type {AsyncThunk} from '@reduxjs/toolkit';
import {ApiError} from "@/models/ApiError";
import {normalizeApiError} from '@/lib/apiError';

export function useThunk<TArg = void, TResult = any, TConfig extends Record<string, any> = Record<string, any>>(
    thunk: AsyncThunk<TResult, TArg, TConfig>
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
                const details = err && typeof err === "object"
                    ? err as Partial<ApiError> & {name?: string; detail?: string}
                    : undefined;
                const apiError = normalizeApiError(err);

                // Keep API fields for callers, but throw an Error so Next.js can
                // display its message and stack instead of "[object Object]".
                const requestError = Object.assign(new Error(apiError.message), apiError);
                // A thunk condition skips duplicate work; it isn't an API failure.
                if (details?.name !== "ConditionError") {
                    setError(requestError);
                }
                throw requestError;
            } finally {
                setIsLoading(false);
            }
        },
        [dispatch, thunk]
    ) as TArg extends void ? () => Promise<TResult> : (arg: TArg) => Promise<TResult>;

    return [runThunk, isLoading, error];
}
