import type { bookingStatus } from "./../common/Enum/bookingStatusDto";

export class BookingUserResDto{
    id: string;
    courtId: string;
    clubId: string;
    courtName: string;
    position: string;
    status: bookingStatus;
    description: string;
    startsAt: string;
    endsAt: string;
    isIndoor: boolean;
}