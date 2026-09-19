import type { Route } from "./+types/clubManager";
import { useContext, useEffect, useState } from "react";
import { useLoaderData, type LoaderFunctionArgs} from "react-router";

import { 
  Building2, 
  Calendar as CalendarIcon, 
  MapPin, 
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  ShieldCheck,
  ListFilter,
  Clock,
  CircleDot,
  RotateCcw
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../components/ui/card";
import { Button } from "./../components/ui/button";
import { PopUpContext } from "./../store/context";
import { ButtonCourtSelection } from "./../component/ButtonCourtSelection";
import { apiClient } from "./../client/apiClient";
import type { ClubResDto } from "./../client/model/response/ClubResDto";
import type { ClubCourtDto } from "./../client/model/common/ClubCourtDto";
import type { BookingResDto } from "./../client/model/response/BookingsResDto";
import type { CreateBookingDto } from "./../client/model/request/CreateBookingDto";
import { dataHelper } from "./../helper/dateHelper";
import { bookingStatus } from "./../client/model/common/Enum/bookingStatusDto";

export type CourtWithStatusDto = ClubCourtDto & {
  isOccupied: boolean;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Club Manager - Padel" },
    { name: "description", content: "Gestisci le prenotazioni e il tabellone del circolo" },
  ];
}

export async function clientLoader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Error("Club non specificato");
  }

  const response = await apiClient.getClubManager(params.id);
  
  if (!response.IsSuccess || !response.Data) {
    throw new Error("Impossibile recuperare i dettagli del club");
  }
  return response.Data;
}
clientLoader.hydrate = true;

export default function ClubManagerPage() {
  const club = useLoaderData<ClubResDto>();
  const [, setPopup] = useContext(PopUpContext);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [bookings, setBookings] = useState<BookingResDto[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selezione orario e campo
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<ClubCourtDto | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  const timeSlots = dataHelper.generateTimeSlots(
    club.openingTime,
    club.closingTime,
    club.slotDurationMinutes,
    selectedDate
  );

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await apiClient.getBookingsOfClub(club.id, selectedDate);
      setBookings(res.Data || []);
    } catch (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (club?.id) {
      fetchBookings();
    }
  }, [club.id, selectedDate]);

  // Map per recuperare il nome del campo dato l'ID
  const courtNameMap = new Map<string, string>(
    club.courts.map((c) => [c.id, c.name])
  );

  // Invio prenotazione diretta da parte del manager
  async function sendManagerBooking() {
    if (!selectedCourt?.id || !selectedSlot) return;

    const formattedNotes = playerName.trim()
      ? `Prenotazione Manager: ${playerName.trim()}`
      : "Prenotazione Manager";

    const newBooking: CreateBookingDto = {
      courtId: selectedCourt.id,
      description: formattedNotes,
      startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
      slots: 1
    };

    setIsLoadingBookings(true);

    try {
      const res = await apiClient.createBooking(club.id, newBooking);

      if (!res.Data) {
        alert(res.Error?.message || "Errore durante l'inserimento");
        return;
      }

      await fetchBookings();
      alert("Campo inserito con successo dal Manager!");
    } catch (error) {
      alert("Si è verificato un errore, riprova più tardi");
    } finally {
      setIsLoadingBookings(false);
      setSelectedSlot(null);
      setSelectedCourt(null);
      setPlayerName("");
    }
  }

  // Cambio stato con aggiornamento ottimistico
  const handleUpdateStatus = async (bookingId: string, newStatus: bookingStatus) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.updateBooking(bookingId, {
        clubId: club.id,
        status: newStatus
      });

      if (res && !res.IsSuccess) {
        alert(res.Error?.message || "Errore durante l'aggiornamento");
        return;
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (error) {
      alert("Errore durante l'operazione.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCourtSelectionModal = (slot: string) => {
    setSelectedSlot(slot);
    setSelectedCourt(null);

    const courtModels: CourtWithStatusDto[] = club.courts.map((court) => ({
      ...court,
      isOccupied: false,
    }));

    setPopup({
      massage: (
        <CourtSelectionModal
          slot={slot}
          selectedDate={selectedDate}
          courts={courtModels}
          bookings={bookings}
          onSelectCourt={(court) => {
            setSelectedCourt(court);
          }}
          onClose={() => setPopup({ massage: null })}
        />
      ),
      buttons: null
    });
  };

  const pendingBookings = bookings.filter((b) => b.status === bookingStatus.PENDING);

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 space-y-6">
      {/* Header Manager */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">{club.name}</h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Owner / Manager
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {club.position ?? "Via Alcide De Gasperi, 200"}
          </p>
        </div>
      </header>

      {/* Richieste in Attesa */}
      {pendingBookings.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-500 text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Richieste Giocatori in Attesa ({pendingBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-border bg-card gap-4"
              >
                <div>
                  <p className="font-bold text-sm">
                    {courtNameMap.get(b.courtId) || b.courtId || "Campo"} • {new Date(b.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                   {b.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-600/10 flex-1 sm:flex-initial font-semibold"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus(b.id, bookingStatus.CONFIRMED)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Accetta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10 flex-1 sm:flex-initial font-semibold"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus(b.id, bookingStatus.CANCELLED)}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Rifiuta
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sezione Griglia Oraria / Prenotazione Manuale */}
      <Card className="bg-card border-primary/20">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" /> Seleziona Orario per Inserimento
            </CardTitle>
            <CardDescription>
              Clicca su uno slot orario libero per assegnare un campo a un giocatore
            </CardDescription>
          </div>

          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(null);
              setSelectedCourt(null);
            }}
            className="bg-background border-input dark:scheme-dark rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Orari per il {selectedDate}:
            </h3>
            {isLoadingBookings && (
              <span className="text-xs text-primary flex items-center gap-1.5 font-medium animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Aggiornamento...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <Button
                  key={slot}
                  disabled={isLoadingBookings}
                  variant={isSelected ? "default" : "outline"}
                  className={`py-6 flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected ? "ring-2 ring-primary" : "hover:border-primary"
                  }`}
                  onClick={() => handleOpenCourtSelectionModal(slot)}
                >
                  <span className="text-base font-bold">{slot}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {club.slotDurationMinutes} min
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Box di Conferma Inserimento Manager */}
          {selectedSlot && selectedCourt && (
            <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/20 pb-3">
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Campo Selezionato:</p>
                  <p className="text-base font-semibold">
                    {selectedCourt.name} ({selectedCourt.isIndoor ? "Indoor" : "Outdoor"}) • {selectedDate} ore {selectedSlot}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prezzo: € {selectedCourt.price?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nome e Cognome Giocatore (opzionale)"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button onClick={sendManagerBooking} size="lg" className="font-bold shrink-0">
                  Conferma Inserimento Manager
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista / Tabellone Completo delle Prenotazioni del Giorno */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-primary" /> Gestione Prenotazioni del Giorno ({bookings.length})
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
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nessuna prenotazione presente per questa giornata.
            </p>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => {
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
                          {booking.description || booking.userId || "Nessun dettaglio specificato"}
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
                            onClick={() => handleUpdateStatus(booking.id, bookingStatus.CONFIRMED)}
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
  );
}

// Sub-componente Popup per la selezione dei campi
interface CourtSelectionModalProps {
  slot: string;
  selectedDate: string;
  courts: CourtWithStatusDto[];
  bookings: BookingResDto[];
  onSelectCourt: (court: ClubCourtDto) => void;
  onClose: () => void;
}

function CourtSelectionModal({
  slot,
  selectedDate,
  courts,
  bookings,
  onSelectCourt,
  onClose,
}: CourtSelectionModalProps) {
  const slotTime = new Date(`${selectedDate}T${slot}`).toISOString();
  
  const bookedCourtIdsForSlot = bookings
    .filter((b) => (b.startsAt.slice(0, 16) === slotTime.slice(0, 16) && b.status !== bookingStatus.CANCELLED))
    .map((b) => b.courtId);

  const courtsCheck: CourtWithStatusDto[] = courts.map((court) => ({
    ...court,
    isOccupied: bookedCourtIdsForSlot.includes(court.id),
  }));

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border text-foreground rounded-xl p-3 sm:p-4 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-center w-full text-sm sm:text-base">
          {selectedDate.replaceAll("-", "/")} - {slot}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {courtsCheck.map((court) => (
          <ButtonCourtSelection 
            key={court.id} 
            court={court} 
            onSelect={onSelectCourt} 
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
}