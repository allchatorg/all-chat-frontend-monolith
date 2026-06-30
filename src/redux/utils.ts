import axios from "axios";

export const handleThunkError = (error: unknown, defaultMessage = 'Operation failed'): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (typeof data === "string" && data.trim()) {
            return data;
        }

        if (data && typeof data === "object" && typeof data.message === "string") {
            return data.message;
        }

        return defaultMessage;
    }

    if (typeof error === "string" && error.trim()) {
        return error;
    }

    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return defaultMessage;
};
