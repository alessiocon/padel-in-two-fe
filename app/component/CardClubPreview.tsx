import { Link } from "react-router";
import { MapPin, CalendarClock, Timer, DoorClosed, DoorOpen } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { ClubsResDto } from "~/Client/Model/Response/ClubsResDto";

interface CardClubPreviewProps {
  club: ClubsResDto;
}

export function CardClubPreview({ club }: CardClubPreviewProps) {

  return (
    <Card className="w-[350px] bg-card border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">{club.name}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs pt-1">
          <span className="flex items-top gap-1 font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {club.position}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <CardDescription className="flex items-center gap-2 text-xm">
          <span className="flex items-center gap-1 font-medium">
            <CalendarClock className="h-3.5 w-3.5 text-primary" />
            {club.openingTime} - {club.closingTime}
          </span>
          /
          <span className="flex items-center gap-1 font-medium">
            <Timer className="h-3.5 w-3.5 text-primary" /> {club.slotDurationMinutes}m
          </span>
        </CardDescription>

        <CardDescription className="flex items-center gap-2 text-xm">
          <span className="font-medium text-muted-foreground pt-1">Campi:</span>
          {club.courtsInDoor > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <DoorClosed className="h-3.5 w-3.5 text-primary" />
              {club.courtsInDoor}
            </span>
          )}
          {club.courtsOutDoor > 0 && (
            <span className="flex items-center gap-1 font-medium">
              <DoorOpen className="h-3.5 w-3.5 text-primary" />
              {club.courtsOutDoor}
            </span>
          )}
        </CardDescription>
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Campo</span>
          <span className="font-bold text-base">€ {club.averagePrice}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Pala</span>
          <span className="font-bold text-base">€ {club.racketPrice}</span>
        </div>

        <Link to={`/clubs/${club.id}`}>
          <Button variant="default">Prenota Ora</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}