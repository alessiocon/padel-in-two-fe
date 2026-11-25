export class SearchBookingResponseDto <T> {
    data: T[];
    total: number;
    take: number;
    skip: number;
    page: number;
}