import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { BookingIcon } from "./BookingIcon";
import type { CalendarBookingResDto } from "~/client/model/response/calendar.booking.res.dto";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { BadgeX, Crown, Timer } from "lucide-react";
import { BookingStatus } from "~/client/model/common/Enum/booking.status.dto";

interface CalendarBookingDialogProps {
  isOpen: boolean;
  day: number | null;
  month: number;
  year: number;
  bookings: CalendarBookingResDto[];
  onClose: () => void;
}

export function CalendarBookingDialog({
  isOpen,
  day,
  month,
  year,
  bookings,
  onClose,
}: CalendarBookingDialogProps) {
  const navigate = useNavigate();

  const handleBookingClick = (bookingId: string) => {
    onClose();
    navigate(`/booking/${bookingId}`);
  };

  const dateStr =
    day && new Date(year, month, day).toLocaleDateString("it-IT");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-2 py-8">
        <DialogHeader>
          <DialogTitle>Prenotazioni del {dateStr}</DialogTitle>
          <DialogDescription>
            Numero prenotazioni: {bookings.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-3 bg-card border border-border"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm">{booking.clubName}</p>
                  <BookingIcon status={booking.status} isWinner={booking.isPlayer ? booking.win : null} className="w-4 h-4" />
              </div>

              <div className="text-xs  mb-3 space-y-1">
                <div className="flex justify-between my-2">
                  <p>
                    {new Date(booking.startsAt).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(booking.endsAt).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    {booking.price.toFixed(2)} €
                  </p>
                </div>

                 {booking.isPlayer && booking.status === BookingStatus.END 
                  ? booking.win 
                    ? <p className="text-primary"><Crown className="w-4 h-4 inline mb-1 mr-1" />Vinta</p>
                    : <p className="text-destructive"><BadgeX className="w-4 h-4 inline mb-1 mr-1" /> Persa</p>
                  :null
                }
                  
                {booking.status === BookingStatus.END && (
                  <div className="grid grid-rows-3 items-center text-center mt-3">
                      <p className="border-t border-border border-foreground overflow-hidden text-ellipsis whitespace-nowrap">{booking.team1}</p>
                      <p className="py-1">{booking.setTeam1} - {booking.setTeam2}</p>
                      <p className="border-b border-border border-foreground overflow-hidden text-ellipsis whitespace-nowrap">{booking.team2}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleBookingClick(booking.id)}
                size="sm"
                className="w-full text-xs"
              >
                Visualizza dettagli
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

