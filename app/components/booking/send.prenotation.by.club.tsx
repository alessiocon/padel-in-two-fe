import type { ClubCourtDto } from "../../client/model/common/ClubCourtDto";
import { useContext, useEffect, useRef, useState } from "react";
import { apiClient } from "../../client/apiClient";
import { Button } from "../ui/button";
import type { CreateBookingDto } from "../../client/model/request/create.booking.dto";
import { AuthContext } from "../../store/context";
import {  Lock, ArrowRight } from "lucide-react";
import { Input } from "../ui/input";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";

export interface IInfoBookingClubProps {
    clubId: string;
    selectedDate: string;
    slotState: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
    bookingsState: [BookingQuickResDto[] | null, React.Dispatch<React.SetStateAction<BookingQuickResDto[] | null>>];
    selectedCourtState: [ClubCourtDto | null, React.Dispatch<React.SetStateAction<ClubCourtDto | null>>];
    isLoadingBookingsState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export function SendPrenotationByClub({
    clubId,
    selectedDate,
    slotState,
    bookingsState,
    isLoadingBookingsState,
    selectedCourtState
}: IInfoBookingClubProps) {
    const [auth] = useContext(AuthContext);
    const [selectedSlot, setSelectedSlot] = slotState;
    const [bookings, setBookings] = bookingsState;
    const [isLoadingBookings, setIsLoadingBookings] = isLoadingBookingsState;
    const [selectedCourt, setSelectedCourt] = selectedCourtState;

    const [bookingDescription, setBookingDescription] = useState<string>("");
    const detailsRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (selectedCourt && detailsRef.current) {
            detailsRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest'
            });
        }
    }, [selectedCourt]);


    async function sendBooking() {
        if (!selectedCourt?.id || !selectedSlot) return;
        if (!auth?.auth) {
            window.alert("Devi accedere per poter prenotare");
            return;
        }

        var newBooking: CreateBookingDto = {
            courtId: selectedCourt.id,
            description: `Prenotazione da: ${auth.username}: ${bookingDescription}`,
            startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
            slots: 1,
            teams: []
        };

        setIsLoadingBookings(true);

        try {
            const res = await apiClient.createBooking(clubId, newBooking);

            if (!res.Data) {
                if (res.Error) {
                    window.alert(res.Error?.message);
                } else {
                    throw new Error("Errore durante la prenotazione");
                }
                return;
            }
            const createdBooking = res.Data;

            setBookings((prev) => [...(prev ?? []), createdBooking]);
            setSelectedSlot(null);
            window.alert("Campo prenotato correttamente!");
        } catch (error) {
            throw new Error("Si è verificato un errore, riprova più tardi");
        } finally {
            setIsLoadingBookings(false);
        }
    }

    if (!selectedSlot || !selectedCourt) return null;

    return (
        <div ref={detailsRef} className="lg:col-span-3 space-y-6 p-3 bg-card border border-border/60 shadow-lg space-y-6">
            <div className="grid grid-cols-[1fr_auto] items-start sm:items-center gap-4 pb-4 border-b border-border/40">
                <div>
                    <h3 className="text-xl font-bold">
                        {selectedCourt.name} <span className="text-sm font-normal text-muted-foreground">({selectedCourt.isIndoor ? "Indoor" : "Outdoor"})</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        <strong className="text-foreground">{selectedDate}</strong> - <strong className="text-foreground">{selectedSlot}</strong>
                    </p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Prezzo</p>
                    <p className="text-2xl font-extrabold text-primary">€ {selectedCourt.price?.toFixed(2)}</p>
                </div>
            </div>

            {!auth?.auth && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-2">
                    <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed">
                            Autenticazione richiesta: per poter prenotare questo campo e comporre i team è necessario effettuare l'accesso.
                        </p>
                    </div>
                    <div className="text-right">
                        <a 
                            href="/auth" 
                            className="inline-flex items-center gap-1 text-sm font-semibold underline hover:text-amber-800 dark:hover:text-amber-300 transition-colors group"
                        >
                            <span>vai al login</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    </div>
                </div>
            )}

            <div className="">
                <div className="flex flex-col gap-2">
                    <label htmlFor="booking-description" className="text-sm font-semibold text-foreground">Descrizione Prenotazione</label> 
                    <Input
                        id="booking-description"
                        type="text"
                        value={bookingDescription}
                        onChange={(e) => setBookingDescription(e.target.value)}
                        placeholder="Inserisci una descrizione per la prenotazione"
                        className="w-full pl-3 pr-3 py-1.5 text-sm font-medium text-foreground bg-background/80 border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Pulsante di Invio Prenotazione Finale / Link Auth */}
            <div className="flex justify-end pt-2">
                {auth?.auth ? (
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto font-bold px-8"
                        disabled={isLoadingBookings}
                        onClick={sendBooking}
                    >
                        {isLoadingBookings ? "Invio in corso..." : "Conferma e Invia Prenotazione"}
                    </Button>
                ) : (
                    <a href="/auth" className="w-full sm:w-auto">
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="w-full sm:w-auto font-bold px-8"
                        >
                            Effettua l'accesso per prenotare
                        </Button>
                    </a>
                )}
            </div>
        </div>
    );
}