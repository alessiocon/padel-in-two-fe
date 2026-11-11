import type { ClubResDto } from "~/client/model/response/ClubResDto";
import type { PricingRuleResDto } from "~/client/model/response/Pricing.rule.res.dto";
import { Badge } from "../ui/badge";
import { CalendarDays, Clock } from "lucide-react";
import {
    formatPrice,
    formatRuleTimeRange,
    formatRuleValidity,
    formatWeekdays,
} from "~/lib/pricing";
import { PriceRuleRows } from "./pricingRuleRows";
import { PricingRulePriceMode } from "~/client/model/common/Enum/pricing.role.price.mode";


export function PriceRuleItem({ rule, courts }: { rule: PricingRuleResDto; courts: ClubResDto["courts"] }) {

    function describeRule(rule: PricingRuleResDto): string {
    if (rule.priceMode !== PricingRulePriceMode.MULTIPLIER) {
        return `Prezzo fisso ${formatPrice(rule.value)}`;
    }
    const percentage = Math.round(Math.abs(1 - rule.value) * 10000) / 100;
    if (percentage === 0) return "Prezzo base";
    return rule.value < 1 ? `Risparmi il ${percentage}%` : `Maggiorazione del ${percentage}%`;
    }


    return (
        <div className="space-y-2 rounded-lg border border-border/50 p-3">
        <div className="flex items-start justify-between gap-2">
            <span className="font-semibold">{rule.name}</span>
            <Badge variant="outline" className="shrink-0 text-[10px]">
            {describeRule(rule)}
            </Badge>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {formatRuleValidity(rule)} · {formatWeekdays(rule.weekdays)}
            </p>
            <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {formatRuleTimeRange(rule)}
            </p>
        </div>

        <ul className="divide-y divide-border/40 text-xs">
            <PriceRuleRows rule={rule} courts={courts} />
        </ul>
        </div>
    );
}