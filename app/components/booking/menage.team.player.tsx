import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { LoaderCircle, Trash2 } from "lucide-react";
import { apiClient } from "../../client/apiClient";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";
import type { BookingPlayerResDto } from "../../client/model/response/booking.player.res.dto";
import type { BookingDetailResDto } from "../../client/model/response/booking.detail.res.dto";
import { PlayerStatusBadge } from "../budge/player.status.badge";


//TODO: QUESTO COMPNENTE DEV'ESSER UNICO E NON LO DEVE PIù UTILIZZARE IL SEND
interface ManageTeamPlayerProps {
    index: number;
    teamId: string;
    player: BookingPlayerResDto;
    bookingState: [BookingDetailResDto, React.Dispatch<React.SetStateAction<BookingDetailResDto[] | null>>];
    currentUserId: string;
}

export function ManageTeamPlayer({
    index,
    teamId,
    player,
    bookingState,
    currentUserId,
}: ManageTeamPlayerProps) {
    const [isRemoving, setIsRemoving] = useState(false);
    const requestInFlight = useRef(false);
    const isMe = Boolean(currentUserId && player.userId === currentUserId);
    const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");

    const handleRemove = async () => {
        if (requestInFlight.current) return;

        const [booking, setBookings] = bookingState;
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

    return (
        <div className="relative p-3 rounded-md bg-card border border-border/50">
            <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-medium">
                    Giocatore {index + 1} {isMe && "(Tu)"}
                </p>

                <PlayerStatusBadge status={(player as BookingPlayerResDto).status}/>
            </div>
 
            <div className="flex justify-between items-center">
                {player.userId 
                    ? <p>{player.username || "Utente"}</p>
                    : <p className="text-sm font-semibold">{playerName || "Ospite"}</p>
                }

                <Button
                    size="sm"
                    variant="ghost"
                    disabled={isRemoving}
                    onClick={() => void handleRemove()}
                    className="text-destructive  hover:bg-destructive/10 p-0"
                    aria-label="Rimuovi giocatore"
                >
                    {isRemoving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    rimuovi
                </Button>
            </div>
        </div>
    );
}