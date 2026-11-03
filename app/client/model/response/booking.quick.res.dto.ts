import type { BookingStatus } from "../common/Enum/booking.status.dto";

export class BookingQuickResDto{
    id: string;
    clubId: string;
    clubName: string;

    courtId: string;
    courtName: string;
    isCourtIndoor: boolean;
    createdByStaff: boolean;

    nPlayer: number;

    status: BookingStatus;
    description: string;
    startsAt: string;
    endsAt: string;
    
    createdAt: Date;
}