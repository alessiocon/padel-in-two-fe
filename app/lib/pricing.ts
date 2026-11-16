import { PricingRulePriceMode } from "~/client/model/common/Enum/pricing.role.price.mode";
import { PricingRuleScope } from "~/client/model/common/Enum/pricing.role.scope";
import type { ClubCourtDto } from "~/client/model/common/ClubCourtDto";
import type { PricingRuleResDto } from "~/client/model/response/Pricing.rule.res.dto";

export interface PriceResolution {
  basePrice: number;
  finalPrice: number;
  appliedRule: PricingRuleResDto | null;
}

const WEEKDAY_LABELS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

const round2 = (value: number) => Math.round(value * 100) / 100;
const toDateKey = (value: Date | string): string =>
  typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);

const toHourMinute = (value: string): string => value.slice(0, 5);

export const formatPrice = (value: number): string => `€ ${value.toFixed(2)}`;

/** Accetta sia 0 che 7 come domenica. */
export function ruleMatchesWeekday(rule: PricingRuleResDto, weekday: number): boolean {
  return rule.weekdays.some((d) => d === weekday || (weekday === 0 && d === 7));
}

export function formatWeekdays(weekdays: number[]): string {
  const normalized = Array.from(new Set(weekdays.map((d) => d % 7))).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  if (normalized.length === 7) return "Tutti i giorni";
  return normalized.map((d) => WEEKDAY_LABELS[d].slice(0, 3)).join(", ");
}

export function formatRuleTimeRange(rule: PricingRuleResDto): string {
  const start = toHourMinute(rule.startTime);
  const end = toHourMinute(rule.endTime);
  return start === end ? "Tutto il giorno" : `${start} - ${end}`;
}

export function formatRuleValidity(rule: PricingRuleResDto): string {
  const format = (value: Date | string) => toDateKey(value).split("-").reverse().join("/");
  return rule.validUntil
    ? `Dal ${format(rule.validFrom)} al ${format(rule.validUntil)}`
    : `Dal ${format(rule.validFrom)}`;
}

export function ruleAppliesToCourt(rule: PricingRuleResDto, courtId: string): boolean {
  return rule.scope === PricingRuleScope.ALL_COURTS || rule.courtIds.includes(courtId);
}

export function applyRule(rule: PricingRuleResDto, basePrice: number): number {
  return round2(
    rule.priceMode === PricingRulePriceMode.MULTIPLIER ? basePrice * rule.value : rule.value
  );
}

function isTimeInRule(rule: PricingRuleResDto, slot: string): boolean {
  const time = toHourMinute(slot);
  const start = toHourMinute(rule.startTime);
  const end = toHourMinute(rule.endTime);
  if (start === end) return true;
  return start < end ? time >= start && time <= end : time >= start || time <= end;
}

/**
 * Regola valida per campo, data (YYYY-MM-DD) e slot (HH:mm).
 * In caso di più regole vince quella con priorità più alta.
 */
export function findApplicableRule(
  rules: PricingRuleResDto[] | null | undefined,
  courtId: string,
  date: string,
  slot: string
): PricingRuleResDto | null {
  if (!rules?.length) return null;
  const weekday = new Date(`${date}T00:00:00`).getDay();
  return (
    rules
      .filter(
        (rule) =>
          rule.isActive &&
          ruleAppliesToCourt(rule, courtId) &&
          ruleMatchesWeekday(rule, weekday) &&
          toDateKey(rule.validFrom) <= date &&
          (!rule.validUntil || date <= toDateKey(rule.validUntil)) &&
          isTimeInRule(rule, slot)
      )
      .sort((a, b) => b.priority - a.priority)[0] ?? null
  );
}

export function resolveCourtPrice(
  court: Pick<ClubCourtDto, "id" | "price">,
  rules: PricingRuleResDto[] | null | undefined,
  date: string,
  slot: string
): PriceResolution {
  const basePrice = court.price ?? 0;
  const appliedRule = findApplicableRule(rules, court.id, date, slot);
  return {
    basePrice,
    finalPrice: appliedRule ? applyRule(appliedRule, basePrice) : basePrice,
    appliedRule,
  };
}
