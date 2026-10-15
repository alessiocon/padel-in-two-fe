import { useRef, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { apiClient } from "../../../client/apiClient";
import { Skeleton } from "../../ui/skeleton";
import { Button } from "../../ui/button";
import { CardUserPrenotation } from "./card.user.prenotation";
import type { IDeleteBookingDialogProps } from "../../dialog/delete.booking.dialog";
import DeleteBookingDialog from "../../dialog/delete.booking.dialog";
import type { BookingUserResDto } from "../../../client/model/response/BookingUserResDto";

export interface IInfoBookingClubProps {
    bookingsState: [BookingUserResDto[] | null,React.Dispatch<React.SetStateAction<BookingUserResDto[] | null>>],
    isLoadingBookingsState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}


export function ListBookingUser({
    bookingsState, 
    isLoadingBookingsState,
} :  IInfoBookingClubProps) {
    const [bookings, setBookings] = bookingsState;
    const [isLoadingBookings, setIsLoadingBookings] = isLoadingBookingsState
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshInFlight = useRef(false);

    const [deleteBookingDialog, setdeleteBookingDialog] = useState<IDeleteBookingDialogProps | null>(null);
    const [openBookingDialog, setOpenBookingDialog] = useState<boolean>(false);

    function deleteBooking(booking: BookingUserResDto) {
        setdeleteBookingDialog({
            booking: booking,
            setBookings: setBookings,
        });
        setOpenBookingDialog(true);
    } 

    const refreshBookings = async () => {
        if (refreshInFlight.current) return;

        refreshInFlight.current = true;
        setIsRefreshing(true);
        try {
            const response = await apiClient.getBookingsOfUser();
            if (!response.IsSuccess || !response.Data) {
                window.alert(response.Error?.message || "Impossibile aggiornare le prenotazioni.");
                return;
            }

            setBookings(response.Data);
        } catch {
            window.alert("Impossibile aggiornare le prenotazioni.");
        } finally {
            refreshInFlight.current = false;
            setIsRefreshing(false);
        }
    };


    return (<>
        <section
            className="relative bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm"
            aria-busy={isRefreshing}
            onClickCapture={(event) => {
                if (isRefreshing) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }}
        >
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <h2 className="text-lg font-bold">Le Mie Prenotazioni</h2>
                <div className="flex items-center gap-3">
                    {isLoadingBookings || bookings == null ? (
                        <Skeleton className="h-4 w-16" />
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            Totale: {bookings.length}
                        </span>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void refreshBookings()}
                        disabled={isRefreshing || isLoadingBookings}
                        aria-label="Aggiorna prenotazioni"
                    >
                        {isRefreshing ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
                        Aggiorna
                    </Button>
                </div>
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
                    <CardUserPrenotation
                        key={booking.id}
                        bookingState={[booking, setBookings]}
                        onDelete={(e) => {deleteBooking(booking)}}
                    />
                ))}
                </div>
            )}
            {isRefreshing && (
                <div
                    role="status"
                    className="absolute inset-0 z-40 flex items-center justify-center bg-background/75 backdrop-blur-[1px]"
                >
                    <div className="flex items-center gap-3 border border-border bg-card px-5 py-4 text-sm font-semibold shadow-lg">
                        <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                        Aggiornamento prenotazioni...
                    </div>
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