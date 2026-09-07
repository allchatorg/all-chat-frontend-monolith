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
                const details = err && typeof err === "object"
                    ? err as Partial<ApiError> & {name?: string; detail?: string}
                    : undefined;
                const message = [details?.message, details?.detail, typeof err === "string" ? err : null, details?.error]
                    .find((value): value is string => typeof value === "string" && value.trim().length > 0)
                    ?? "Unknown error";
                const apiError: ApiError = {
                    ...details,
                    status: typeof details?.status === "number" ? details.status : 500,
                    message,
                    error: typeof details?.error === "string" ? details.error : "Error",
                    timestamp: typeof details?.timestamp === "string" ? details.timestamp : new Date().toISOString(),
                };

                // Keep API fields for callers, but throw an Error so Next.js can
                // display its message and stack instead of "[object Object]".
                const requestError = Object.assign(err instanceof Error ? err : new Error(message), apiError);
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
