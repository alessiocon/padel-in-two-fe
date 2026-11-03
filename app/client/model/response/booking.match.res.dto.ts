import type { MatchFormat } from "../common/Enum/match.format.dto";
import type { MatchPropose } from "../common/Enum/match.propose";
import type { BookingSetScoreProps } from "./booking.match.score.res.dto";

export class BookingMatchResDto {
    id: string;       
    bookingId: string;   
    winnerTeamNumber: number;
    format: MatchFormat;

    proposeByTeamId?: string;
    proposeTeamName?: string;
    proposePlayerIds?: string[];
    pendingPlayerIds?: string[];

    team1Name: string;
    team2Name: string;

    proposeNumber: number;
    status: MatchPropose;
    sets: BookingSetScoreProps[];
}
