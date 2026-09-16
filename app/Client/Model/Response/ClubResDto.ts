import type { ClubCourtDto } from "./../Common/ClubCourtDto";
import type { ClubStatusDto } from "./../Common/Enum/ClubStatusDto";

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
}
