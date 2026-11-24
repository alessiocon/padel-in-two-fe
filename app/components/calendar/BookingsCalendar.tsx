import { useEffect, useState } from "react";
import { apiClient } from "~/client/apiClient";
import type { CalendarBookingResDto } from "~/client/model/response/calendar.booking.res.dto";
import type { SearchBookingQueryDto } from "~/client/model/request/search.booking.query.dto";
import { MonthYearPicker } from "./MonthYearPicker";
import { CalendarDay } from "./CalendarDay";
import { CalendarBookingDialog } from "./CalendarBookingDialog";
import { Card, CardHeader, CardTitle } from "../ui/card";

export function BookingsCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [bookings, setBookings] = useState<CalendarBookingResDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayBookings, setSelectedDayBookings] = useState<
    CalendarBookingResDto[]
  >([]);

  useEffect(() => {
    async function fetchBookings() {
      setIsLoading(true);
      try {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        const from = monthStart.toISOString().split("T")[0];
        const to = monthEnd.toISOString().split("T")[0];

        const query: SearchBookingQueryDto = { from, to };
        const response = await apiClient.getCalendarBookings(query);

        if (response.IsSuccess && response.Data) {
          setBookings(response.Data);
        }
      } catch (error) {
        console.error("Errore nel caricamento delle prenotazioni:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, [month, year]);

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => {
    const day = new Date(y, m, 1).getDay();
    // Converte: Domenica (0) → 6, Lunedì (1) → 0, ..., Sabato (6) → 5
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const daysInPrevMonth = getDaysInMonth(month - 1, year);

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const getBookingsForDay = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startsAt).toISOString().split("T")[0];
      return bookingDate === dateStr;
    });
  };

  const handleDayClick = (day: number, dayBookings: CalendarBookingResDto[]) => {
    setSelectedDay(day);
    setSelectedDayBookings(dayBookings);
    setPopupOpen(true);
  };

  const calendarDays = [];

  // Giorni del mese precedente (per completare la settimana da lunedì)
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }

  // Giorni del mese corrente
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }

  // Giorni del prossimo mese (per completare l'ultima settimana)
  const remainingDays = 42 - calendarDays.length; // 6 righe * 7 giorni
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }


  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  return (
    <>
      <Card className="mt-5 py-5 md:p-6 pb-2 md:mx-0 gap-0">
        <CardHeader className="px-2">
          <CardTitle className="text-lg font-bold mb-2">Calendario Prenotazioni</CardTitle>
          <MonthYearPicker
            month={month}
            year={year}
            onMonthChange={handleMonthChange}
          />
        </CardHeader>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Caricamento prenotazioni...
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            {/* Griglia calendario con grid template columns */}
            <div className="w-full px-2 md:px-0 my-4">
              <div className="w-full grid gap-1 md:gap-2" style={{gridTemplateColumns: "repeat(7, 1fr)"}}>
                  {weekDays.map((day) => (
                    <div
                      key={`header-${day}`}
                      className="text-center text-xs md:text-sm font-semibold flex items-end justify-center mb-2"
                    >
                      {day}
                    </div>
                  ))}
              </div>
              <div
                className="w-full grid gap-1 md:gap-2"
                style={{
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gridAutoRows: "minmax(100px, 100px)",
                }}
              >
                {calendarDays.map((dayObj, index) => (
                  <CalendarDay
                    key={index}
                    day={dayObj.isCurrentMonth ? dayObj.day : null}
                    bookings={
                      dayObj.isCurrentMonth ? getBookingsForDay(dayObj.day!) : []
                    }
                    onDayClick={handleDayClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <CalendarBookingDialog
        isOpen={popupOpen}
        day={selectedDay}
        month={month}
        year={year}
        bookings={selectedDayBookings}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}
