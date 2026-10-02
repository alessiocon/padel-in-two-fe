import type { TournamentsTeamResDto } from "./tournamentsTeam.res.dto";

export class TournamentsResDto {
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
      showTeams: boolean;
      teams: TournamentsTeamResDto[];
}