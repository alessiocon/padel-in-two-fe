import type { BookingCancBy } from "../common/Enum/booking.cancby";
import type { BookingStatus } from "../common/Enum/booking.status.dto";
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
    startsAt: string;
    endsAt: string;
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

    createdAt: Date;
}