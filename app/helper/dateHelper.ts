
export class dataHelper {

    
    static formatDate(dateString: string) : string {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString.split("T")[0] || dateString;
        return d.toISOString().split("T")[0];
    };

    static formatTime(dateString: string) : string {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };


    // static getSlotsGroupedByTime(
    //     opening: string,
    //     closing: string,
    //     durationMinutes: number,
    //     selectedDateStr: string,
    //     courts: ClubCourtDto[]
    // ): Array<{ time: string; availableCourts: ClubCourtDto[] }> {
    //     const [openHour, openMin] = opening.split(":").map(Number);
    //     const [closeHour, closeMin] = closing.split(":").map(Number);
        
    //     const now = new Date();
    //     const [year, month, day] = selectedDateStr.split("-").map(Number);
    //     const isToday = now.toISOString().slice(0, 10) === selectedDateStr;

    //     const baseOpen = new Date(year, month - 1, day, openHour, openMin, 0, 0);
    //     const baseEnd = new Date(year, month - 1, day, closeHour, closeMin, 0, 0);

    //     const timeSlotsMap = new Map<string, Array<typeof courts[0]>>();

    //     for (const court of courts) {
    //         const current = new Date(baseOpen.getTime());
    //         // Applichiamo l'offset del singolo campo
    //         current.setMinutes(current.getMinutes() + (court.offsetMinutes ?? 0));

    //         // Finché l'orario di inizio è precedente alla chiusura
    //         while (current < baseEnd) {
    //             // Calcoliamo quando finirebbe questo slot
    //             const slotEnd = new Date(current.getTime());
    //             slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

    //             // IL CONTROLLO CHIAVE: Lo slot è valido SOLO SE la sua fine 
    //             // non supera l'orario di chiusura del circolo
    //             if (slotEnd <= baseEnd) {
    //                 // Se la data è oggi, scartiamo gli orari già passati
    //                 if (!isToday || current > now) {
    //                     const hours = String(current.getHours()).padStart(2, "0");
    //                     const minutes = String(current.getMinutes()).padStart(2, "0");
    //                     const timeString = `${hours}:${minutes}`;

    //                     if (!timeSlotsMap.has(timeString)) {
    //                         timeSlotsMap.set(timeString, []);
    //                     }
    //                     timeSlotsMap.get(timeString)!.push(court);
    //                 }
    //             }

    //             // Avanza dello slot duration standard del circolo
    //             current.setMinutes(current.getMinutes() + durationMinutes);
    //         }
    //     }

    //     // Convertiamo la Map in un array ordinato per orario
    //     const sortedTimes = Array.from(timeSlotsMap.keys()).sort();

    //     return sortedTimes.map(time => ({
    //         time,
    //         availableCourts: timeSlotsMap.get(time)!
    //     }));
    // }
}

