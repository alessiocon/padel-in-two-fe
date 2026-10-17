import type { Route } from "./+types/clubManage";
import { useEffect, useState } from "react";

import { 
  Calendar,
  Loader2,
  ListFilter,
  RefreshCw
} from "lucide-react";

import { Button } from "../components/ui/button";
import { apiClient } from "../client/apiClient";
import type { ClubResDto } from "../client/model/response/ClubResDto";
import type { ClubCourtDto } from "../client/model/common/ClubCourtDto";
import { bookingStatus } from "../client/model/common/Enum/booking.status.dto";
import type { IApiResponse } from "../client/interfaces/IApiResponse";
import { CardClubInfo } from "~/components/club/card.club.info";
import { TableBookingClub } from "~/components/booking/table.booking.club";
import { useParams } from "react-router";
import { SendPrenotationByClub } from "~/components/booking/send.prenotation.by.club";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
import { TableNotification } from "~/components/booking/table.notification";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Club Manager - Padel" },
    { name: "description", content: "Gestisci le prenotazioni e il tabellone del circolo" },
  ];
}

export default function ClubManagerPage() {
  const [club, setClub] = useState<ClubResDto | null>(null);
  const { id: clubId } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [bookings, setBookings] = useState<BookingQuickResDto[] | null >(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);
  const [requestPrenotations, setRequestPrenotations] = useState<BookingQuickResDto[] | null >(null);
  const [isLoadingRequestPrenotations, setIsLoadingRequestPrenotations] = useState<boolean>(true);


  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selezione orario e campo
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<ClubCourtDto | null>(null);

  
  useEffect(() => {
    if(clubId == undefined){
      alert("Club non specificato")
      return;
    }

    apiClient.getClub(clubId)
      .then(res => {
        if(!res.IsSuccess){
          alert(res.Error?.message ?? "Errore nel recupero del club");
          return;
        }
        setClub(res.Data ?? null);
      })
      .catch(err => console.error("Errore nel recupero dei club", err))
  }, [])

  useEffect(() => {
    fetchBookings()
    fetchRequestPrenotations()
  }, [club , selectedDate]);

  const fetchBookings = async () => {
    if(club == null) return;
    setIsLoadingBookings(true);

    try {
      const res = await apiClient.searchBookingForManager(club.id, {from: selectedDate, to: selectedDate});
      setBookings(res.Data || []);
    } catch (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchRequestPrenotations = async () => {
    if(club == null) return;
    setIsLoadingRequestPrenotations(true);

    try {
      const res = await apiClient.searchBookingForManager(club.id, {status: bookingStatus.PENDING});
      setRequestPrenotations(res.Data || []);
    } catch (error) {
      console.error("Errore nel recupero delle richieste di prenotazione:", error);
      setRequestPrenotations([]);
    } finally {
      setIsLoadingRequestPrenotations(false);
    }
  };


  const handleUpdateStatus = async (bookingId: string, newStatus: bookingStatus) => {
    setIsSubmitting(true);
    try {
      let res : IApiResponse<BookingQuickResDto> = {Data: null, Error: null, IsSuccess: false};

      if(newStatus === bookingStatus.CANCELLED){
        res = await apiClient.deleteBooking(bookingId, { isStaff: true });
      }else{
        res = await apiClient.restoreBookigStatus(bookingId, { isStaff: true });
      }

      if (res && !res.IsSuccess) {
        alert(res.Error?.message || "Errore durante l'aggiornamento");
        return;
      }

      setRequestPrenotations((prev) => 
          [ ...(prev?.filter((b) => b.id !== bookingId) ?? [])]
        );

      setBookings((prev) =>
         [...(prev?.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)) ?? [])]
        
      );
    } catch (error) {
      alert("Errore durante l'operazione.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
      setIsSubmitting(true);
      try {
        let res : IApiResponse<BookingQuickResDto> = {Data: null, Error: null, IsSuccess: false};
        res = await apiClient.acceptBooking(bookingId);

        if (res && !res.IsSuccess) {
          alert(res.Error?.message || "Errore durante l'aggiornamento");
          return;
        }

        setRequestPrenotations((prev) => 
          [ ...(prev?.filter((b) => b.id !== bookingId) ?? [])]
        );

        setBookings((prev) =>
          [ ...(prev?.map((b) => (b.id === bookingId ? { ...b, status: bookingStatus.CONFIRMED } : b))) ?? []]
        
        );
      } catch (error) {
        alert("Errore durante l'operazione.");
      } finally {
        setIsSubmitting(false);
      }
  };

  return (<>
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 space-y-6">
          <Button className="bg-background mx-2" variant="outline" onClick={fetchBookings} disabled={isLoadingBookings}>
              {isLoadingBookings ? (
                <><Loader2 className="h-4 w-4 animate-spin text-primary mr-2" /> Aggiornamento...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Aggiorna Pagina</>
              )}
          </Button>
          <aside className="lg:col-span-1 space-y-6">
            <CardClubInfo club={club} isClubManagerPage={true}/>
          </aside>
        
        <TableNotification
          bookings={requestPrenotations}
          isLoading={isLoadingRequestPrenotations}
          isSubmitting={isSubmitting}
          title={<>Gestione Richieste Prenotazioni</>}
          description={`Visualizza e modifica lo stato delle prenotazioni`}
          emptyMessage="Nessuna richiesta presente presente"
          onAccept={handleAcceptBooking}
          onCancel={(bookingId) => handleUpdateStatus(bookingId, bookingStatus.CANCELLED)}
          onRestore={(bookingId) => handleUpdateStatus(bookingId, bookingStatus.CONFIRMED)}
        />

        {/* Sezione Griglia Oraria / Prenotazione Manuale */}
        <TableBookingClub 
          club={club}
          dateState={[selectedDate, setSelectedDate]}
          slotState={[selectedSlot, setSelectedSlot]}
          bookingsState={[bookings, setBookings]}
          isLoadingBooking={isLoadingBookings}
          setSelectedCourt={setSelectedCourt}
        />

         {club && <SendPrenotationByClub 
                  selectedCourtState={[selectedCourt, setSelectedCourt]}
                  bookingsState={[bookings, setBookings]}
                  isLoadingBookingsState={[isLoadingBookings, setIsLoadingBookings]}
                  slotState={[selectedSlot, setSelectedSlot]}
                  clubId={club.id}
                  selectedDate={selectedDate}
                />}

        {/* Lista / Tabellone Completo delle Prenotazioni del Giorno */}
        <TableNotification
          bookings={bookings}
          isLoading={isLoadingBookings}
          isSubmitting={isSubmitting}
          title={<> <ListFilter className="inline h-5 w-5 text-primary" /> Gestione Prenotazioni del Giorno ({bookings?.length ?? 0})</>}
          description={`Visualizza e modifica lo stato di qualsiasi prenotazione in data ${selectedDate}`}
          emptyMessage="Nessuna prenotazione presente per questa giornata."
          onAccept={handleAcceptBooking}
          onCancel={(bookingId) => handleUpdateStatus(bookingId, bookingStatus.CANCELLED)}
          onRestore={(bookingId) => handleUpdateStatus(bookingId, bookingStatus.CONFIRMED)}
        />
      </div>
  </>);
}