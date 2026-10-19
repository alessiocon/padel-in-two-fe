import { useContext, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { apiClient } from "../../../client/apiClient";
import { BookingPlayerStatus } from "../../../client/model/common/Enum/booking.player.status";
import type { CreateBookingPlayerDto } from "../../../client/model/request/create.booking.player.dto";
import type { BookingDetailResDto } from "../../../client/model/response/booking.detail.res.dto";
import { AuthContext } from "../../../store/context";
import { AddTeamPlayer } from "../add.team.player";
import { ManageTeamPlayer } from "../menage.team.player";
import { AddGuestForBookingDialog } from "../../dialog/add.guest.for.booking.dialog";
import { AddUserForBookingDialog } from "../../dialog/add.user.for.booking.dialog";

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
    const isCaptainPlaced = Boolean(auth?.id && booking.teams.some((team) => (
        team.players.some((player) => player.userId === auth.id)
    )));

    const invitePlayer = async (teamId: string, player: CreateBookingPlayerDto) => {
        if (requestInFlight.current) return;
        if (player.userId && booking.teams.some((team) => team.players.some((currentPlayer) => currentPlayer.userId === player.userId))) {
            window.alert("Questo utente partecipa già alla partita!");
            return;
        }
        if (player.phone && booking.teams.some((team) => team.players.some((currentPlayer) => currentPlayer.phone === player.phone))) {
            window.alert("Questo numero è già inserito per un altro player!");
            return;
        }

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
                    player.userId
                        ? bookingPlayer.userId === player.userId
                        : player.phone
                            ? bookingPlayer.phone === player.phone
                            : bookingPlayer.firstName === player.firstName && bookingPlayer.lastName === player.lastName
                ));
            const playerToAdd = {
                id: responsePlayer?.id ?? player.userId ?? player.phone ?? crypto.randomUUID(),
                username: player.username ?? responsePlayer?.username,
                userId: player.userId ?? responsePlayer?.userId,
                status: responsePlayer?.status ?? (player.userId ? BookingPlayerStatus.PENDING : BookingPlayerStatus.ACCEPTED),
                type: player.userId ? "REGISTERED" as const : "GUEST" as const,
                firstName: player.firstName ?? responsePlayer?.firstName ?? null,
                lastName: player.lastName ?? responsePlayer?.lastName ?? null,
                phone: player.phone ?? responsePlayer?.phone ?? null,
            };

            setBookings((currentBookings) => currentBookings?.map((currentBooking) => (
                currentBooking.id === booking.id
                    ? {
                        ...currentBooking,
                        logs: updatedBooking.logs ?? currentBooking.logs,
                        teams: currentBooking.teams.map((team) => (
                            team.id === teamId
                                ? {
                                    ...team,
                                    players: team.players.some((currentPlayer) => (
                                        (player.userId && currentPlayer.userId === player.userId)
                                        || (player.phone && currentPlayer.phone === player.phone)
                                    )) ? team.players : [...team.players, playerToAdd],
                                }
                                : team
                        )),
                    }
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
        setDialogType(null);
        setActiveTeamId(null);
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
                    <div key={team.id || teamIdx} className="p-3 bg-muted/30 border border-border/40 space-y-2">
                        <h5 className="font-semibold text-xs text-primary">{team.teamName || `Team ${teamIdx + 1}`}</h5>
                        <div className="space-y-2">
                            {[0, 1].map((slotIdx) => {
                                const player = team.players[slotIdx];
                                if (player) {
                                    return (
                                        <ManageTeamPlayer
                                            key={player.id}
                                            teamId={team.id}
                                            index={slotIdx}
                                            player={player}
                                            bookingState={bookingState}
                                            currentUserId={auth?.id}
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
                                            userId: auth.id,
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
                        </div>
                    </div>
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