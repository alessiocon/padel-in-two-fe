import type { ClubCourtDto } from "./../common/ClubCourtDto";
import type { ClubStatusDto } from "./../common/Enum/ClubStatusDto";

export class ClubResDto {
  id: string;
  ownerId: string;
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
