import type { BookingStatus } from "./../Common/Enum/BookingStatusDto";

export class BookingResDto {
    id: string;
    courtId: string;
    status: BookingStatus;
    clubId: string;
    description: string;
    startsAt: string;
    endsAt: string;
    userId: string;
}