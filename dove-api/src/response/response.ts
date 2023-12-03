export const response = (data: any, success: boolean = true, status: number = 200): Response => {
    return {
        success,
        status,
        data,
        length: Array.isArray(data) ? data.length : undefined
    }
}

export interface Response {
    success: boolean;
    status: number;
    data: any;
    length?: number;
}