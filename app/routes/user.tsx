import type { Route } from "./+types/user";
import { useContext, useEffect, useState } from "react";
import { AuthContext, PopUpContext } from "./../store/context";
import { ApiClient } from "./../Client/ApiClient";
import type { BookingUserResDto } from "~/Client/Model/Response/BookingUserResDto";
import { DataHelper } from "~/Helper/DateHelper";
import { AlertTriangle, DoorClosed, DoorOpen, MapPin, Timer, X } from "lucide-react";
import { CardBookingUser } from "~/component/CardBookingUser";
import { Button } from "~/components/ui/button";
import { BookingStatus } from "~/models/booking.dto";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Profilo Utente" },
    { name: "description", content: "Gestione profilo e prenotazioni" },
  ];
}

export default function UserProfile() {
    const [auth] = useContext(AuthContext);
    const [popUp, setPopup] = useContext(PopUpContext);
    const [bookings, setBookings] = useState<BookingUserResDto[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);

    // Stato per gestire il popup custom di conferma eliminazione
    const [bookingToDelete, setBookingToDelete] = useState<BookingUserResDto | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Fetch delle prenotazioni dell'utente
    useEffect(() => {
        async function fetchUserBookings() {
        try {
            setIsLoadingBookings(true);

            const res = await ApiClient.GetBookingsOfUser();
            if (!res.IsSuccess || res.Data === null) {
            throw new Error("Bookings non caricati");
            }

            setBookings(res.Data);
        } catch (error) {
            console.error("Errore durante il recupero delle prenotazioni:", error);
        } finally {
            setIsLoadingBookings(false);
        }
        }

        if (auth.auth) {
        fetchUserBookings();
        }
    }, [auth.auth]);

    const handleDeleteBooking = async (bookingId: string) => {
        try {
            const res = await ApiClient.DeleteBooking(bookingId);

            if (!res.IsSuccess || !res.Data) {
                throw new Error("Impossibile cancellare la prenotazione");
            }
            const updatedBooking = res.Data;

            if (updatedBooking.status === BookingStatus.PENDING) {
                setBookings((prev) => prev.filter((b) => b.id !== bookingId));
                window.alert("Prenotazione rimossa con successo.");
                return;
            }

            setBookings((prev) =>
                prev.map((b) => {
                    if (b.id === bookingId) {
                        return {...b,
                            status: BookingStatus.CANCELLED,
                            description: updatedBooking.description ?? "",
                        };
                    }
                    return b;
                })
            );

            window.alert("Prenotazione cancellata con successo.");
        } catch (error) {
            console.error("Errore durante l'eliminazione:", error);
            window.alert("Si è verificato un errore durante la cancellazione.");
        }
    };

    const handleOpenDeleteModal = (booking: BookingUserResDto) => {
        setPopup({
            massage: (
                <DeleteBookingModal
                    booking={booking}
                    onConfirm={handleDeleteBooking}
                    onClose={() => setPopup({ massage: null })}
                />
            ),
            buttons: null,
        });
    };


  return (
    <div className="min-h-screen bg-background text-foreground w-full p-4 md:p-8 flex flex-col items-center relative">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* INFORMAZIONI UTENTE */}
        <section className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm">
          <h1 className="text-xl font-bold mb-4 border-b border-border pb-2">
            Profilo Utente
          </h1>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>{auth.firstName || "Nome"}</span>
              <span>{auth.lastName || "Cognome"}</span>
            </div>

            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="font-medium text-foreground">Username:</span>
              <span>@{auth.username || "username"}</span>
            </div>

            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="font-medium text-foreground">Email:</span>
              <span>{auth.email || "email@esempio.com"}</span>
            </div>
          </div>
        </section>

        {/* SEZIONE PRENOTAZIONI */}
        <section className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
            <h2 className="text-lg font-bold">Le Mie Prenotazioni</h2>
            <span className="text-xs text-muted-foreground">
              Totale: {bookings.length}
            </span>
          </div>

          {isLoadingBookings ? (
            <p className="text-sm text-muted-foreground">Caricamento prenotazioni...</p>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                Nessuna prenotazione trovata.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
                {bookings.map((booking) => (
                    <CardBookingUser key={booking.id}
                        booking={booking}
                        onDelete={(e) => handleOpenDeleteModal(booking)}
                    />
                ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

interface DeleteBookingModalProps {
  booking: BookingUserResDto,
  onConfirm: (bookingId: string) => Promise<void> | void;
  onClose: () => void;
}

export function DeleteBookingModal({
  booking,
  onConfirm,
  onClose,
}: DeleteBookingModalProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border text-card-foreground rounded-xl p-4 shadow-2xl space-y-4">
    {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-destructive font-bold text-base">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>Conferma Eliminazione</span>
            </div>
            <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
            >
            <X className="h-5 w-5" />
            </button>
        </div>

    {/* Contenuto */}
        <div className="space-y-2 text-sm text-muted-foreground">
           
            <div className="p-3 bg-muted rounded-lg text-foreground font-medium space-y-1 text-xs border border-border/50">
                 <p>Sei sicuro di voler eliminare la prenotazione del {DataHelper.FormatDate(booking.startsAt)} alle {DataHelper.FormatTime(booking.startsAt)}?</p>
            </div>
            <p className="text-xs text-destructive font-medium">L'azione non potrà essere annullata.</p>
        </div>

    {/* Azioni */}
        <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
                Annulla
            </Button>
            <Button variant="destructive" size="sm"
                onClick={async () => {
                    await onConfirm(booking.id);
                    onClose();
                }}>
                Elimina Prenotazione
            </Button>
        </div>
    </div>
  );
}