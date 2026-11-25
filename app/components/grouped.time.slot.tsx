import { useEffect, useState, type FC } from "react";
import type { ClubCourtDto } from "~/client/model/common/ClubCourtDto";
import { Button } from "./ui/button";

interface TimeSlot {
    date: string;
    time: string;
    availableCourts: ClubCourtDto[];
}

const formatLocalDate = (date: Date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
].join("-");

export const GroupedTimeSlot: FC<{
  opening: string,
  closing: string,
  durationMinutes: number,
  selectedDateStr: string,
  courts: ClubCourtDto[];
  isLoadingBookings: boolean;
  onSelect: (time: string, availableCourts: ClubCourtDto[], slotDate: string) => void;
}> = ({ opening, closing, durationMinutes, selectedDateStr, isLoadingBookings, courts, onSelect }) => {
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

        const openingTime = new Date(year, month - 1, day, openHour, openMinute, 0, 0);
        const closingTime = new Date(year, month - 1, day, closeHour, closeMinute, 0, 0);
        if (closingTime <= openingTime) closingTime.setDate(closingTime.getDate() + 1);

        const slotsByStartTime = new Map<string, TimeSlot>();

        for (const court of courts) {
            const current = new Date(openingTime);
            current.setMinutes(current.getMinutes() + (court.offsetMinutes ?? 0));

            while (current < closingTime) {
                const slotEnd = new Date(current);
                slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

                if (slotEnd <= closingTime) {
                    const date = formatLocalDate(current);
                    const time = `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`;
                    const slotKey = `${date}T${time}`;
                    const slot = slotsByStartTime.get(slotKey) ?? {
                        date,
                        time,
                        availableCourts: [],
                    };

                    if (current > now) slot.availableCourts.push(court);
                    slotsByStartTime.set(slotKey, slot);
                }

                current.setMinutes(current.getMinutes() + durationMinutes);
            }
        }

        setSlots(Array.from(slotsByStartTime.values())
            .sort((first, second) => `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`)));
    }, [opening, closing, durationMinutes, selectedDateStr, courts, now]);

    return (
        <div className="max-h-[170px] md:max-h-none overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map(slot => {
                return <Button
                    key={`${slot.date}T${slot.time}`}
                    disabled={isLoadingBookings || slot.availableCourts.length === 0}
                    variant="outline"
                    className={`h-auto py-2 px-3 flex flex-col items-center justify-center gap-1 w-full overflow-hidden border-foreground hover:border-primary bg-background`}
                    onClick={() => onSelect(slot.time, slot.availableCourts, slot.date)}
                >
                    <span className={`text-base font-bold leading-tight text-foreground`}>{slot.time}</span>
                </Button>
            })}
        </div>
        
    );
};