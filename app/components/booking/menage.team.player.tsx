import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { LoaderCircle, Trash2 } from "lucide-react";
import { apiClient } from "../../client/apiClient";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";
import type { BookingPlayerResDto } from "../../client/model/response/booking.player.res.dto";
import type { BookingUserResDto } from "../../client/model/response/BookingUserResDto";

interface ManageTeamPlayerProps {
    index: number;
    teamId: string;
    player: CreateBookingPlayerDto | BookingPlayerResDto;
    bookingState?: [BookingUserResDto, React.Dispatch<React.SetStateAction<BookingUserResDto[] | null>>];
    currentUserId?: string;
    onRemovePlayer?: (index: number) => void;
}

export function ManageTeamPlayer({
    index,
    teamId,
    player,
    bookingState,
    currentUserId,
    onRemovePlayer,
}: ManageTeamPlayerProps) {
    const [isRemoving, setIsRemoving] = useState(false);
    const requestInFlight = useRef(false);
    const isMe = Boolean(currentUserId && player.userId === currentUserId);
    const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");

    const handleRemove = async () => {
        if (requestInFlight.current) return;
        if (!bookingState) {
            onRemovePlayer?.(index);
            return;
        }

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
        <div className="relative p-3 rounded-md bg-card border border-border/50 flex items-center justify-between gap-2">
            <div>
                <p className="text-xs text-muted-foreground font-medium">
                    Giocatore {index + 1} {isMe && "(Tu)"}
                </p>
                {player.userId ? (
                    <p>{player.username || "Utente"}</p>
                ) : (
                    <p className="text-sm font-semibold">{playerName || "Ospite"}</p>
                )}
            </div>
            <Button
                size="sm"
                variant="ghost"
                disabled={isRemoving}
                onClick={() => void handleRemove()}
                className="text-destructive h-8 w-8 p-0 hover:bg-destructive/10"
                aria-label="Rimuovi giocatore"
            >
                {isRemoving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
            {isRemoving && (
                <div role="status" className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/85 text-xs font-semibold">
                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                    Rimozione in corso...
                </div>
            )}
        </div>
    );
}