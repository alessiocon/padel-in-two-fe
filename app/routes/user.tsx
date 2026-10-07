import type { Route } from "./+types/user";
import { useContext, useEffect, useState } from "react";
import { AuthContext} from "./../store/context";
import { apiClient } from "./../client/apiClient";
import type { BookingUserResDto } from "../client/model/response/BookingUserResDto";
import { CardBookingUser } from "./../component/CardBookingUser";
import type { IDeleteBookingDialogProps } from "../components/dialog/delete.booking.dialog";
import DeleteBookingDialog from "../components/dialog/delete.booking.dialog";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Profilo Utente" },
    { name: "description", content: "Gestione profilo e prenotazioni" },
  ];
}

export default function UserProfile() {
    const [auth] = useContext(AuthContext);
    const [bookings, setBookings] = useState<BookingUserResDto[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);

    // Stato per gestire il popup custom di conferma eliminazione
    const [deleteBookingDialog, setdeleteBookingDialog] = useState<IDeleteBookingDialogProps | null>(null);
    const [openBookingDialog, setOpenBookingDialog] = useState<boolean>(false);

    // Fetch delle prenotazioni dell'utente
    useEffect(() => {
        async function fetchUserBookings() {
        try {
            setIsLoadingBookings(true);

            const res = await apiClient.getBookingsOfUser();
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


  return (<>
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
                        onDelete={(e) => {
                          setdeleteBookingDialog({booking: booking, setBookings: setBookings })
                          setOpenBookingDialog(true)
                        }}
                    />
                ))}
            </div>
          )}
        </section>

      </div>
    </div>
    
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
