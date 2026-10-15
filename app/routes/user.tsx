import type { Route } from "./+types/user";
import { useContext, useEffect, useState } from "react";
import { AuthContext} from "./../store/context";
import { apiClient } from "./../client/apiClient";
import type { BookingUserResDto } from "../client/model/response/BookingUserResDto";
import { ListBookingUser } from "../components/booking/userPrenotation/list.user.penotation";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Profilo Utente" },
    { name: "description", content: "Gestione profilo e prenotazioni" },
  ];
}

export default function UserProfile() {
    const [auth] = useContext(AuthContext);
    const [bookings, setBookings] = useState<BookingUserResDto[] | null>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);

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
        <ListBookingUser 
          isLoadingBookingsState={[isLoadingBookings, setIsLoadingBookings]}
          bookingsState={[bookings, setBookings]}
        />

      </div>
    </div>
  </>
   

  );
}
