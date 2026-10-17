import { CheckCircle2, Calendar, Clock, RotateCcw, XCircle, Info} from "lucide-react";
import { bookingStatus } from "../../../client/model/common/Enum/booking.status.dto";
import type { BookingQuickResDto } from "../../../client/model/response/booking.quick.res.dto";
import { Button } from "../../ui/button";
import { Link } from "react-router";

interface BookingNotificationRawProps {
    booking: BookingQuickResDto;
    isSubmitting: boolean;
    onAccept: () => void;
    onCancel: () => void;
    onRestore: () => void;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
    confirmed: {
        label: "Confermato",
        classes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    reserved: {
        label: "Riservato",
        classes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    pending: {
        label: "In attesa",
        classes: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    cancelled: {
        label: "Annullato",
        classes: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
};

export function BookingNotificationRaw({ booking, isSubmitting, onAccept, onCancel, onRestore }: BookingNotificationRawProps) {
    const isCancelled = booking.status === bookingStatus.CANCELLED;
    const status = statusConfig[booking.status.toLowerCase()];
    const timeString = new Date(booking.startsAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between  rounded-lg border transition-colors gap-3 ${
            isCancelled
                ? "bg-muted/20 border-border/50 opacity-75"
                : "bg-background/50 border-border hover:bg-muted/40"
        }`}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-l-md rounded-r-none bg-primary/10 text-primary font-mono font-bold text-sm items-center gap-1 shrink-0">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.startsAt.split("T")[0]}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeString}
                    </div>
                </div>
                <div>
                    <p className="font-bold text-sm flex items-center gap-2">
                        {booking.courtName || booking.courtId || "Campo Sconosciuto"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {booking.description || "Nessun dettaglio specificato"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                    </p>
                </div>
                <div className="font-bold text-sm items-end">
                    
                </div>
            </div>

            <div className="flex items-center gap-1 justify-between sm:justify-end shrink-0">
                {booking.status !== bookingStatus.PENDING &&  
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${status?.classes ?? "bg-muted text-muted-foreground border-border"}`}>
                        {status?.label ?? booking.status}
                    </span> 
                }
                <div className="flex items-center gap-0.5 border-l border-border pl-3">
                    {booking.status === bookingStatus.PENDING && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-emerald-600 hover:bg-emerald-500/10 font-semibold"
                            disabled={isSubmitting}
                            onClick={onAccept}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accetta
                        </Button>
                    )}
                    
                    {isCancelled ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 font-semibold"
                            disabled={isSubmitting}
                            onClick={onRestore}
                        >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Ripristina
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
                            disabled={isSubmitting}
                            onClick={onCancel}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Annulla
                        </Button>
                    )}
                    <Link className={"flex items-center gap-2 text-sm font-semibold pr-3"} to={`/booking/${booking.id}`}> <Info className="h-4 w-4"/> Info</Link>
                </div>
            </div>
        </div>
    );
}
