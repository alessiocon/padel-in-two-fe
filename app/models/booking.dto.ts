export enum BookingStatus { RESERVED = "reserved" ,PENDING = "pending" ,CONFIRMED = "confirmed" ,CANCELLED = "cancelled" };


export interface BookingDto {
    id: string;
    courtId: string;
    status: BookingStatus,
    clubId: string,
    description: string,
    startsAt: string,
    endsAt: string,
    userId: string,
}

export interface CreateBookingDto {
    courtId: string;
    description: string;
    startsAt: string
    slots: number; // Es. "10:00"
}