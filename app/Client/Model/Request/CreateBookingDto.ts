export interface CreateBookingDto {
    courtId: string;
    description: string;
    startsAt: string
    slots: number;
}