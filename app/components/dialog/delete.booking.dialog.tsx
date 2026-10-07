import { Loader2} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "../ui/dialog";
import { useState } from "react";
import { apiClient } from "../../client/apiClient";
import type { BookingUserResDto } from "../../client/model/response/BookingUserResDto";
import { dateHelper } from "../../helper/dateHelper";
import { Button } from "../ui/button";
import { bookingStatus } from "../../client/model/common/Enum/bookingStatusDto";


export interface IDeleteBookingDialogProps {
    setBookings: React.Dispatch<React.SetStateAction<BookingUserResDto[]>>
    booking: BookingUserResDto,
}

export default function DeleteBookingDialog({booking, setBookings, openState} : IDeleteBookingDialogProps 
    & {  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = openState;

    const handleDeleteBooking = async (bookingId: string) => {
        try {
            setLoading(true);
            const res = await apiClient.deleteBooking(bookingId, {isStaff: false});

            if (!res.IsSuccess || !res.Data) {
                alert(res.Error?.message ?? "Impossibile cancellare la prenotazione");
                return;
            }
            const updatedBooking = res.Data;

            if (updatedBooking.status === bookingStatus.PENDING) {
                setBookings((prev) => prev.filter((b) => b.id !== bookingId));
                alert("Prenotazione rimossa con successo.");
                return;
            }

            setBookings((prev) =>
                prev.map((b) => {
                    if (b.id === bookingId) {
                        return {...b,
                            status: bookingStatus.CANCELLED,
                            description: updatedBooking.description ?? "",
                        };
                    }
                    return b;
                })
            );

            alert("Prenotazione cancellata con successo.");
        } catch (error) {
            alert("Si è verificato un errore durante la cancellazione.");
        }finally{
            setLoading(false)
        }
    };


    return <Dialog  open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <h3>Conferma Eliminazione</h3>
        </DialogHeader>
        <DialogDescription>
            <p>Sei sicuro di voler eliminare la prenotazione del {dateHelper.formatDate(booking.startsAt)} alle {dateHelper.formatTime(booking.startsAt)}?</p>
        </DialogDescription>
         <p className="text-xs text-destructive font-medium">L'azione non potrà essere annullata.</p>
          <DialogFooter>
            <Button variant="destructive" size="sm"
                disabled={loading}
                onClick={async () => {
                    await handleDeleteBooking(booking.id);
                    setOpen(false);
                }}>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Elimina Prenotazione
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
}   