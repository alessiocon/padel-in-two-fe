import type { ClubCourtDto } from "../../client/model/common/ClubCourtDto";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "../../client/apiClient";
import { Button } from "../ui/button";
import type { CreateBookingDto } from "../../client/model/request/create.booking.dto";
import { AuthContext } from "../../store/context";
import { Edit3, Lock, ArrowRight, Globe, Users, Info, ChevronDown, LockOpen, ChevronUp } from "lucide-react";
import { AddGuestForBookingDialog } from "../dialog/add.guest.for.booking.dialog";
import { AddUserForBookingDialog } from "../dialog/add.user.for.booking.dialog";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";
import type { CreateBookingTeamDto } from "../../client/model/request/create.booking.team.dto";
import { AddTeamPlayer } from "./add.team.player";
import { ManageTeamPlayer } from "./menage.team.player";
import { Input } from "../ui/input";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
import { ManageTeamPlayerPrenotation } from "./menage.team.player.prenotation";
import type { PricingRuleResDto } from "~/client/model/response/Pricing.rule.res.dto";
import { resolveCourtPrice } from "~/lib/pricing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { LevelSelect, PLAYER_LEVELS } from "../ui/level-select";
import { BookingJoinMode } from "~/client/model/common/Enum/booking.join.mode";

export interface IEditTeamPrenotationProps {
    clubId: string | null;
    selectedDate: string;
    slotState: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
    bookingsState: [BookingQuickResDto[] | null, React.Dispatch<React.SetStateAction<BookingQuickResDto[] | null>>];
    selectedCourtState: [ClubCourtDto | null, React.Dispatch<React.SetStateAction<ClubCourtDto | null>>];
    isLoadingBookingsState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    pricingRules?: PricingRuleResDto[];
    onCancel: () => void;
}

export function EditTeamPrenotation({
    clubId,
    selectedDate,
    slotState,
    bookingsState,
    isLoadingBookingsState,
    selectedCourtState,
    pricingRules,
    onCancel
}: IEditTeamPrenotationProps) {
    const navigate = useNavigate();
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

    const [isPublic, setIsPublic] = useState(false);
    const [minPlayerLevel, setMinPlayerLevel] = useState(1);
    const [maxPlayerLevel, setMaxPlayerLevel] = useState(5);
    const [joinMode, setJoinMode] = useState<BookingJoinMode>(BookingJoinMode.OPEN);
    const [isBookingTypeInfoOpen, setIsBookingTypeInfoOpen] = useState(false);
    const [isJoinModeInfoOpen, setIsJoinModeInfoOpen] = useState(false);
    const [isLevelsInfoOpen, setIsLevelsInfoOpen] = useState(false);

    const isCaptainPlaced = players.some(p => p?.playerId && auth?.playerId && p.playerId === auth.playerId);

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
        if (!auth?.auth || !auth?.sub) {
            window.alert("Devi effettuare l'accesso");
            return;
        }

        if (players.some(p => p?.playerId === auth.playerId)) {
            window.alert("Sei già inserito in questo match!");
            return;
        }

        setPlayers(prev => {
            const updated = [...prev];
            updated[index] = {
                playerId: auth.playerId,
                username: auth.username || "Tu",
                firstName: auth.firstName,
                lastName: auth.lastName
            };
            return updated;
        });
    };

    const handleAssignPlayer = (player: CreateBookingPlayerDto) => {
        if (activeDialogSlot === null) return;

        if (player.playerId && players.some(p => p?.playerId === player.playerId)) {
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

        if (isPublic) {
            // Prenotazione pubblica: nessuna validazione su 4 giocatori richiesti
            const teams: CreateBookingTeamDto[] = [];
            if (team1Players.length > 0) {
                teams.push({ 
                    teamName: team1Name.trim() || "Team 1", 
                    players: team1Players 
                });
            }
            if (team2Players.length > 0) {
                teams.push({   
                    teamName: team2Name.trim() || "Team 2", 
                    players: team2Players 
                });
            }

            const newBooking: CreateBookingDto = {
                courtId: selectedCourt.id,
                clubId,
                description: "Prenotazione da: " + auth.username,
                isPublic: true,
                joinMode: joinMode,
                minPlayerLevel: minPlayerLevel,
                maxPlayerLevel: maxPlayerLevel,
                startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
                slots: 1,
                teams: teams
            };

            setIsLoadingBookings(true);

            try {
                const res = await apiClient.createBooking(newBooking);

                if (!res.Data) {
                    if (res.Error) {
                        window.alert(res.Error?.message);
                    } else {
                        throw new Error("Errore durante la prenotazione");
                    }
                    return;
                }
                const createdBooking = res.Data;
                navigate("/user");
                setBookings((prev) => [...(prev ?? []), createdBooking]);
                setSelectedSlot(null);
                window.alert("Campo prenotato correttamente!");
            } catch (error) {
                window.alert("Si è verificato un errore, riprova più tardi");
            } finally {
                setIsLoadingBookings(false);
            }
        } else {
            // Prenotazione privata: validazione richiesta (4 giocatori esatti)
            if (team1Players.length === 0) {
                window.alert(`Inserisci almeno un giocatore per il team: ${team1Name.trim() || "Team 1"}`);
                return;
            }

            if (team2Players.length === 0) {
                window.alert(`Inserisci almeno un giocatore per il team: ${team2Name.trim() || "Team 2"}`);
                return;
            }

            const team1HasUser = team1Players.some(p => p.playerId);
            const team2HasUser = team2Players.some(p => p.playerId);

            if (!team1HasUser || !team2HasUser) {
                const missingTeam = !team1HasUser && !team2HasUser ? "entrambi i team non hanno" : (!team1HasUser ? "il Team 1 non ha" : "il Team 2 non ha");
                
                const confirmed = window.confirm(
                    `${missingTeam} nessun utente registrato. Questa partita non verrà conteggiata per le statistiche. Vuoi procedere comunque?`
                );

                if (!confirmed) return;
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

            const newBooking: CreateBookingDto = {
                courtId: selectedCourt.id,
                clubId,
                description: "Prenotazione da: " + auth.username,
                startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
                slots: 1,
                teams: teams
            };

            setIsLoadingBookings(true);

            try {
                const res = await apiClient.createBooking(newBooking);

                if (!res.Data) {
                    if (res.Error) {
                        window.alert(res.Error?.message);
                    } else {
                        throw new Error("Errore durante la prenotazione");
                    }
                    return;
                }
                const createdBooking = res.Data;
                navigate("/user");
                setBookings((prev) => [...(prev ?? []), createdBooking]);
                setSelectedSlot(null);
                window.alert("Campo prenotato correttamente!");
            } catch (error) {
                window.alert("Si è verificato un errore, riprova più tardi");
            } finally {
                setIsLoadingBookings(false);
            }
        }
    }

    if (!selectedSlot || !selectedCourt) return null;

    const pricing = resolveCourtPrice(selectedCourt, pricingRules, selectedDate, selectedSlot);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <Card className="mb-6 gap-1 py-2 md:col-span-full">
                <Button type="button" className="ml-auto mr-2" variant="secondary" onClick={onCancel}>
                    Annulla
                </Button>
                <div className="my-4 flex gap-3 justify-between px-4">
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
                            <p className="text-xs text-muted-foreground">
                                {pricing.appliedRule ? `Prezzo (${pricing.appliedRule.name})` : "Prezzo"}
                            </p>
                            {pricing.appliedRule && pricing.finalPrice !== pricing.basePrice && (
                                <p className="text-sm text-muted-foreground line-through">€ {pricing.basePrice.toFixed(2)}</p>
                            )}
                            <p className="text-2xl font-extrabold text-primary">€ {pricing.finalPrice.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </Card>
            

            {/* Tipo Prenotazione Section */}
            {auth?.auth && (<Card className="mb-6 gap-1 py-4">
                <CardHeader className="mb-1 px-2">
                    <CardTitle className="text-lg text-center md:text-left">Tipo Prenotazione</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                    <div className="grid grid-rows-2 gap-3">
                        <Button
                            onClick={() => setIsPublic(false)}
                            variant={!isPublic ? "default" : "outline"}
                           className={isPublic ? "bg-background" : ""}
                        >
                            <Lock className="w-4 h-4 inline mr-1 mb-0.5" />
                            <span className="text-sm font-medium">Partita Privata</span>
                        </Button>
                        <Button
                            onClick={() => setIsPublic(true)}
                            variant={isPublic ? "default" : "outline"}
                            className={!isPublic ? "bg-background" : ""}
                        >
                            <Globe className="w-4 h-4 inline mr-1 mb-0.5" />
                            <span className="text-sm font-medium">Partita Pubblica</span>
                        </Button>
                    </div>
                    <Collapsible open={isBookingTypeInfoOpen} onOpenChange={setIsBookingTypeInfoOpen}>
                        <CollapsibleTrigger className="text-sm hover:text-foreground bg-background p-1">
                            <Info className="w-4 h-4 inline mr-1 mb-0.5" />
                            <span>Informazioni</span>
                            <ChevronDown className={`w-4 h-4 inline ml-1 mb-0.5 transition-transform ${isBookingTypeInfoOpen ? "rotate-180" : ""}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="text-sm text-muted-foreground space-y-4 bg-background p-2">
                            <p><strong>Partita Privata:</strong> Solo i giocatori inseriti manualmente partecipano alla partita. Richiede 4 giocatori esatti (2 per team).</p>
                            <p><strong>Partita Pubblica:</strong> Gli altri utenti possono richieste di partecipazione. Non richiede giocatori iniziali per essere creata.</p>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>)}

            {/* Configurazione Pubblica Section - visibile solo se isPublic=true */}
            {auth?.auth && (<>

                { isPublic 
                ? <Card className="gap-1 mb-6 py-4">
                        <CardHeader className="mb-1 px-2">
                            <CardTitle className="text-lg text-center md:text-left">Modalità di Accesso</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2">
                            <div className="grid grid-rows-2 gap-3">
                                <Button
                                    onClick={() => setJoinMode(BookingJoinMode.OPEN)}
                                    variant={joinMode === BookingJoinMode.OPEN ? "default" : "outline"}
                                    className={joinMode === BookingJoinMode.APPROVAL_REQUIRED ? "bg-background" : ""}
                                >
                                    <LockOpen className="w-4 h-4 inline mr-1 mb-0.5" />
                                    <span className="text-sm font-medium">Accesso Diretto</span>
                                </Button>
                                
                                <Button
                                    onClick={() => setJoinMode(BookingJoinMode.APPROVAL_REQUIRED)}
                                    variant={joinMode === BookingJoinMode.APPROVAL_REQUIRED ? "default" : "outline"}
                                    className={joinMode === BookingJoinMode.OPEN ? "bg-background" : ""}
                                >
                                    <Lock className="w-4 h-4 inline mr-1 mb-0.5" />
                                    <span className="text-sm font-medium">Conferma Prima</span>
                                </Button>

                                <p className="text-xs text-muted-foreground self-center">
                                    I giocatori {" "}  
                                    <span className="bg-secondary text-secondary-foreground">{joinMode === BookingJoinMode.OPEN
                                        ? ""
                                        : "NON"} POSSONO
                                    </span> partecipare senza approvazione.
                                </p>
                            </div>
                        </CardContent>
                    </Card> 
                : <div className="bg-card  mb-6"><p className="text-center p-20 text-muted-foreground">Modalità privata</p></div> }
                
                {isPublic 
                ? <Card className="relative z-20 mb-6 gap-2 overflow-visible py-4 md:col-span-full">
                    <CardHeader className="mb-1 px-2">
                        <CardTitle className="text-lg text-center md:text-left">Livello Consigliato</CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label
                                    htmlFor="minimum-player-level"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Minimo
                                </label>

                                <LevelSelect
                                    id="minimum-player-level"
                                    value={minPlayerLevel}
                                    onChange={(value) => {
                                        setMinPlayerLevel(value);
                                        setMaxPlayerLevel((current) => Math.max(current, value));
                                    }}
                                    placeholder="Seleziona minimo"
                                    className="mt-1"
                                    disabledValues={PLAYER_LEVELS
                                        .map(({ value }) => value)
                                        .filter((value) => value > maxPlayerLevel)}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="maximum-player-level"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Massimo
                                </label>

                                <LevelSelect
                                    id="maximum-player-level"
                                    value={maxPlayerLevel}
                                    onChange={(value) => {
                                        setMaxPlayerLevel(value);
                                        setMinPlayerLevel((current) => Math.min(current, value));
                                    }}
                                    placeholder="Seleziona massimo"
                                    className="mt-1"
                                    reverse
                                    disabledValues={PLAYER_LEVELS
                                        .map(({ value }) => value)
                                        .filter((value) => value < minPlayerLevel)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card> : <div className="bg-card md:col-span-full mb-6"><p className="p-20  text-center text-muted-foreground">Livello non necessario</p></div>}
            </>)}

            {auth?.auth && (
                <>
                {teams.map((team, teamIndex) => (
                    <Card className={`mb-6 gap-2 py-4`} key={teamIndex}>
                        <CardHeader className="mb-1 px-2">
                            <CardTitle className="text-lg text-center md:text-left">Componi Team {teamIndex + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2">
                            <div key={teamIndex} className="space-y-3">
                                <div className="relative">
                                    <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </span>
                                    <Input
                                        type="text"
                                        value={team.name}
                                        onChange={(event) => team.setName(event.target.value)}
                                        placeholder={team.placeholder}
                                        className={`w-full border border-foreground bg-background py-1.5 pl-8 pr-3 text-sm font-medium focus:outline-none focus:ring-2 ${team.colorClasses}`}
                                    />
                                </div>
                                {team.playerSlots.map(renderPlayerSlot)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </>)}


            {/* Pulsante di Invio Prenotazione Finale / Link Auth */}
            <div className="flex justify-end pt-2 md:col-start-2">
                {auth?.auth ? (
                    <Button 
                        type="button" 
                        disabled={isLoadingBookings || (isPublic ? false : players.length < 4)}
                        onClick={sendBooking}
                    >
                        {isLoadingBookings ? "Invio in corso..." : "Conferma"}
                    </Button>
                ) : (
                    <a href="/auth" className="w-full sm:w-auto">
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto font-bold px-8"
                        >
                            {(auth?.auth && !auth.playerId) ? "Accedi con un profilo giocatore" : "Effettua l'accesso per prenotare"}
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