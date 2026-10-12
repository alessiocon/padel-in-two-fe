import type { BookingCancBy } from "../common/Enum/booking.cancby";
import type { bookingStatus } from "../common/Enum/booking.status.dto";
import type { BookingLogResDto } from "./booking.log.res.dto";
import type { BookingTeamResDto } from "./booking.team.res.dto";

export class BookingUserResDto{
    id: string;
    clubId: string;
    clubName: string;

    courtId: string;
    courtName: string;
    isCourtIndoor: boolean;

    position: string;
    status: bookingStatus;
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
    teams: BookingTeamResDto[];
    logs: BookingLogResDto[];

    cancBy: BookingCancBy | null;
    cancAt: Date | null;
    cancPostConfirm: boolean | null;
    cancReason: string | null;

    createdAt: Date;
}