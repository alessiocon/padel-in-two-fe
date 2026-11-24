import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { LoaderCircle, Trash2, Check, X } from "lucide-react";
import { apiClient } from "../../client/apiClient";
import type { BookingPlayerResDto } from "../../client/model/response/booking.player.res.dto";
import type { BookingDetailResDto } from "../../client/model/response/booking.detail.res.dto";
import { PlayerStatusBadge } from "../budge/player.status.badge";
import { BookingPlayerStatus } from "../../client/model/common/Enum/booking.player.status";


interface ManageTeamPlayerProps {
    index: number;
    teamId: string;
    player: BookingPlayerResDto;
    bookingState: [BookingDetailResDto, React.Dispatch<React.SetStateAction<BookingDetailResDto[] | null>>];
}

export function ManageTeamPlayer({
    index,
    teamId,
    player,
    bookingState,
}: ManageTeamPlayerProps) {
    const [isRemoving, setIsRemoving] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeciding, setIsDeciding] = useState(false);
    const requestInFlight = useRef(false);

    const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");
    const [booking, setBookings] = bookingState;

    const handleRemove = async () => {
        if (requestInFlight.current) return;

        const playerId = "id" in player ? player.id : undefined;
        if (!playerId) return;

        requestInFlight.current = true;
        setIsRemoving(true);
        try {
            const response = await apiClient.removeBookingPlayer(booking.id, {playerId, teamId: teamId, username: player.username ?? playerName});
            if (!response.IsSuccess) {
                window.alert(response.Error?.message || "Errore durante la rimozione del giocatore.");
                return;
            }

            setBookings((currentBookings) => currentBookings?.map((currentBooking) => (
                currentBooking.id === booking.id
                    ? {
                        ...currentBooking,
                        logs: response.Data?.logs ?? currentBooking.logs,
                        teams: currentBooking.teams.map((team) => ({
                            ...team,
                            players: team.players.filter((currentPlayer) => currentPlayer.id !== playerId),
                        })),
                    }
                    : currentBooking
            )) ?? null);
        } catch {
            window.alert("Errore durante la rimozione del giocatore.");
        } finally {
            requestInFlight.current = false;
            setIsRemoving(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (requestInFlight.current) return;

        const playerId = "id" in player ? player.id : undefined;
        if (!playerId) return;

        requestInFlight.current = true;
        setIsAccepting(true);
        try {
            const response = await apiClient.decidePublicJoinRequest(booking.id, playerId, {
                accepted: true,
            });

            if (!response.IsSuccess) {
                window.alert(response.Error?.message || "Errore nell'accettazione della richiesta.");
                return;
            }

            // Ricarica la prenotazione
            const bookingResponse = await apiClient.getBooking(booking.id);
            if (bookingResponse.IsSuccess && bookingResponse.Data) {
                setBookings([bookingResponse.Data]);
            }

            window.alert("Richiesta accettata!");
        } catch {
            window.alert("Errore durante l'accettazione della richiesta.");
        } finally {
            requestInFlight.current = false;
            setIsAccepting(false);
        }
    };

    const handleDeclineRequest = async () => {
        if (requestInFlight.current) return;

        const playerId = "id" in player ? player.id : undefined;
        if (!playerId) return;

        requestInFlight.current = true;
        setIsDeciding(true);
        try {
            const response = await apiClient.decidePublicJoinRequest(booking.id, playerId, {
                accepted: false,
            });

            if (!response.IsSuccess) {
                window.alert(response.Error?.message || "Errore nel rifiuto della richiesta.");
                return;
            }

            // Ricarica la prenotazione
            const bookingResponse = await apiClient.getBooking(booking.id);
            if (bookingResponse.IsSuccess && bookingResponse.Data) {
                setBookings([bookingResponse.Data]);
            }

            window.alert("Richiesta rifiutata");
        } catch {
            window.alert("Errore durante il rifiuto della richiesta.");
        } finally {
            requestInFlight.current = false;
            setIsDeciding(false);
        }
    };

    return (
        <div className="relative p-2 bg-background border border-border mb-4">
            <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-medium">
                    Giocatore {index + 1}
                </p>

                <PlayerStatusBadge status={(player as BookingPlayerResDto).status}/>
            </div>
 
            <div className="flex justify-between items-center mt-4">
                {player.playerId 
                    ? <p>{player.username || "Utente"}</p>
                    : <p className="text-sm font-semibold">{playerName || "Ospite"}</p>
                }
                
                {/* Se lo status è REQUESTED, mostra bottoni Accetta/Rifiuta */}
                {player.status === BookingPlayerStatus.REQUESTED ? (
                    <div className="flex gap-5">
                        <Button
                            size="xs"
                            disabled={isAccepting || isDeciding}
                            onClick={() => void handleAcceptRequest()}
                            aria-label="Accetta richiesta"
                        >
                            {isAccepting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                            size="xs"
                            variant="secondary"
                            disabled={isAccepting || isDeciding}
                            onClick={() => void handleDeclineRequest()}
                            aria-label="Rifiuta richiesta"
                        >
                            {isDeciding ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        </Button>
                    </div>
                ) : (
                    /* Altrimenti mostra bottone Rimuovi */
                    <Button
                        size="xs"
                        variant="destructive"
                        disabled={isRemoving}
                        onClick={() => void handleRemove()}
                        aria-label="Rimuovi giocatore"
                    >
                        {isRemoving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        rimuovi
                    </Button>
                )}
            </div>
        </div>
    );
}