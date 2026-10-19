import { useEffect, useState, type FC } from "react";
import type { ClubCourtDto } from "~/client/model/common/ClubCourtDto";
import { Button } from "./ui/button";

interface TimeSlot {
    time: string;
    availableCourts: ClubCourtDto[];
}

export const GroupedTimeSlot: FC<{
  opening: string,
  closing: string,
  durationMinutes: number,
  selectedDateStr: string,
  selectedSlotStr: string | null,
  courts: ClubCourtDto[];
  isLoadingBookings: boolean;
  onSelect: (time: string, availableCourts: ClubCourtDto[]) => void;
}> = ({ opening, closing, durationMinutes, selectedDateStr, selectedSlotStr, isLoadingBookings, courts, onSelect }) => {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const intervalId = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const [year, month, day] = selectedDateStr.split("-").map(Number);
        const [openHour, openMinute] = opening.split(":").map(Number);
        const [closeHour, closeMinute] = closing.split(":").map(Number);
        if ([year, month, day, openHour, openMinute, closeHour, closeMinute].some(Number.isNaN) || durationMinutes <= 0) {
            setSlots([]);
            return;
        }

        const selectedDay = new Date(year, month - 1, day);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isFutureDate = selectedDay > today;
        const isToday = selectedDay.getTime() === today.getTime();
        const openingTime = new Date(year, month - 1, day, openHour, openMinute, 0, 0);
        const closingTime = new Date(year, month - 1, day, closeHour, closeMinute, 0, 0);
        const availableCourtsByTime = new Map<string, ClubCourtDto[]>();

        for (const court of courts) {
            const current = new Date(openingTime);
            current.setMinutes(current.getMinutes() + (court.offsetMinutes ?? 0));

            while (current < closingTime) {
                const slotEnd = new Date(current);
                slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

                if (slotEnd <= closingTime) {
                    const time = `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`;
                    if (!availableCourtsByTime.has(time)) availableCourtsByTime.set(time, []);

                    const isNotPast = isFutureDate || (isToday && current > now);
                    if (isNotPast) availableCourtsByTime.get(time)?.push(court);
                }

                current.setMinutes(current.getMinutes() + durationMinutes);
            }
        }

        setSlots(Array.from(availableCourtsByTime, ([time, availableCourts]) => ({ time, availableCourts }))
            .sort((first, second) => first.time.localeCompare(second.time)));
    }, [opening, closing, durationMinutes, selectedDateStr, courts, now]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map(slot => {
                const isSelected = selectedSlotStr === slot.time ;
                return <Button
                    key={slot.time}
                    disabled={isLoadingBookings || slot.availableCourts.length === 0}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto py-2 px-3 flex flex-col items-center justify-center gap-1 w-full overflow-hidden${
                        isSelected ? "ring-2 ring-primary" : "hover:border-primary"
                        }`}
                    onClick={() => onSelect(slot.time, slot.availableCourts)}
                >
                    <span className={`text-base font-bold leading-tight ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>{slot.time}</span>
                </Button>
            })}
        </div>
        
    );
};