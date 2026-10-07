import type { TournamentTeamResDto } from "./tournamentTeam.res.dto";

export class TournamentResDto{
    id: string;
    title: string;
    description: string | null;
    position: string;
    municipality: string;
    province: string;
    award: string;
    startsAt: Date;
    endsAt: Date;
    timezone: string;
    maxTeams: number;
    isClosed: boolean;
    isVisible: boolean;
    teams: TournamentTeamResDto[];
}