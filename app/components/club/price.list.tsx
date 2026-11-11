import { Tag } from "lucide-react";
import type { ClubResDto } from "~/client/model/response/ClubResDto";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PriceRuleItem } from "../pricingClub/pricingRoleItem";


export function PriceList({ club }: { club: ClubResDto | null }) {
  if (!club) return null;

  const rules = (club.priceRoles ?? [])
    .filter((rule) => rule.isActive)
    .sort((a, b) => b.priority - a.priority);

  if (rules.length === 0) return null;

  return (
    <Card className="bg-card border-primary/20 overflow-hidden">
      <CardHeader className="pb-2 px-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4 text-primary" /> Listino prezzi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm px-2">
        {rules.map((rule) => (
          <PriceRuleItem key={rule.id} rule={rule} courts={club.courts} />
        ))}
      </CardContent>
    </Card>
  );
}
