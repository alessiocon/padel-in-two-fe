import type { BookingJoinMode } from "../common/Enum/booking.join.mode";
import type { CreateBookingTeamDto } from "./create.booking.team.dto";

export interface CreateBookingDto {
    courtId: string;
    clubId: string;
    description?: string;
    isPublic?: boolean;
    joinMode?: BookingJoinMode;
    minPlayerLevel?: number;
    maxPlayerLevel?: number;
    startsAt: string
    slots: number;
    teams: CreateBookingTeamDto[];
}