import {DateTime} from "luxon";
export class dateHelper {

    
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

    static GetTimeZone(time : string, timezone: string ) : Date {
        const timeZone = DateTime.fromISO(time, { zone: timezone });
        if (!timeZone.isValid) {
          throw new Error(`Invalid date/time format: ${time}`);
        }

        return timeZone.toJSDate()
    }

    
}

