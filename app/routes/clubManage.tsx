import type { Route } from "./+types/clubManage";
import { useEffect, useState } from "react";

import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  ListFilter,
  Clock,
  CircleDot,
  RotateCcw,
  RefreshCw
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { apiClient } from "../client/apiClient";
import type { ClubResDto } from "../client/model/response/ClubResDto";
import type { ClubCourtDto } from "../client/model/common/ClubCourtDto";
import type { BookingResDto } from "../client/model/response/booking.res.dto";
import { bookingStatus } from "../client/model/common/Enum/booking.status.dto";
import type { IApiResponse } from "../client/interfaces/IApiResponse";
import { CardClubInfo } from "~/components/club/card.club.info";
import { TableBookingClub } from "~/components/booking/table.booking.club";
import { ListRequestBookig } from "~/components/booking/list.request.bookig";
import { useParams } from "react-router";
import type { BookingUserResDto } from "~/client/model/response/BookingUserResDto";
import { SendPrenotation } from "~/components/booking/send.prenotation";
import { SendPrenotationByClub } from "~/components/booking/send.prenotation.by.club";


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
  const [bookings, setBookings] = useState<BookingUserResDto[] | null >(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selezione orario e campo
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<ClubCourtDto | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  
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
    if(!club) return;
    setIsLoadingBookings(true);

    apiClient.getBookingsOfClubForManager(club.id, {from: selectedDate, to: selectedDate})
      .then(res => {
        if(!res.IsSuccess){
            alert(res.Error?.message ?? "errore nell ritrovamento delle prenotazioni")
        }
        setBookings(res.Data || []);
      })
      .catch(() => alert("errore nell ritrovamento delle prenotazioni"))
      .finally(() => setIsLoadingBookings(false))

  }, [club , selectedDate]);
 



  const fetchBookings = async () => {
    if(club == null) return;
    setIsLoadingBookings(true);

    try {
      const res = await apiClient.getBookingsOfClubForManager(club.id, {from: selectedDate, to: selectedDate});
      setBookings(res.Data || []);
    } catch (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const courtNameMap = new Map<string, string>(
    club?.courts.map((c) => [c.id, c.name])
  );



  // Invio prenotazione diretta da parte del manager
  // async function sendManagerBooking() {
  //   if (!selectedCourt?.id || !selectedSlot) return;

  //   const formattedNotes = playerName.trim()
  //     ? `Prenotazione Manager: ${playerName.trim()}`
  //     : "Prenotazione Manager";

  //     //TODO: DA SISTEMARE ATTUALMENTE MANCANO TUTTE LE PROPRIETà
  //   const newBooking: CreateBookingDto = {
  //     courtId: selectedCourt.id,
  //     description: formattedNotes,
  //     startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
  //     slots: 1
  //   } as CreateBookingDto ;

  //   setIsLoadingBookings(true);

  //   try {
  //     const res = await apiClient.createBooking(club.id, newBooking);

  //     if (!res.Data) {
  //       alert(res.Error?.message || "Errore durante l'inserimento");
  //       return;
  //     }

  //     await fetchBookings();
  //     alert("Campo inserito con successo dal Manager!");
  //   } catch (error) {
  //     alert("Si è verificato un errore, riprova più tardi");
  //   } finally {
  //     setIsLoadingBookings(false);
  //     setSelectedSlot(null);
  //     setSelectedCourt(null);
  //     setPlayerName("");
  //   }
  // }

  const handleUpdateStatus = async (bookingId: string, newStatus: bookingStatus) => {
    setIsSubmitting(true);
    try {
      let res : IApiResponse<BookingResDto> = {Data: null, Error: null, IsSuccess: false};

      if(newStatus === bookingStatus.CANCELLED){
        res = await apiClient.deleteBooking(bookingId, { isStaff: true });
      }else{
        res = await apiClient.restoreBookigStatus(bookingId, { isStaff: true });
      }

      if (res && !res.IsSuccess) {
        alert(res.Error?.message || "Errore durante l'aggiornamento");
        return;
      }

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
      let res : IApiResponse<BookingResDto> = {Data: null, Error: null, IsSuccess: false};
      res = await apiClient.acceptBooking(bookingId);

      if (res && !res.IsSuccess) {
        alert(res.Error?.message || "Errore durante l'aggiornamento");
        return;
      }

      setBookings((prev) =>
        [ ...(prev?.map((b) => (b.id === bookingId ? { ...b, status: bookingStatus.CONFIRMED } : b))) ?? []]
       
      );
    } catch (error) {
      alert("Errore durante l'operazione.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // const handleOpenCourtSelection = (slot: string, courts: ClubCourtDto[]) => {
  //     setSelectedSlot(slot);
  //     setSelectedCourt(null);

  //     const courtModels: CourtWithStatusDto[] = courts.map((court) => ({
  //       ...court,
  //       isOccupied: false,
  //     }));

  //     setSelectCourtDialogProps({
  //       slotState: [slot, setSelectedSlot],
  //       selectedDate,
  //       courts:courtModels,
  //       bookings:bookings,
  //       onSelectCourt: (court) => {
  //         setSelectedCourt(court);
  //     }})
  //     setOpenSelectCourtDialog(true);
  //   };

  // Helper per renderizzare i badge di stato secondo la configurazione richiesta
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
        label: "In attesa",
        classes: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      },
      cancelled: {
        label: "Annullato",
        classes: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      },
    };

    const key = status?.toLowerCase();
    const config = statusConfig[key] || {
      label: status,
      classes: "bg-muted text-muted-foreground border-border",
    };

    return (
      <span className={`${baseClasses} ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  return (<>
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <aside className="lg:col-span-1 space-y-6">
            <CardClubInfo club={club}/>
          </aside>
          {isLoadingBookings}
          <Button className="bg-background mx-2" variant="outline" onClick={fetchBookings} disabled={isLoadingBookings}>
            {isLoadingBookings ? (
              <><Loader2 className="h-4 w-4 animate-spin text-primary mr-2" /> Aggiornamento...</>
            ) : (
              <><RefreshCw className="h-4 w-4 mr-2" /> Aggiorna</>
            )}
          </Button>
        </div>

        <ListRequestBookig
          bookingState={[bookings, setBookings]}
          isLoading={isLoadingBookings}
          courtNameMap={courtNameMap}
        />

        {/* Sezione Griglia Oraria / Prenotazione Manuale */}
        <TableBookingClub 
          club={club}
          dateState={[selectedDate, setSelectedDate]}
          slotState={[selectedSlot, setSelectedSlot]}
          bookingsState={[bookings, setBookings] as [BookingResDto[] | null, React.Dispatch<React.SetStateAction<BookingResDto[] | null>>]}
          isLoadingBooking={isLoadingBookings}
          setSelectedCourt={setSelectedCourt}
        />

         {club && <SendPrenotationByClub 
                  selectedCourtState={[selectedCourt, setSelectedCourt]}
                  bookingsState={[bookings, setBookings] as [BookingResDto[] | null, React.Dispatch<React.SetStateAction<BookingResDto[] | null>>] }
                  isLoadingBookingsState={[isLoadingBookings, setIsLoadingBookings]}
                  slotState={[selectedSlot, setSelectedSlot]}
                  clubId={club.id}
                  selectedDate={selectedDate}
                />}

        {/* Lista / Tabellone Completo delle Prenotazioni del Giorno */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-primary" /> Gestione Prenotazioni del Giorno ({bookings?.length ?? 0})
            </CardTitle>
            <CardDescription>
              Visualizza e modifica lo stato di qualsiasi prenotazione in data {selectedDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Caricamento prenotazioni...
              </div>
            ) : (bookings?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nessuna prenotazione presente per questa giornata.
              </p>
            ) : (
              <div className="space-y-2">
                {bookings?.map((booking) => {
                  const courtName = courtNameMap.get(booking.courtId) || booking.courtId || "Campo Sconosciuto";
                  const timeString = new Date(booking.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isCancelled = booking.status === bookingStatus.CANCELLED;

                  return (
                    <div
                      key={booking.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-3 ${
                        isCancelled
                          ? "bg-muted/20 border-border/50 opacity-75"
                          : "bg-background/50 border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10 text-primary font-mono font-bold text-sm flex items-center gap-1 shrink-0">
                          <Clock className="h-4 w-4" />
                          {timeString}
                        </div>

                        <div>
                          <p className="font-bold text-sm flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-primary" />
                            {courtName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.description || booking.createdBy?.id || "Nessun dettaglio specificato"}
                          </p>
                        </div>
                      </div>

                      {/* Azioni Manager per il cambio di stato */}
                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                        {renderStatusBadge(booking.status)}

                        <div className="flex items-center gap-1.5 border-l border-border pl-3">
                          {booking.status === bookingStatus.PENDING && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-emerald-600 hover:bg-emerald-500/10 font-semibold"
                              disabled={isSubmitting}
                              onClick={() => handleAcceptBooking(booking.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accetta
                            </Button>
                          )}

                          {isCancelled ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 font-semibold"
                              disabled={isSubmitting}
                              onClick={() => handleUpdateStatus(booking.id, bookingStatus.CONFIRMED)}
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Ripristina
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
                              disabled={isSubmitting}
                              onClick={() => handleUpdateStatus(booking.id, bookingStatus.CANCELLED)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Annulla
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  </>);
}