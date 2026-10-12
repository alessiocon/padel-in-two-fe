import type { CreateBookingTeamDto } from "./create.booking.team.dto";

export interface CreateBookingDto {
    courtId: string;
    description?: string;
    startsAt: string
    slots: number;
    teams: CreateBookingTeamDto[];
}