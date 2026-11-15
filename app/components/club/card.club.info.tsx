import { Clock, CircleDollarSign, Ban } from "lucide-react";
import type { ClubResDto } from "../../client/model/response/ClubResDto";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { PromotionBadges } from "../budge/promotion.badges";




export function CardClubInfo({club} :  {club :ClubResDto | null}) {

  if (!club) {
    return (
      <Card className="bg-card border-primary/20 overflow-hidden">
        <CardContent className="space-y-4 text-sm pt-6">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>

        {/* Banner Promo Skeleton */}
        <div className="bg-primary/10 p-3.5 flex items-start gap-2.5  border-t border-primary/20">
          <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
          <Skeleton className="h-3 w-full mt-1" />
        </div>
      </Card>
    );
  }


  return (
    <Card className="bg-card border-primary/20 overflow-hidden">
      <CardContent className="space-y-4 text-sm pt-0 px-2">

        {club.promotions?.length > 0 ? (
            <PromotionBadges promotions={club.promotions} />
        ) : <p className="inline-flex border border-primary/20 bg-primary/10 p-1 text-primary-foreground transition-colors hover:bg-primary/20"> <Ban className="h-4 w-4 text-primary-foreground inline-block mr-2 mt-0.5" />Promozioni non disponibili</p>}
        
        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1 mb-0.5" /> Orario
          </span>
          <span className="font-semibold">
            {club.openingTime} - {club.closingTime}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1 mb-0.5" /> Durata Slot
          </span>
          <span className="font-semibold">{club.slotDurationMinutes} min</span>
        </div>

        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground">
            <CircleDollarSign className="h-4 w-4 inline mr-1 mb-0.5" /> Prezzo Medio
          </span>
          <span className="font-bold">€ {club.averagePrice}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            <CircleDollarSign className="h-4 w-4 inline mr-1 mb-0.5" /> Noleggio Pala
          </span>
          <span className="font-bold">€ {club.racketPrice.toFixed(2)}</span>
        </div>
      </CardContent>


    </Card>
  );
}