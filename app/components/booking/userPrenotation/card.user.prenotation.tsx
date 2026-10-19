import React from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, Timer, UserRoundCheck, Info} from "lucide-react";
import { dateHelper } from "../../../helper/dateHelper";
import { buttonVariants } from "../../ui/button";
import { BookingStatusBadge } from "../../budge/booking.status.badge";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
interface CardUserPrenotationProps {
    bookingState: [BookingQuickResDto, React.Dispatch<React.SetStateAction<BookingQuickResDto[] | null>>];
}

export const CardUserPrenotation: React.FC<CardUserPrenotationProps> = ({ 
    bookingState,
}) => {
    const [booking] = bookingState;

    const colorUserWarning = booking.nPlayer < 4 ? "text-destructive" : "text-primary"
    return (
        <div className="flex flex-col p-2 bg-card border border-border/60 shadow-md gap-5 transition-colors">
            <div className="flex flex-col gap-1.5">
                <div className="text-right">
                    <BookingStatusBadge status={booking.status} />
                </div>
                <h3 className="font-bold text-sx mb-0.5 ">
                        {booking.clubName || "Campo da Padel"}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                        {dateHelper.formatDate(booking.startsAt)} 
                    </span>
                    <span className="flex gap-1 text-xs font-semibold px-1 py-0.5 bg-primary/10 text-primary border border-primary/20 text-sm font-semibold text-foreground">
                        <Timer className="h-4 w-4 text-primary" /> {dateHelper.formatTime(booking.startsAt)} - {dateHelper.formatTime(booking.endsAt)}
                    </span>
                </div>

                <div className={"flex items-center gap-2 text-sm font-semibold "+colorUserWarning }>
                    <UserRoundCheck className="h-4 w-4"/>player: {booking.nPlayer} / 4
                </div>

                <div className={"text-right"}>
                    <Link to={`/booking/${booking.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                        <Info className="h-4 w-4" /> Info
                    </Link>
                </div>
            </div>
        </div>
    );
};