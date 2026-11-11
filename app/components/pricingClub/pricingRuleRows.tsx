import { PricingRuleScope } from "~/client/model/common/Enum/pricing.role.scope";
import type { PricingRuleResDto } from "~/client/model/response/Pricing.rule.res.dto";
import type { ClubResDto } from "~/client/model/response/ClubResDto";
import { PricingRulePriceMode } from "~/client/model/common/Enum/pricing.role.price.mode";
import { applyRule, ruleAppliesToCourt } from "~/lib/pricing";
import { PriceRow } from "./priceRow";


export function PriceRuleRows({ rule, courts }: { rule: PricingRuleResDto; courts: ClubResDto["courts"] }) {
  if (rule.scope === PricingRuleScope.ALL_COURTS) {
    const isFixed = rule.priceMode === PricingRulePriceMode.FIXED_SLOT_PRICE;
    const prices = Array.from(new Set(courts.map((court) => court.price ?? 0)));
    const sharedBasePrice = prices.length === 1 ? prices[0] : undefined;

    if (isFixed) return <PriceRow label="Tutti i campi" finalPrice={rule.value} />;
    if (sharedBasePrice === undefined) return <PriceRow label="Tutti i campi" />;
    return <PriceRow label="Tutti i campi" basePrice={sharedBasePrice} finalPrice={applyRule(rule, sharedBasePrice)} />;
  }

  return (
    <>
      {courts
        .filter((court) => ruleAppliesToCourt(rule, court.id))
        .map((court) => (
          <PriceRow
            key={court.id}
            label={court.name}
            basePrice={court.price ?? 0}
            finalPrice={applyRule(rule, court.price ?? 0)}
          />
        ))}
    </>
  );
}