import { useRef, useState } from "react";
import { CheckCircle2, Clock, LoaderCircle, XCircle } from "lucide-react";
import { apiClient } from "../../../client/apiClient";
import { BookingPlayerStatus } from "../../../client/model/common/Enum/booking.player.status";
import type { BookingUserResDto } from "../../../client/model/response/BookingUserResDto";
import type { BookingPlayerResDto } from "../../../client/model/response/booking.player.res.dto";
import { Button } from "../../ui/button";

interface PlayerPrenotationProps {
    bookingState: [BookingUserResDto, React.Dispatch<React.SetStateAction<BookingUserResDto[] | null>>];
    player: BookingPlayerResDto;
    isCurrentUser: boolean;
}

export function PlayerPrenotation({ bookingState, player, isCurrentUser }: PlayerPrenotationProps) {
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
        <div className="relative p-2.5 bg-card border border-border/50 flex items-center justify-between gap-2">
            <div>
                <p className="text-xs font-medium">
                    {playerName || (player.username ? `${player.username}` : "Utente")}{isCurrentUser && " (Tu)"}
                </p>
                {player.type === "GUEST" ? (
                    <span className="text-[10px] text-muted-foreground italic">Ospite</span>
                ) : player.username && playerName ? (
                    <span className="text-[10px] text-muted-foreground">@{player.username}</span>
                ) : null}
            </div>

            <div className="flex items-center gap-2">
                {((isCurrentUser && !isPending ) || !isCurrentUser) &&
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium border border-amber-500/20">
                        {player.status === BookingPlayerStatus.ACCEPTED ? <CheckCircle2 className="w-3 h-3" /> :
                            player.status === BookingPlayerStatus.DECLINED ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {player.status === BookingPlayerStatus.ACCEPTED ? "Confermato" :
                            player.status === BookingPlayerStatus.DECLINED ? "Rifiutato" : "In attesa"}
                    </span>
                }

                {isCurrentUser && isPending && (
                    <div className="flex items-center gap-1">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => void respondToInvitation(true)}
                            className="h-7 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                        >
                            Conferma
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => void respondToInvitation(false)}
                            className="h-7 text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20"
                        >
                            Rifiuta
                        </Button>
                    </div>
                )}

                {isCurrentUser && isAccepted && (
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

            {isSubmitting && (
                <div role="status" className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/85 text-sm font-semibold">
                    <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                    Invio risposta...
                </div>
            )}
        </div>
    );
}