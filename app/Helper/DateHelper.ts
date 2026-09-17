export class DataHelper {

    
    static FormatDate(dateString: string) : string {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString.split("T")[0] || dateString;
        return d.toISOString().split("T")[0];
    };

    static FormatTime(dateString: string) : string {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
}