import { PromotionType } from "../common/Enum/promotion.type";

export class PromotionAccountResDto {
  promotion: PromotionType;
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
}