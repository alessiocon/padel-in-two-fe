import type { MatchFormat } from "../common/Enum/match.format.dto";
import type { MatchProposeDto } from "./match.propose.dto";

export class BookingResultProposeDto {
  matches: MatchProposeDto[];
  format: MatchFormat;
  isStaff: boolean;
}