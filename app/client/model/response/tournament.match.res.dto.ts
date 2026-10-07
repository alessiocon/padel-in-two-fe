import type { MatchFormat } from "../common/Enum/match.format.dto";
import type { MatchStatus } from "../common/Enum/matchStatus.dto";
import type { MatchScoreResDto } from "./match.score.res.dto";

export class TournamentMatchResDto{
    id: string;
    tournamentId: string;
    courtId: string | null;
    courtName: string | null;
    team1Id: string | null;
    team2Id: string | null;
    team1Name: string | null;
    team2Name: string | null;
    format: MatchFormat;
    winnerTeamId: string | null;
    round: number;
    matchOrder: number;
    status: MatchStatus;
    scheduledAt: Date | null;
    sets?: MatchScoreResDto[] | null;
}