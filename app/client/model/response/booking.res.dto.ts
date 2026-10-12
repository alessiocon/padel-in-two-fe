import type { BookingCancBy } from "../common/Enum/booking.cancby";
import type { bookingStatus } from "../common/Enum/booking.status.dto";
import type { BookingLogResDto } from "./booking.log.res.dto";
import type { BookingTeamResDto } from "./booking.team.res.dto";

export class BookingResDto {
    id: string;
    clubId: string;
    courtId: string;
    createdBy: {
        id: string,
        username: string,
        firstName: string,
        lastName: string,
    } | null;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    status: bookingStatus;
    teams: BookingTeamResDto[];
    auditLogs: BookingLogResDto[];

    cancBy: BookingCancBy | null;
    cancAt: Date | null;
    cancPostConfirm: boolean | null;
    cancReason: string | null;

    createdAt: Date;
}