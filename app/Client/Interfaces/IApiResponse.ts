
export interface IBaseApiResponse {
    Error: { 
        statusText: string; 
        status: number;
        message: string;} | null
    IsSuccess: boolean
}

export interface IApiResponse<T> extends IBaseApiResponse{
    Data: T | null
}