import type { MatchFormat } from "../common/Enum/match.format.dto";

export class UpdateMatchReqDto{
    courtId: string | null;
    format: MatchFormat | null;
    scheduledAt: Date | null;
    team1Id: string | null;
    team2Id: string | null;
}