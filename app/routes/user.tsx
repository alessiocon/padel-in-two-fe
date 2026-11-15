import type { Route } from "./+types/user";
import { useContext, useEffect, useState } from "react";
import { AuthContext} from "./../store/context";
import { apiClient } from "./../client/apiClient";
import { ListBookingUser } from "../components/booking/userPrenotation/list.user.penotation";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
import type { PromotionAccountResDto } from "~/client/model/response/promotion.account.res.dto";
import { PromotionPoints } from "~/components/promotion/promotion.points";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Profilo Utente" },
    { name: "description", content: "Gestione profilo e prenotazioni" },
  ];
}

export default function UserProfile() {
    const [auth] = useContext(AuthContext);
    const [bookings, setBookings] = useState<BookingQuickResDto[] | null>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);
    const [promotions, setPromotions] = useState<PromotionAccountResDto[] | null>(null);
    const [isLoadingPromotions, setIsLoadingPromotions] = useState<boolean>(true);

    useEffect(() => {
        async function fetchUserBookings() {
        try {
            setIsLoadingBookings(true);

            const res = await apiClient.searchBookingOfUser({});
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

    useEffect(() => {
        if (!auth.auth) return;

        setIsLoadingPromotions(true);
        apiClient.getUserPromotions()
            .then(res => {
                if (!res.IsSuccess) throw new Error(res.Error?.message ?? "Promozioni non caricate");
                setPromotions(res.Data ?? []);
            })
            .catch(error => console.error("Errore durante il recupero delle promozioni:", error))
            .finally(() => setIsLoadingPromotions(false));
    }, [auth.auth]);


  return (<>
    <div className="min-h-screen bg-background text-foreground w-full p-4 md:p-8 flex flex-col items-center relative">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* INFORMAZIONI UTENTE */}
        <section className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm">
          <h1 className="text-xl font-bold mb-4 border-b border-border pb-2">
            {auth.firstName || "Nome"} {auth.lastName || "Cognome"}
          </h1>

          <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="font-medium text-foreground">Username:</span>
                  <span>@{auth.username || "username"}</span>
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="font-medium text-foreground">Email:</span>
                  <span>{auth.email || "email@esempio.com"}</span>
                </div>
              </div>
          </div>
            
        </section>

        {/* SEZIONE PROMOZIONI */}
        <PromotionPoints accounts={promotions} isLoading={isLoadingPromotions} />

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
