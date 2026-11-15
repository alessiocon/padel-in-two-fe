import type { ClubResDto } from "~/client/model/response/ClubResDto";
import type { PricingRuleResDto } from "~/client/model/response/Pricing.rule.res.dto";
import { CalendarDays, Clock } from "lucide-react";
import {
    formatPrice,
    formatRuleTimeRange,
    formatWeekdays,
} from "~/lib/pricing";
import { PriceRuleRows } from "./pricingRuleRows";
import { PricingRulePriceMode } from "~/client/model/common/Enum/pricing.role.price.mode";
import type { JSX } from "react";


export function PriceRuleItem({ rule, courts } : { rule: PricingRuleResDto; courts: ClubResDto["courts"] }) {

    function describeRule(rule: PricingRuleResDto): JSX.Element {
        const generalClass = "font-bold text-right mb-0";
        if (rule.priceMode !== PricingRulePriceMode.MULTIPLIER) {
            return <p className={`${generalClass} text-primary-foreground`}>{`Prezzo fisso ${formatPrice(rule.value)}`}</p>;
        }
        const percentage = Math.round(Math.abs(1 - rule.value) * 10000) / 100;
        if (percentage === 0) return <p className={`${generalClass} text-primary-foreground`}>{`Prezzo base`}</p>;
        return rule.value < 1 ? <p className={`${generalClass} text-primary-foreground`}>{`- ${percentage}%`}</p> : <p className={`${generalClass} text-destructive`}>{`+ ${percentage}%`}</p>;
    }

    return (
        <div className="text-primary-foreground border-y border-primary px-1 pb-2">
       
            <p className="font-semibold overflow-hidden whitespace-nowrap text-ellipsis max-w-full">{rule.name}</p>
            {describeRule(rule)}
            <div className="space-y-1 text-xs text-muted-foreground pb-2">
                <p> 
                    <CalendarDays className="h-3.5 w-3.5 inline mr-1.5 mb-0.5 text-primary-foreground" />
                    {formatWeekdays(rule.weekdays)}
                </p>
                <p> 
                    <Clock className="h-3.5 w-3.5 inline mr-1.5 mb-0.5 text-primary-foreground" />
                    {formatRuleTimeRange(rule)}
                </p>
            </div>

            <ul className="divide-y divide-border divide-border-primary text-xs max-h-15 overflow-y-auto bg-foreground/10 px-1">
                <PriceRuleRows rule={rule} courts={courts} />
            </ul>
        </div>
    );
}