import type { bookingStatus } from "./../common/Enum/bookingStatusDto";

export class BookingResDto {
    id: string;
    courtId: string;
    status: bookingStatus;
    clubId: string;
    description: string;
    startsAt: string;
    endsAt: string;
    userId: string;
}