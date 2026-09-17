import React from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, MapPin, Timer } from "lucide-react";
import type { BookingUserResDto } from "./../Client/Model/Response/BookingUserResDto";
import { DataHelper } from "./../Helper/DateHelper";
import { Button } from "./../components/ui/button";
import { BookingStatus } from "~/Client/Model/Common/Enum/BookingStatusDto";

interface BookingCardProps {
  booking: BookingUserResDto;
  onDelete: (booking: BookingUserResDto) => void;
}

export const CardBookingUser: React.FC<BookingCardProps> = ({ booking, onDelete }) => {
  // Helper per rendere il badge di stato
  const renderStatusBadge = (status: string) => {
    const baseClasses = "text-xs px-2.5 py-1 rounded-full font-medium border";

    const statusConfig: Record<string, { label: string; classes: string }> = {
      confirmed: {
        label: "Confermato",
        classes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      },
      reserved: {
        label: "Riservato",
        classes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      },
      pending: {
        label: "In attesa",
        classes: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      },
      cancelled: {
        label: "Annullato",
        classes: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      },
    };

    const currentStatus = statusConfig[status?.toLowerCase()];

    if (!currentStatus) {
      return (
        <span className={`${baseClasses} bg-muted text-muted-foreground border-border`}>
          {status}
        </span>
      );
    }

    return (
      <span className={`${baseClasses} ${currentStatus.classes}`}>
        {currentStatus.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-muted/50 border border-border gap-4 hover:border-primary/40 transition-colors">
      {/* Blocco Sinistro: Data, Nome, Posizione e Orario */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {DataHelper.FormatDate(booking.startsAt)}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {booking.isIndoor ? (
              <DoorOpen className="h-4 w-4 text-primary" />
            ) : (
              <DoorClosed className="h-4 w-4 text-primary" />
            )}
          </span>
        </div>

        <h3 className="font-bold text-base leading-tight mt-0.5">
          {booking.courtName}
        </h3>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4 text-primary" /> {booking.position}
        </p>

        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mt-1">
          <Timer className="h-4 w-4 text-primary" />{" "}
          {DataHelper.FormatTime(booking.startsAt)} -{" "}
          {DataHelper.FormatTime(booking.endsAt)}
        </div>
      </div>

      {/* Blocco Destro: Status, Visualizza e Elimina */}
      <div className="flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 border-border pt-3 md:pt-0">
        <div className="flex items-center gap-2 justify-between md:justify-end w-full">
          {renderStatusBadge(booking.status)}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link to={`/clubs/${booking.clubId}`}>
             <Button className="inline-flex items-center justify-center text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm" 
                variant="default">Visualizza campo</Button>
          </Link>

          <Button
            disabled={booking.status === BookingStatus.CANCELLED}
            type="button"
            onClick={(e) => {e.preventDefault(); onDelete(booking)}}
            className="inline-flex items-center justify-center text-xs font-semibold px-3 py-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
          >
            Elimina
          </Button>
        </div>
      </div>
    </div>
  );
};