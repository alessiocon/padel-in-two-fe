import type { ClubStatusDto } from "../Common/Enum/ClubStatusDto";

export class ClubsResDto {
  id: string;

  name: string;

  email: string;

  status: ClubStatusDto;

  slotDurationMinutes: number;

  openingTime: string;

  closingTime: string;

  position: string;

  racketPrice: number;

  courtsInDoor: number;

  courtsOutDoor: number;

  averagePrice: number;
}
