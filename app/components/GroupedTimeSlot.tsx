import { useEffect, useState, type FC } from "react";
import type { ClubCourtDto } from "~/client/model/common/ClubCourtDto";
import { Button } from "./ui/button";

export const GroupedTimeSlot: FC<{
  opening: string,
  closing: string,
  durationMinutes: number,
  selectedDateStr: string,
  selectedSlotStr: string | null,
  courts: ClubCourtDto[];
  isLoadingBookings: boolean;
  onSelect: (time: string, availableCourts: ClubCourtDto[]) => void;
}> = ({ opening, closing, durationMinutes, selectedDateStr,selectedSlotStr, isLoadingBookings, courts, onSelect}) => {
    const [slots, setSlots] = useState<Array<{ time: string; availableCourts: ClubCourtDto[] }>>([]);

    useEffect(() => {
        const [openHour, openMin] = opening.split(":").map(Number);
        const [closeHour, closeMin] = closing.split(":").map(Number);
        
        const now = new Date();
        const [year, month, day] = selectedDateStr.split("-").map(Number);
        const isToday = now.toISOString().slice(0, 10) === selectedDateStr;

        const baseOpen = new Date(year, month - 1, day, openHour, openMin, 0, 0);
        const baseEnd = new Date(year, month - 1, day, closeHour, closeMin, 0, 0);

        const timeSlotsMap = new Map<string, Array<typeof courts[0]>>();

        for (const court of courts) {
            const current = new Date(baseOpen.getTime());
            // Applichiamo l'offset del singolo campo
            current.setMinutes(current.getMinutes() + (court.offsetMinutes ?? 0));

            // Finché l'orario di inizio è precedente alla chiusura
            while (current < baseEnd) {
                // Calcoliamo quando finirebbe questo slot
                const slotEnd = new Date(current.getTime());
                slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

                // IL CONTROLLO CHIAVE: Lo slot è valido SOLO SE la sua fine 
                // non supera l'orario di chiusura del circolo
                if (slotEnd <= baseEnd) {
                    // Se la data è oggi, scartiamo gli orari già passati
                    if (!isToday || current > now) {
                        const hours = String(current.getHours()).padStart(2, "0");
                        const minutes = String(current.getMinutes()).padStart(2, "0");
                        const timeString = `${hours}:${minutes}`;

                        if (!timeSlotsMap.has(timeString)) {
                            timeSlotsMap.set(timeString, []);
                        }
                        timeSlotsMap.get(timeString)!.push(court);
                    }
                }

                // Avanza dello slot duration standard del circolo
                current.setMinutes(current.getMinutes() + durationMinutes);
            }
        }

        // Convertiamo la Map in un array ordinato per orario
        const sortedTimes = Array.from(timeSlotsMap.keys()).sort();
        setSlots(sortedTimes.map(time => ({ time, availableCourts: timeSlotsMap.get(time)!})));
    }, [])

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map(slot => {
                const isSelected = selectedSlotStr === slot.time ;
                return <Button
                    key={slot.time}
                    disabled={isLoadingBookings}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto py-2 px-3 flex flex-col items-center justify-center gap-1 transition-all w-full overflow-hidden${
                        isSelected ? "ring-2 ring-primary" : "hover:border-primary"
                        }`}
                    onClick={() => onSelect(slot.time, slot.availableCourts)}
                >
                    <span className={`text-[10px] w-full truncate text-center ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {slot.availableCourts.map((m) => m.name).join(", ")}
                    </span>
                    <span className={`text-base font-bold leading-tight ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>{slot.time}</span>
                    <span className={`text-[10px] leading-tight ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {durationMinutes} min
                    </span>
                </Button>
            })}
        </div>
        
    );


//   return (
//     <button
//       key={court.id}
//       disabled={court.isOccupied}
//       onClick={() => {
//         if (!court.isOccupied) {
//           onSelect(court);
//           onClose();
//         }
//       }}
//       className={`p-3 sm:p-4 rounded-lg border transition-all flex flex-col justify-between gap-4 text-left w-full overflow-hidden ${
//         court.isOccupied
//           ? "border-destructive/30 bg-destructive/5 cursor-not-allowed opacity-60 text-muted-foregroun"
//           : "border-border bg-background hover:border-primary hover:bg-primary/5 active:scale-[0.98] text-foreground"
//       }`}
//     >
//       {/* Sezione superiore: Icona e Nome */}
//       <div className="flex items-center gap-2 min-w-0">
//         {court.isIndoor 
//           ? <DoorClosed className="h-5 w-5 shrink-0 text-primary"/>
//           : <DoorOpen className="h-5 w-5 shrink-0 text-primary"/>
//         }
//         <span className={"font-bold text-xs sm:text-sm truncate"}>
//           {court.name}
//         </span>
//       </div>

//       {/* Sezione inferiore: Prezzo e Badge */}
//       <div className="flex items-center justify-between pt-1.5 border-t border-border text-[11px] sm:text-[12px] w-full gap-1">
//         <span className="font-extrabold truncate">
//           € {court.price?.toFixed(2)}
//         </span>

//         {court.isOccupied ? (
//           <Badge
//             variant="outline"
//             className="text-[9px] px-1.5 py-0 border-destructive/40 bg-destructive/10 text-destructive shrink-0"
//           >
//             Occupato
//           </Badge>
//         ) : (
//           <Badge
//             variant="outline"
//             className="text-[9px] px-1.5 py-0 border-emerald-500/40 bg-emerald-500/10 text-emerald-500 shrink-0"
//           >
//             Disponibile
//           </Badge>
//         )}
//       </div>
//     </button>
//   );
};