import type { bookingStatus } from "../common/Enum/booking.status.dto";

export class BookingQuickResDto{
    id: string;
    clubId: string;
    clubName: string;

    courtId: string;
    courtName: string;
    isCourtIndoor: boolean;

    nPlayer: number;

    status: bookingStatus;
    description: string;
    startsAt: string;
    endsAt: string;
    
    createdAt: Date;
}