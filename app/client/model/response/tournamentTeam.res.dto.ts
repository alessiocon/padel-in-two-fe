import type { TournamentTeamPlayerResDto } from "./tournamentTeamPlayer.res.dto";

export class TournamentTeamResDto{
    id: string;
    tournamentId: string;
    teamName: string;
    player1Id: string;
    player2Id: string | null;
    player2FName:string | null;
    player2LName:string | null;
    player2Phone: string | null;
    player1: TournamentTeamPlayerResDto | null;
    player2: TournamentTeamPlayerResDto | null;
}