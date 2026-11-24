import type { BookingCancBy } from "../common/Enum/booking.cancby";
import type { BookingJoinMode } from "../common/Enum/booking.join.mode";
import type { BookingStatus } from "../common/Enum/booking.status.dto";
import type { PromotionType } from "../common/Enum/promotion.type";
import type { BookingLogResDto } from "./booking.log.res.dto";
import type { BookingTeamResDto } from "./booking.team.res.dto";


export class BookingDetailResDto{
    id: string;
    clubId: string;
    clubName: string;

    courtId: string;
    courtName: string;
    courtSize: number;
    isCourtIndoor: boolean;

    position: string;
    status: BookingStatus;
    description: string;
    isPublic: boolean;
    joinMode: BookingJoinMode;
    minPlayerLevel: number | null;
    maxPlayerLevel: number | null;
    startsAt: string;
    endsAt: string;
    price: number;
    isIndoor: boolean;

    createdBy: {
        id: string,
        username: string,
        firstName: string,
        lastName: string,
    } | null;
    createdByStaff: boolean;
    teams: BookingTeamResDto[];
    logs: BookingLogResDto[];

    cancBy: BookingCancBy | null;
    cancAt: Date | null;
    cancPostConfirm: boolean | null;
    cancReason: string | null;

    eligiblePromotions: PromotionType[];

    createdAt: Date;
}