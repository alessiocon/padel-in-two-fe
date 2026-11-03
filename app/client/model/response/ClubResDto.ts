import type { ClubCourtDto } from "../common/ClubCourtDto";
import type { ClubStatusDto } from "../common/Enum/ClubStatusDto";
import type { ClubMemberResDto } from "./club.member.res.dto";

export class ClubResDto {
  id: string;
  name: string;
  email: string;
  status: ClubStatusDto;
  slotDurationMinutes: number;
  openingTime: string;
  closingTime: string;
  position: string;
  racketPrice: number;
  timezone: string;
  courtsInDoor: number;
  courtsOutDoor: number;
  averagePrice: number;
  courts: ClubCourtDto[];
  members: ClubMemberResDto[];
}
