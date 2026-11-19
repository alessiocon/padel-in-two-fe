import { BookingIcon } from "./BookingIcon";
import type { CalendarBookingResDto } from "~/client/model/response/calendar.booking.res.dto";

interface CalendarDayProps {
  day: number | null;
  isCurrentMonth: boolean;
  bookings: CalendarBookingResDto[];
  onDayClick?: (day: number, bookings: CalendarBookingResDto[]) => void;
}

export function CalendarDay({
  day,
  isCurrentMonth,
  bookings,
  onDayClick,
}: CalendarDayProps) {
  const handleClick = () => {
    if (day && isCurrentMonth && onDayClick) {
      onDayClick(day, bookings);
    }
  };

  if (day === null) {
    return <div className="bg-muted/30 rounded-lg w-full h-full" />;
  }

  return (
    <div
      onClick={handleClick}
      className={`rounded-lg border border-border p-2 flex flex-col gap-1 w-full h-full ${
        isCurrentMonth
          ? "bg-card text-card-foreground hover:bg-muted/50 cursor-pointer transition-colors"
          : "bg-muted/30 text-muted-foreground"
      }`}
    >
      <div className="text-sm font-semibold">{day}</div>
      <div className="overflow-hidden flex-1 leading-none">
        {bookings.map((booking, index) => (


          <span key={`${booking.id}-${index}`} title={`${booking.clubName} - ${index}`} className="inline">
            <BookingIcon status={booking.status} className="w-4 h-4 inline" isWinner={booking.isPlayer ? booking.win : null} />
          </span>
        ))}
      </div>
    </div>
  );
}
