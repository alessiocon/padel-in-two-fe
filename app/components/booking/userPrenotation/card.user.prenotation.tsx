import React from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, Timer, UserRoundCheck, Info} from "lucide-react";
import { dateHelper } from "../../../helper/dateHelper";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
interface CardUserPrenotationProps {
    bookingState: [BookingQuickResDto, React.Dispatch<React.SetStateAction<BookingQuickResDto[] | null>>];
    onDelete: (booking: BookingQuickResDto) => void;
}

export const CardUserPrenotation: React.FC<CardUserPrenotationProps> = ({ 
    bookingState,
    onDelete, 
}) => {
    const [booking] = bookingState;

    const renderStatusBadge = (status: string) => {
        const baseClasses = "text-xs px-2.5 py-1 rounded-full font-medium border";

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
                label: "In attesa di conferma",
                classes: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            },
            cancelled: {
                label: "Annullato",
                classes: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            },
        };

        const currentStatus = statusConfig[status?.toLowerCase()];

        if (!currentStatus) {
            return (
                <span className={`${baseClasses} bg-muted text-muted-foreground border-border`}>
                    {status}
                </span>
            );
        }

        return (
            <span className={`${baseClasses} ${currentStatus.classes}`}>
                {currentStatus.label}
            </span>
        );
    };

    const colorUserWarning = booking.nPlayer < 4 ?"text-destructive" : "text-primary"
    return (
        <div className="flex flex-col p-5 bg-card border border-border/60 shadow-md gap-5 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                            {dateHelper.formatDate(booking.startsAt)}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            {booking.isCourtIndoor ? (
                                <DoorOpen className="h-4 w-4 text-primary" />
                            ) : (
                                <DoorClosed className="h-4 w-4 text-primary" />
                            )}
                            {booking.isCourtIndoor ? "Indoor" : "Outdoor"}
                        </span>
                    </div>

                    <h3 className="font-bold text-lg leading-tight mt-0.5">
                        {booking.courtName || "Campo da Padel"}
                    </h3>

                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Timer className="h-4 w-4 text-primary" />
                        {dateHelper.formatTime(booking.startsAt)} - {dateHelper.formatTime(booking.endsAt)}
                    </div>

                    <div className={"flex items-center gap-2 text-sm font-semibold "+colorUserWarning }>
                        <UserRoundCheck className="h-4 w-4"/>player: {booking.nPlayer}
                    </div>

                    <div className={"flex items-center gap-2 text-sm font-semibold"}>
                        <Link to={`/booking/${booking.id}`}>
                            <Info className="h-4 w-4"/> Info
                        </Link>
                    </div>
                </div>

                <div>
                    
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                    {renderStatusBadge(booking.status)}
                </div>
            </div>
        </div>
    );
};