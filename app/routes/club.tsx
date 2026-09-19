import type { Route } from "./+types/home";
import { useContext, useEffect, useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { 
  Building2, 
  Clock, 
  Calendar as CalendarIcon, 
  MapPin, 
  Info,
  CircleDollarSign,
  Loader2,
  X,
  ShieldCheck
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../components/ui/card";
import { Button } from "./../components/ui/button";
import { AuthContext, PopUpContext } from "./../store/context";
import { ButtonCourtSelection } from "./../component/ButtonCourtSelection";
import { apiClient } from "./../client/apiClient";
import type { ClubResDto } from "./../client/model/response/ClubResDto";
import type { ClubCourtDto } from "./../client/model/common/ClubCourtDto";
import type { BookingResDto } from "./../client/model/response/BookingsResDto";
import type { CreateBookingDto } from "./../client/model/request/CreateBookingDto";
import { dataHelper } from "./../helper/dateHelper";
import { bookingStatus } from "./../client/model/common/Enum/bookingStatusDto";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "Prenota Campo - Padel" },
    { name: "description", content: "Seleziona orario e campo per la tua partita" },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  if(params.id === undefined){
    throw new Error("Club non specificato");
  }

  const response = await apiClient.getClub(params.id);

  if (!response.IsSuccess) {
    throw new Error("Impossibile recuperare i dettagli del club");
  }
  return response.Data;
}


export default function ClubDetailPage() {
  const club = useLoaderData<ClubResDto>();
  const [, setPopup] = useContext(PopUpContext);
  const [auth,] = useContext(AuthContext);
  
  const [selectedDate, setSelectedDate] = useState<string>( new Date().toISOString().split("T")[0] );
  
  // Stato per le prenotazioni lette dall'API e relativo caricamento
  const [bookings, setBookings] = useState<BookingResDto[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<ClubCourtDto | null>(null);
  

  const timeSlots = dataHelper.generateTimeSlots(
    club.openingTime,
    club.closingTime,
    club.slotDurationMinutes,
    selectedDate
  );
  const todayStr = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // Fetch per caricare le prenotazioni ogni volta che cambia il club o la data selezionata
  useEffect(() => {
    async function fetchBookings() {
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
    }

    if (club?.id) {
      fetchBookings();
    }
  }, [club.id, selectedDate]);

  async function sendBooking(){
    if (!selectedCourt?.id || !selectedSlot) return;
    if(!auth.auth){
      window.alert("devi accedere per poter prenotare")
    }
    
    var newBooking : CreateBookingDto = {
      courtId: selectedCourt.id,
      description: "Prenotazione da: "+auth.username,
      startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
      slots: 1 
    }  

    setIsLoadingBookings(true);

    try {
      const res = await apiClient.createBooking(club.id, newBooking);

      if (!res.Data) {
        if(res.Error){ 
          window.alert(res.Error?.message);
        }else{
          throw new Error("errore")
        }
        return;
      }
      const createdBooking = res.Data;

      setBookings((prev) => [...prev, createdBooking]);
      window.alert("Campo prenotato correttamente!");

    } catch (error) {
      throw new Error("si è verificato un errore, riprova più tardi")
    } finally {
      setIsLoadingBookings(false);
      setSelectedSlot(null);
    }
  }

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8">
      {/* Header del Club */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">{club.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {club.position ?? "Via Alcide De Gasperi, 200"}
          </p>
        </div>
        {auth.id === club.ownerId && (
          <Link
            to="./manager"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shrink-0"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Area Manager</span>
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Info Circolo */}
        <aside className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" /> Info Circolo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Orario
                </span>
                <span className="font-semibold">{club.openingTime} - {club.closingTime}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Durata Slot
                </span>
                <span className="font-semibold">{club.slotDurationMinutes} min</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CircleDollarSign className="h-4 w-4" /> Prezzo Medio
                </span>
                <span className="font-bold text-primary">€ {club.averagePrice}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CircleDollarSign className="h-4 w-4" /> Noleggio Pala
                </span>
                <span className="font-bold">€ {club.racketPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Sezione Calendario e Slot Orari */}
        <main className="lg:col-span-3 space-y-6">
          <Card className="bg-card border-primary/20">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" /> 
                  Seleziona Orario
                </CardTitle>
                <CardDescription>
                  Clicca sull'orario desiderato per scegliere il campo
                </CardDescription>
              </div>

              <input
                type="date"
                id="date"
                value={selectedDate}
                min={todayStr}
                max={maxDateStr}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                  setSelectedCourt(null);
                }}
                className="bg-background border-input dark:scheme-dark rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Orari per il {selectedDate}:
                  </h3>
                  {/* Grafica di caricamento durante la chiamata API */}
                  {isLoadingBookings && (
                    <span className="text-xs text-primary flex items-center gap-1.5 font-medium animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" /> Caricamento prenotazioni...
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
              </div>

              {/* Box di Conferma Finale */}
              {selectedSlot && selectedCourt && (
                <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">Campo Selezionato:</p>
                    <p className="text-base font-medium">
                      {selectedCourt.name} ({selectedCourt.isIndoor ? "Indoor" : "Outdoor"}) • {selectedDate} ore {selectedSlot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Totale: € {selectedCourt.price?.toFixed(2)}
                    </p>
                  </div>
                  <Button onClick={sendBooking} size="lg" className="w-full sm:w-auto font-bold">
                    Invia Prenotazione
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}


export type CourtWithStatusDto = ClubCourtDto & {
  isOccupied: boolean;
};

// Popup aggiornato: completamente responsive per qualsiasi schermo (Invariato)
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

  var slotTime = new Date(selectedDate+"T"+slot).toISOString();
  const bookedCourtIdsForSlot = bookings
    .filter((b) => (b.startsAt.slice(0, 16) === slotTime.slice(0, 16) && b.status !== bookingStatus.CANCELLED ))
    .map((b) => b.courtId);

  var courtsCheck: CourtWithStatusDto[] = courts.map((court, index) => {
    court.isOccupied = bookedCourtIdsForSlot.includes(court.id);
    return court
  });

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border text-foreground rounded-xl p-3 sm:p-4 shadow-2xl space-y-4">
      {/* Header centrato con pulsante di chiusura bilanciato */}
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

      {/* Griglia responsive: 2 colonne flessibili senza overflow */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {courtsCheck.map((court) => {
          return (
            <ButtonCourtSelection key={court.name} court={court} onSelect={onSelectCourt} onClose={onClose}/>
          );
        })}
      </div>
    </div>
  );
}