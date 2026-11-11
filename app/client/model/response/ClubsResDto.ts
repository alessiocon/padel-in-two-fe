import type { ClubStatusDto } from "../common/Enum/ClubStatusDto";
import type { PromotionType } from "../common/Enum/promotion.type";

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

  promotions: PromotionType[];
}
