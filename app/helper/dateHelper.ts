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

    static generateTimeSlots(
        opening: string,
        closing: string,
        durationMinutes: number,
        selectedDateStr: string
    ): string[] {
        const slots: string[] = [];
        const [openHour, openMin] = opening.split(":").map(Number);
        const [closeHour, closeMin] = closing.split(":").map(Number);

        // Data e ora attuale
        const now = new Date();

        // Parsing della data selezionata dall'utente in ora locale
        const [year, month, day] = selectedDateStr.split("-").map(Number);
        const isToday =now.toISOString().slice(0,10) === selectedDateStr
        
        // Impostiamo l'orario di inizio e fine per il giorno selezionato
        const current = new Date(year, month - 1, day, openHour, openMin, 0, 0);
        const end = new Date(year, month - 1, day, closeHour, closeMin, 0, 0);

        while (current < end) {
        // Se la prenotazione è per OGGI, escludiamo gli slot con orario di inizio già passato
        if (!isToday || current > now) {
            const hours = String(current.getHours()).padStart(2, "0");
            const minutes = String(current.getMinutes()).padStart(2, "0");
            slots.push(`${hours}:${minutes}`);
        }

        // Avanza allo slot successivo
        current.setMinutes(current.getMinutes() + durationMinutes);
        }

        return slots;
    }
}