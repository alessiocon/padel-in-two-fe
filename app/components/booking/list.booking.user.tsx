import { useContext, useState } from "react";
import { AuthContext } from "../../store/context";
import { Skeleton } from "../ui/skeleton";
import { CardBookingUser } from "../../component/CardBookingUser";
import type { IDeleteBookingDialogProps } from "../dialog/delete.booking.dialog";
import DeleteBookingDialog from "../dialog/delete.booking.dialog";
import type { BookingResDto } from "../../client/model/response/booking.res.dto";
import type { BookingUserResDto } from "../../client/model/response/BookingUserResDto";

export interface IInfoBookingClubProps {
    bookingsState: [BookingUserResDto[] | null,React.Dispatch<React.SetStateAction<BookingUserResDto[] | null>>],
    isLoadingBookingsState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}


export function ListBookingUser({
    bookingsState, 
    isLoadingBookingsState,
} :  IInfoBookingClubProps) {
    const [auth, setAuth] = useContext(AuthContext);
    const [bookings, setBookings] = bookingsState;
    const [isLoadingBookings, setIsLoadingBookings] = isLoadingBookingsState


    const [deleteBookingDialog, setdeleteBookingDialog] = useState<IDeleteBookingDialogProps | null>(null);
    const [openBookingDialog, setOpenBookingDialog] = useState<boolean>(false);

    return (<>
        <section className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <h2 className="text-lg font-bold">Le Mie Prenotazioni</h2>
                {isLoadingBookings || bookings == null  ? (
                    <Skeleton className="h-4 w-16" />
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Totale: {bookings.length}
                    </span>
                )}
            </div>

            {isLoadingBookings || bookings == null ? (
                /* Skeleton List: Simula 3 card prenotazione */
                <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                    key={`booking-skeleton-${index}`}
                    className="p-4 rounded-lg border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                    {/* Info Prenotazione */}
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-3 w-32" />
                    </div>

                    {/* Azioni / Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
                    </div>
                    </div>
                ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                    Nessuna prenotazione trovata.
                </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                {bookings.map((booking) => (
                    <CardBookingUser
                        key={booking.id}
                        booking={booking}
                        onDelete={(e) => {
                            setdeleteBookingDialog({
                                booking: booking,
                                setBookings: setBookings,
                                });
                            setOpenBookingDialog(true);
                        }}
                    />
                ))}
                </div>
            )}
            </section>
            {openBookingDialog && deleteBookingDialog && 
            <DeleteBookingDialog 
                booking={deleteBookingDialog.booking} 
                setBookings={setBookings} 
                openState={[openBookingDialog, setOpenBookingDialog]}
            /> 
    }
    </>
    );
}