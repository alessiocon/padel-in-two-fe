import type { ClubCourtDto } from "../../client/model/common/ClubCourtDto";
import { useContext, useState } from "react";
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
import { ManageTeamPlayerPrenotation } from "./menage.team.player.prenotation";

export interface IEditTeamPrenotationProps {
    clubId: string | null;
    selectedDate: string;
    slotState: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
    bookingsState: [BookingQuickResDto[] | null, React.Dispatch<React.SetStateAction<BookingQuickResDto[] | null>>];
    selectedCourtState: [ClubCourtDto | null, React.Dispatch<React.SetStateAction<ClubCourtDto | null>>];
    isLoadingBookingsState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    onCancel: () => void;
}

export function EditTeamPrenotation({
    clubId,
    selectedDate,
    slotState,
    bookingsState,
    isLoadingBookingsState,
    selectedCourtState,
    onCancel
}: IEditTeamPrenotationProps) {
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

    const isCaptainPlaced = players.some(p => p?.userId && auth?.id && p.userId === auth.id);

    const teams = [
        {
            name: team1Name,
            setName: setTeam1Name,
            placeholder: "Nome Team 1",
            colorClasses: "text-primary focus:ring-primary",
            playerSlots: [0, 1],
        },
        {
            name: team2Name,
            setName: setTeam2Name,
            placeholder: "Nome Team 2",
            colorClasses: "text-amber-600 focus:ring-amber-500",
            playerSlots: [2, 3],
        },
    ];

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


    const renderPlayerSlot = (index: number) => {
        const player = players[index];
        if (player) {
            return (
                <ManageTeamPlayerPrenotation
                    key={index}
                    index={index}
                    playerState={[players, setPlayers]}
                    currentUserId={auth?.id}
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
        if (!selectedCourt?.id || !selectedSlot || !clubId) return;
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
        <div className="p-2 pt-3">
            <div className="mb-4 text-right">
                <Button type="button" variant="outline" className="bg-destructive/70" onClick={onCancel}>
                    Annulla
                </Button>
            </div>
            <div className="my-8 flex gap-3 justify-between ">
                <div>
                    <h3 className="text-xl font-bold">
                        {selectedCourt.name} <span className="text-sm font-normal text-muted-foreground">({selectedCourt.isIndoor ? "Indoor" : "Outdoor"})</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        <strong className="text-foreground">{selectedDate}</strong> - <strong className="text-foreground">{selectedSlot}</strong>
                    </p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">Prezzo</p>
                        <p className="text-2xl font-extrabold text-primary">€ {selectedCourt.price?.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {auth?.auth && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">Componi i Team</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team, teamIndex) => (
                            <div key={teamIndex} className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-3">
                                <div className="relative">
                                    <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </span>
                                    <Input
                                        type="text"
                                        value={team.name}
                                        onChange={(event) => team.setName(event.target.value)}
                                        placeholder={team.placeholder}
                                        className={`w-full rounded-md border border-border/50 bg-background/80 py-1.5 pl-8 pr-3 text-sm font-medium focus:outline-none focus:ring-2 ${team.colorClasses}`}
                                    />
                                </div>
                                {team.playerSlots.map(renderPlayerSlot)}
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Pulsante di Invio Prenotazione Finale / Link Auth */}
            <div className="flex justify-end pt-2">
                {auth?.auth ? (
                    <Button 
                        type="button" 
                        disabled={isLoadingBookings || players.length < 4}
                        onClick={sendBooking}
                    >
                        {isLoadingBookings ? "Invio in corso..." : "Conferma"}
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