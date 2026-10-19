import { CheckCircle2, RotateCcw, XCircle, Info, Timer} from "lucide-react";
import { bookingStatus } from "../../../client/model/common/Enum/booking.status.dto";
import type { BookingQuickResDto } from "../../../client/model/response/booking.quick.res.dto";
import { Button, buttonVariants } from "../../ui/button";
import { Link } from "react-router";
import { BookingStatusBadge } from "../../budge/booking.status.badge";
import { dateHelper } from "~/helper/dateHelper";

interface BookingNotificationRawProps {
    booking: BookingQuickResDto;
    isSubmitting: boolean;
    onAccept: () => void;
    onCancel: () => void;
    onRestore: () => void;
}

export function BookingNotificationRaw({ booking, isSubmitting, onAccept, onCancel, onRestore }: BookingNotificationRawProps) {
    const isCancelled = booking.status === bookingStatus.CANCELLED;

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border transition-colors gap-3 p-1.5 ${
            isCancelled
                ? "bg-muted/20 border-border/50 opacity-75"
                : "bg-background/50 border-border hover:bg-muted/40"
        }`}>
            <div className="p-1">

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary border border-primary/20">
                        {dateHelper.formatDate(booking.startsAt)} 
                    </span>
                    <span className="flex gap-1 text-xs font-semibold px-1 py-1 bg-primary/10 text-primary border border-primary/20 text-sm font-semibold text-foreground">
                        <Timer className="h-4 w-4 text-primary" /> {dateHelper.formatTime(booking.startsAt)} - {dateHelper.formatTime(booking.endsAt)}
                    </span>
                    <BookingStatusBadge status={booking.status}/>
                </div>

                <div className="pt-2">
                    <p className="font-bold text-sm flex items-center gap-1">
                        {booking.courtName || booking.courtId || "Campo Sconosciuto"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {booking.description || "Nessun dettaglio specificato"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 justify-center">
                <div className="flex gap-1">
                    {booking.status === bookingStatus.PENDING && (
                        <Button
                            size="xs"
                            variant="default"
                            disabled={isSubmitting}
                            onClick={onAccept}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accetta
                        </Button>
                    )}
                    
                    {isCancelled ? (
                        <Button
                            size="xs"
                            variant="default"
                            disabled={isSubmitting}
                            onClick={onRestore}
                        >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Ripristina
                        </Button>
                    ) : (
                        <Button
                            size="xs"
                            variant="destructive"
                            disabled={isSubmitting}
                            onClick={onCancel}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Annulla
                        </Button>
                    )}
                    <Link to={`/booking/${booking.id}`} className={buttonVariants({ variant: "secondary", size: "xs" })}>
                        <Info className="h-4 w-4" /> Info
                    </Link>
                </div>
            </div>
        </div>
    );
}
