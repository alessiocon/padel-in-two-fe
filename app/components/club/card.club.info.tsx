import { Clock, CircleDollarSign, Gift } from "lucide-react";
import type { ClubResDto } from "../../client/model/response/ClubResDto";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { AuthContext } from "~/store/context";
import { useContext } from "react";
import { Link } from "react-router";
import { buttonVariants } from "../ui/button";
import { PromotionBadges } from "../budge/promotion.badges";




export function CardClubInfo({club, isClubManagerPage} :  {club :ClubResDto | null, isClubManagerPage: boolean}) {
  const [auth, setAuth] = useContext(AuthContext);

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

  let isMemberOfAClub : boolean = Boolean(club.members.find(m => m.userId === auth?.sub));
  return (
    <Card className="bg-card border-primary/20 overflow-hidden">

      <CardContent className="space-y-4 text-sm pt-6">

        {club.promotions?.length > 0 && (
          <div className="bg-primary/10 p-2.5 justify-center flex">
            <PromotionBadges promotions={club.promotions} />
          </div>
        )}

        {isMemberOfAClub &&  !isClubManagerPage  && <>
        <Link to={`/clubs/${club.id}/manage`} 
          className={`${buttonVariants({ variant: "default", size: "sm" })} w-full md:w-auto max-w-[150px] text-center whitespace-nowrap`}>
          gestisci il club
        </Link>
        </>}
        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" /> Orario
          </span>
          <span className="font-semibold">
            {club.openingTime} - {club.closingTime}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" /> Durata Slot
          </span>
          <span className="font-semibold">{club.slotDurationMinutes} min</span>
        </div>

        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <CircleDollarSign className="h-4 w-4 text-primary" /> Prezzo Medio
          </span>
          <span className="font-bold text-primary">€ {club.averagePrice}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <CircleDollarSign className="h-4 w-4 text-primary" /> Noleggio Pala
          </span>
          <span className="font-bold">€ {club.racketPrice.toFixed(2)}</span>
        </div>
      </CardContent>


    </Card>
  );
}