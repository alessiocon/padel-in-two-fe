import type { MatchFormat } from "../common/Enum/match.format.dto";
import type { MatchStatus } from "../common/Enum/matchStatus.dto";

export class UpdateMatchReqDto{
    courtId?: string | null;
    format?: MatchFormat;
    status?: MatchStatus;
    scheduledAt?: Date;
    team1Id?: string | null;
    team2Id?: string | null;
}