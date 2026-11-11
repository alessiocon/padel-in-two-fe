import type { ClubCourtDto } from "../common/ClubCourtDto";
import type { ClubStatusDto } from "../common/Enum/ClubStatusDto";
import type { PromotionType } from "../common/Enum/promotion.type";
import type { ClubMemberResDto } from "./club.member.res.dto";
import type { PricingRuleResDto } from "./Pricing.rule.res.dto";

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
  priceRoles: PricingRuleResDto[]
  promotions: PromotionType[];
}
