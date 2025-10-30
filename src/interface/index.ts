export interface BaseResponse {
    error: string;
}

export type GeneralError = {
    message: string;
    success: boolean;
    errorId: string;
    errors: string[];
  };