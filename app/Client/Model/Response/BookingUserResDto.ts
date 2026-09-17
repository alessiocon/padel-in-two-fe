import type { BookingStatus } from "./../Common/Enum/BookingStatusDto";

export class BookingUserResDto{
    id: string;
    courtId: string;
    clubId: string;
    courtName: string;
    position: string;
    status: BookingStatus;
    description: string;
    startsAt: string;
    endsAt: string;
    isIndoor: boolean;
}