import { Link } from "react-router";
import { CalendarClock, Timer, DoorClosed, DoorOpen, Ban, MoveRight } from "lucide-react";
import { PromotionBadges } from "~/components/budge/promotion.badges";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { ClubsResDto } from "~/client/model/response/ClubsResDto";

interface CardClubPreviewProps {
  club: ClubsResDto;
}

export function CardClubPreview({ club }: CardClubPreviewProps) {

  return (
    <Card className="w-[350px] bg-card py-5 gap-4 shadow-none">
      <CardHeader className="px-3 gap-0">
        {club.promotions?.length > 0 ? (
            <PromotionBadges promotions={club.promotions} />
        ) : <p className="inline-flex bg-primary p-1 text-primary-foreground transition-colors hover:bg-primary/20"> <Ban className="h-4 w-4 text-primary-foreground inline-block mr-2 mt-0.5" />Promozioni non disponibili</p>}
        <CardTitle className="mt-4">{club.name}</CardTitle>
        {club.position}
      </CardHeader>

      <CardContent className="space-y-1 px-3">
        <CardDescription className="flex items-center gap-2 text-sm">
          <CalendarClock className="h-4 w-4  inline" /> {club.openingTime} - {club.closingTime}
          <Timer className="h-4 w-4  inline" /> {club.slotDurationMinutes}m
        </CardDescription>
        <CardDescription className="flex items-center gap-2 text-sm">
         
          {club.courtsInDoor > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <DoorClosed className="h-4 w-4 " />
              {club.courtsInDoor}
            </span>
          )}
          {club.courtsOutDoor > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <DoorOpen className="h-4 w-4 " />
              {club.courtsOutDoor}
            </span>
          )}
        </CardDescription>
      </CardContent>

      <CardFooter className="flex justify-start items-center gap-4 px-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Campo</span>
          <span className="font-bold text-base text-center">{club.averagePrice} <span className="text-[0.8em] text-muted-foreground">€</span></span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Pala da:</span>
          <span><span className="font-bold text-base text-center"> {club.racketPrice} <span className="text-[0.8em] text-muted-foreground">€</span></span></span>
        </div>        
      </CardFooter>
      <Link to={`/clubs/${club.id}`}
        className={`${buttonVariants({ variant: "default", size: "sm" })} w-full md:w-auto max-w-[125px] text-center whitespace-nowrap ml-auto mr-5`}
      >
        Prenota Ora
      </Link>
    </Card>
    
  );
}