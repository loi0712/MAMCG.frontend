import type { AxiosError } from 'axios';

interface ApiErrorResponse {
    error: string;
    message?: string;
}

export const handleApiError = (error: AxiosError<ApiErrorResponse>, context?: string) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || error.message;
    const logPrefix = context ? `[${context}]` : '';

    switch (status) {
        case 400:
            console.error(`${logPrefix} Bad Request:`, errorMessage);
            break;
        case 401:
            console.error(`${logPrefix} Unauthorized:`, errorMessage);
            break;
        case 403:
            console.error(`${logPrefix} Forbidden:`, errorMessage);
            break;
        case 404:
            console.error(`${logPrefix} Not Found:`, errorMessage);
            break;
        case 409:
            console.error(`${logPrefix} Conflict:`, errorMessage);
            break;
        case 422:
            console.error(`${logPrefix} Validation Error:`, errorMessage);
            break;
        case 500:
            console.error(`${logPrefix} Server Error:`, errorMessage);
            break;
        default:
            console.error(`${logPrefix} Request failed:`, errorMessage);
    }

    return {
        status,
        message: errorMessage,
        originalError: error
    };
};
