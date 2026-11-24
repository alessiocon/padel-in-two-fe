import type { BookingJoinMode } from "../common/Enum/booking.join.mode";
import type { BookingStatus } from "../common/Enum/booking.status.dto";
import type { PromotionType } from "../common/Enum/promotion.type";

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
     isPublic: boolean;
    joinMode: BookingJoinMode;
    minPlayerLevel: number | null;
    maxPlayerLevel: number | null;
    description: string;
    startsAt: string;
    endsAt: string;
    price: number;

    eligiblePromotions: PromotionType[];
    
    createdAt: Date;
}