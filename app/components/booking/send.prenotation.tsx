import type { ClubCourtDto } from "../../client/model/common/ClubCourtDto";
import { useContext, useEffect, useRef, useState } from "react";
import { apiClient } from "../../client/apiClient";
import { Button } from "../ui/button";
import type { CreateBookingDto } from "../../client/model/request/create.booking.dto";
import { AuthContext } from "../../store/context";
import {  Edit3, Lock, ArrowRight } from "lucide-react";
import { AddGuestForBookingDialog } from "../dialog/add.guest.for.booking.dialog";
import { AddUserForBookingDialog } from "../dialog/add.user.for.booking.dialog";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";
import type { CreateBookingTeamDto } from "../../client/model/request/create.booking.team.dto";
import { AddTeamPlayer } from "./add.team.player";
import { ManageTeamPlayer } from "./menage.team.player";
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

export function SendPrenotation({
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

    const [team1Name, setTeam1Name] = useState("Team 1");
    const [team2Name, setTeam2Name] = useState("Team 2");

    const [players, setPlayers] = useState<(CreateBookingPlayerDto | null)[]>([]);
    
    const [activeDialogSlot, setActiveDialogSlot] = useState<number | null>(null);
    const [dialogType, setDialogType] = useState<'GUEST' | 'REGISTERED' | null>(null);

    const detailsRef = useRef<HTMLDivElement>(null);

    const isCaptainPlaced = players.some(p => p?.userId && auth?.id && p.userId === auth.id);

    useEffect(() => {
        if (selectedCourt && detailsRef.current) {
            detailsRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest'
            });
        }
    }, [selectedCourt]);

    const handleAssignMe = (index: number) => {
        if (!auth?.auth || !auth?.id) {
            window.alert("Devi effettuare l'accesso");
            return;
        }

        if (players.some(p => p?.userId === auth.id)) {
            window.alert("Sei già inserito in questo match!");
            return;
        }

        setPlayers(prev => {
            const updated = [...prev];
            updated[index] = {
                userId: auth.id,
                username: auth.username || "Tu",
                firstName: auth.firstName,
                lastName: auth.lastName

            };
            return updated;
        });
    };

    const handleAssignPlayer = (player: CreateBookingPlayerDto) => {
        if (activeDialogSlot === null) return;

        if (player.userId && players.some(p => p?.userId === player.userId)) {
            window.alert("Questo utente partecipa già alla partita!");
            return;
        }

        if(player.phone && players.some(p => p?.phone === player.phone)){
            window.alert("Questo numero è già inserito per un altro player!");
            return;
        }

        setPlayers(prev => {
            const updated = [...prev];
            updated[activeDialogSlot] = player;
            return updated;
        });
        setActiveDialogSlot(null);
        setDialogType(null);
    };

    const handleRemovePlayer = (index: number) => {
        setPlayers(prev => {
            prev[index] = null;
            return  [...prev];
        });
    };

    const renderPlayerSlot = (index: number) => {
        const player = players[index];
        if (player) {
            return (
                <ManageTeamPlayer
                    key={index}
                    index={index}
                    teamId={index < 2 ? "team1" : "team2"}
                    player={player}
                    currentUserId={auth?.id}
                    onRemovePlayer={handleRemovePlayer}
                />
            );
        }

        return (
            <AddTeamPlayer
                key={index}
                index={index}
                isCaptainPlaced={isCaptainPlaced}
                isAuthenticated={Boolean(auth?.auth)}
                onAssignMe={handleAssignMe}
                onOpenGuestDialog={(slotIndex) => { setActiveDialogSlot(slotIndex); setDialogType("GUEST"); }}
                onOpenRegisteredDialog={(slotIndex) => { setActiveDialogSlot(slotIndex); setDialogType("REGISTERED"); }}
            />
        );
    };

    async function sendBooking() {
        if (!selectedCourt?.id || !selectedSlot) return;
        if (!auth?.auth) {
            window.alert("Devi accedere per poter prenotare");
            return;
        }

        const team1Players = [players[0], players[1]].filter(Boolean) as CreateBookingPlayerDto[];
        const team2Players = [players[2], players[3]].filter(Boolean) as CreateBookingPlayerDto[];
        if(!team1Players){
            window.alert(`Inserisci tutti i giocatori per il team: ${team1Name.trim() || "Team 1"} `);
        }
        if(!team2Players){
            window.alert(`Inserisci tutti i giocatori per il team: ${team1Name.trim() || "Team 2"} `);
        }

        const teams: CreateBookingTeamDto[] = [
            { 
                teamName: team1Name.trim() || "Team 1", 
                players: team1Players 
            },
            {   
                teamName: team2Name.trim() || "Team 2", 
                players: team2Players 
            }
        ];

        var newBooking: CreateBookingDto = {
            courtId: selectedCourt.id,
            description: "Prenotazione da: " + auth.username,
            startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
            slots: 1,
            teams: teams
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

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-base">Componi i Team</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TEAM 1 */}
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-3">
                        <div className="relative">
                            <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">
                                <Edit3 className="w-3.5 h-3.5" />
                            </span>
                            <Input
                                type="text"
                                value={team1Name}
                                onChange={(e) => setTeam1Name(e.target.value)}
                                placeholder="Nome Team 1"
                                className="w-full pl-8 pr-3 py-1.5 text-sm font-medium text-primary bg-background/80 border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {renderPlayerSlot(0)}
                        {renderPlayerSlot(1)}
                    </div>

                    {/* TEAM 2 */}
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-3">
                        <div className="relative">
                            <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">
                                <Edit3 className="w-3.5 h-3.5" />
                            </span>
                            <Input
                                type="text"
                                value={team2Name}
                                onChange={(e) => setTeam2Name(e.target.value)}
                                placeholder="Nome Team 2"
                                className="w-full pl-8 pr-3 py-1.5 text-sm font-medium text-amber-600 bg-background/80 border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        {renderPlayerSlot(2)}
                        {renderPlayerSlot(3)}
                    </div>
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

            {/* Dialogs */}
            <AddGuestForBookingDialog
                isOpen={dialogType === 'GUEST'}
                onClose={() => { setDialogType(null); setActiveDialogSlot(null); }}
                onAddGuest={handleAssignPlayer}
            />

            <AddUserForBookingDialog
                isOpen={dialogType === 'REGISTERED'}
                onClose={() => { setDialogType(null); setActiveDialogSlot(null); }}
                onSelectUser={handleAssignPlayer}
            />
        </div>
    );
}