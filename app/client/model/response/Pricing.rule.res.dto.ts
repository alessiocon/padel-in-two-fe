import type { PricingRulePriceMode } from "../common/Enum/pricing.role.price.mode";
import type { PricingRuleScope } from "../common/Enum/pricing.role.scope";

export class PricingRuleResDto {
  id!: string;
  clubId!: string;
  name!: string;
  scope!: PricingRuleScope;
  courtIds!: string[];
  weekdays!: number[];
  startTime!: string;
  endTime!: string;
  validFrom!: Date;
  validUntil!: Date | null;
  priceMode!: PricingRulePriceMode;
  value!: number;
  priority!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}