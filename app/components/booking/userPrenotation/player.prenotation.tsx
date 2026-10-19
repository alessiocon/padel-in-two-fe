import { useRef, useState } from "react";
import { XCircle } from "lucide-react";
import { apiClient } from "../../../client/apiClient";
import { BookingPlayerStatus } from "../../../client/model/common/Enum/booking.player.status";
import type { BookingDetailResDto } from "../../../client/model/response/booking.detail.res.dto";
import type { BookingPlayerResDto } from "../../../client/model/response/booking.player.res.dto";
import { Button } from "../../ui/button";

interface PlayerMePrenotationProps {
    bookingState: [BookingDetailResDto, React.Dispatch<React.SetStateAction<BookingDetailResDto[] | null>>];
    player: BookingPlayerResDto;
}

export function PlayerMePrenotation({ bookingState, player }: PlayerMePrenotationProps) {
    const [booking, setBookings] = bookingState;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const requestInFlight = useRef(false);

    const respondToInvitation = async (accepted: boolean) => {
        if (requestInFlight.current) return;

        requestInFlight.current = true;
        setIsSubmitting(true);
        try {
            const response = await apiClient.updateBookingPlayer(booking.id, { accepted });
            if (!response.IsSuccess) {
                window.alert(response.Error?.message || "Errore durante la risposta all'invito.");
                return;
            }

            if (!accepted) {
                setBookings((currentBookings) => currentBookings?.filter((currentBooking) => currentBooking.id !== booking.id) ?? null);
                return;
            }

            setBookings((currentBookings) => currentBookings?.map((currentBooking) => (
                currentBooking.id === booking.id
                    ? {
                        ...currentBooking,
                        logs: response.Data?.logs ?? currentBooking.logs,
                        teams: currentBooking.teams.map((team) => ({
                            ...team,
                            players: team.players.map((currentPlayer) => (
                               currentPlayer.userId === player.userId
                                    ? { ...currentPlayer, status: BookingPlayerStatus.ACCEPTED }
                                    : currentPlayer
                            )),
                        })),
                    }
                    : currentBooking
            )) ?? null);
        } catch {
            window.alert("Errore durante la risposta all'invito.");
        } finally {
            requestInFlight.current = false;
            setIsSubmitting(false);
        }
    };

    const cancelAcceptedBooking = async () => {
        if (requestInFlight.current) return;

        const team = booking.teams.find((currentTeam) => (
            currentTeam.players.some((currentPlayer) => currentPlayer.id === player.id)
        ));
        if (!team) {
            window.alert("Impossibile trovare il team del giocatore.");
            return;
        }

        requestInFlight.current = true;
        setIsSubmitting(true);
        try {
            const response = await apiClient.updateBookingPlayer(booking.id, {
               accepted: false
            });
            if (!response.IsSuccess) {
                window.alert(response.Error?.message || "Impossibile annullare la partecipazione.");
                return;
            }

            setBookings((currentBookings) => currentBookings?.filter((currentBooking) => currentBooking.id !== booking.id) ?? null);
        } catch {
            window.alert("Errore durante l'annullamento della partecipazione.");
        } finally {
            requestInFlight.current = false;
            setIsSubmitting(false);
        }
    };

    const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");
    const isPending = player.status === BookingPlayerStatus.PENDING;
    const isAccepted = player.status === BookingPlayerStatus.ACCEPTED;

    return (
        <div className="relative p-2.5 bg-card border border-border/50">
            <p className="text-xs font-medium mb-2"> {player.username} (Tu) </p>

            <div className="flex items-center gap-2 justify-end">
                {isPending && (
                    <div className="flex items-center gap-1">
                        <Button
                            size="xs"
                            variant="default"
                            disabled={isSubmitting}
                            onClick={() => void respondToInvitation(true)}
                        >
                            Accetta
                        </Button>
                        <Button
                            size="xs"
                            variant="destructive"
                            disabled={isSubmitting}
                            onClick={() => void respondToInvitation(false)}
                            className=""
                        >
                            Rifiuta
                        </Button>
                    </div>
                )}

                {isAccepted && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => void cancelAcceptedBooking()}
                        className="h-7 text-[10px] text-rose-600 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20"
                    >
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Annulla partecipazione
                    </Button>
                )}
            </div>
        </div>
    );
}