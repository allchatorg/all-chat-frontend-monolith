export interface ApiError {
    status: number;
    error: string;
    message: string;
    timestamp: string;
    requestId?: string;
    endpoint?: string;
    stage?: 'credentials' | 'profile' | 'bootstrap';
    retryable?: boolean;
    sessionInvalid?: boolean;
    staleSession?: boolean;
}
