import { useContext, useRef, useState } from "react";
import { Car, LoaderCircle } from "lucide-react";
import { apiClient } from "../../../client/apiClient";
import { BookingPlayerStatus } from "../../../client/model/common/Enum/booking.player.status";
import type { CreateBookingPlayerDto } from "../../../client/model/request/create.booking.player.dto";
import type { BookingDetailResDto } from "../../../client/model/response/booking.detail.res.dto";
import { AuthContext } from "../../../store/context";
import { AddTeamPlayer } from "../add.team.player";
import { ManageTeamPlayer } from "../menage.team.player";
import { AddGuestForBookingDialog } from "../../dialog/add.guest.for.booking.dialog";
import { AddUserForBookingDialog } from "../../dialog/add.user.for.booking.dialog";
import type { BookingPlayerResDto } from "../../../client/model/response/booking.player.res.dto";
import { BookingStatus } from "../../../client/model/common/Enum/booking.status.dto";
import { PlayerOthersPrenotation } from "./player.others.prenotation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface PlayerPrenotationManagementProps {
    bookingState: [BookingDetailResDto, React.Dispatch<React.SetStateAction<BookingDetailResDto[] | null>>];
}

export function PlayerPrenotationManagement({ bookingState }: PlayerPrenotationManagementProps) {
    const [auth] = useContext(AuthContext);
    const [booking, setBookings] = bookingState;
    const [dialogType, setDialogType] = useState<"GUEST" | "REGISTERED" | null>(null);
    const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const requestInFlight = useRef(false);
    const isCaptainPlaced = Boolean(auth?.sub && booking.teams.some((team) => (
        team.players.some((player) => player.playerId === auth.playerId)
    )));

    const invitePlayer = async (teamId: string, player: CreateBookingPlayerDto) => {
        if (requestInFlight.current) return;
        if (player.playerId && booking.teams.some((team) => team.players.some((currentPlayer) => currentPlayer.playerId === player.playerId))) {
            window.alert("Questo utente partecipa già alla partita!");
            return;
        }
        if (player.phone && booking.teams.some((team) => team.players.some((currentPlayer) => currentPlayer.phone === player.phone))) {
            window.alert("Questo numero è già inserito per un altro player!");
            return;
        }

        setDialogType(null);
        setActiveTeamId(null);

        requestInFlight.current = true;
        setIsSubmitting(true);
        try {
            const response = await apiClient.inviteBookingPlayer(booking.id, { ...player, teamId });
            if (!response.IsSuccess || !response.Data) {
                window.alert(response.Error?.message || "Errore durante l'aggiunta del giocatore.");
                return;
            }

            const updatedBooking = response.Data;
            const responsePlayer = updatedBooking.teams
                .find((team) => team.id === teamId)
                ?.players.find((bookingPlayer) => (
                    player.playerId
                        ? bookingPlayer.playerId === player.playerId
                        : player.phone
                            ? bookingPlayer.phone === player.phone
                            : bookingPlayer.firstName === player.firstName && bookingPlayer.lastName === player.lastName
                ));

            if(!responsePlayer) return alert("aggiorna la pagina per verificare le modifiche");

            const playerToAdd : BookingPlayerResDto = {...responsePlayer};

            setBookings((currentBookings) => currentBookings?.map((currentBooking) => (
                currentBooking.id === booking.id
                    ? updatedBooking
                    : currentBooking
            )) ?? null);
            setDialogType(null);
            setActiveTeamId(null);
        } catch {
            window.alert("Errore durante l'aggiunta del giocatore.");
        } finally {
            requestInFlight.current = false;
            setIsSubmitting(false);
        }
    };

    const closePlayerDialog = () => {
        if (isSubmitting) return;
        setDialogType(null);
        setActiveTeamId(null);
    };

    const handlePlayerSelection = (player: CreateBookingPlayerDto) => {
        const teamId = activeTeamId;
        if (teamId) void invitePlayer(teamId, player);
    };

    return (
        <div className="space-y-3">
            {isSubmitting && (
                <div role="status" className="flex items-center justify-center gap-2 border border-primary/30 bg-primary/10 p-3 text-sm font-semibold text-primary">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Salvataggio giocatore in corso...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.teams.map((team, teamIdx) => (
                    <Card key={team.id || teamIdx} className="p-2 gap-1">
                        <CardHeader className="p-2">
                            <CardTitle>
                                {team.teamName || `Team ${teamIdx + 1}`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {[0, 1].map((slotIdx) => {
                                if(booking.status === BookingStatus.IN_PROGRESS) return <PlayerOthersPrenotation key={slotIdx} player={team.players[slotIdx]} />
                                
                                const player = team.players[slotIdx];
                                if (player) {
                                    return (
                                        <ManageTeamPlayer
                                            key={player.id}
                                            teamId={team.id}
                                            index={slotIdx}
                                            player={player}
                                            bookingState={bookingState}
                                        />
                                    );
                                }

                                return (
                                    <AddTeamPlayer
                                        key={slotIdx}
                                        index={slotIdx}
                                        isCaptainPlaced={isCaptainPlaced}
                                        isAuthenticated={Boolean(auth?.auth)}
                                        isLoading={isSubmitting}
                                        onAssignMe={() => void invitePlayer(team.id, {
                                            playerId: auth.playerId,
                                            username: auth.username || "Tu",
                                            firstName: auth.firstName,
                                            lastName: auth.lastName,
                                        })}
                                        onOpenGuestDialog={() => {
                                            setActiveTeamId(team.id);
                                            setDialogType("GUEST");
                                        }}
                                        onOpenRegisteredDialog={() => {
                                            setActiveTeamId(team.id);
                                            setDialogType("REGISTERED");
                                        }}
                                    />
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AddGuestForBookingDialog
                isOpen={dialogType === "GUEST"}
                onClose={closePlayerDialog}
                onAddGuest={handlePlayerSelection}
            />
            <AddUserForBookingDialog
                isOpen={dialogType === "REGISTERED"}
                onClose={closePlayerDialog}
                onSelectUser={handlePlayerSelection}
            />
        </div>
    );
}