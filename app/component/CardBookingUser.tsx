import React, { useContext, useState } from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, Timer, Shield, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { apiClient } from "../client/apiClient";
import { BookingPlayerStatus } from "../client/model/common/Enum/booking.player.status";
import { dateHelper } from "../helper/dateHelper";
import { Button } from "./../components/ui/button";
import { ViewBookingLogs } from "../components/booking/logs/view.booking.logs";
import { BookingStatusBadge } from "../components/budge/booking.status.badge";
import { FieldPlayerForBooking } from "../components/booking/field.player.for.booking";
import { AddGuestForBookingDialog } from "../components/dialog/add.guest.for.booking.dialog";
import { AddUserForBookingDialog } from "../components/dialog/add.user.for.booking.dialog";
import { bookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import { AuthContext } from "../store/context";
import type { CreateBookingPlayerDto } from "../client/model/request/create.booking.player.dto";
import type { BookingDetailResDto } from "../client/model/response/booking.detail.res.dto";

interface BookingCardProps {
    bookingState: [BookingDetailResDto, React.Dispatch<React.SetStateAction<BookingDetailResDto[] | null>>];
    onDelete: (booking: BookingDetailResDto) => void;
    onRemovePlayerFromBooking?: (bookingId: string, playerId: string) => void;
}

export const CardUserPrenotation: React.FC<BookingCardProps> = ({ 
    bookingState,
    onDelete, 
    onRemovePlayerFromBooking
}) => {
    const [auth] = useContext(AuthContext);
    const [booking, setBookings] = bookingState;
    const [dialogType, setDialogType] = useState<"GUEST" | "REGISTERED" | null>(null);
    const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

    const isBookingAccepted = async (bookingId: string, accepted: boolean) => {
        try {
            const response = await apiClient.updateBookingPlayer(bookingId, { accepted });
            if (!response.IsSuccess) {
                window.alert(response.Error?.message || "Errore durante la risposta all'invito.");
                return;
            }

            if (!accepted) {
                setBookings((currentBookings) => currentBookings?.filter((currentBooking) => currentBooking.id !== bookingId) ?? null);
                return;
            }

            setBookings((currentBookings) => currentBookings?.map((currentBooking) => (
                currentBooking.id === bookingId
                    ? {
                        ...currentBooking,
                        logs: response.Data?.logs || currentBooking.logs,
                        teams: currentBooking.teams.map((team) => ({
                            ...team,
                            players: team.players.map((player) => (
                                player.userId === auth.id ? { ...player, status: BookingPlayerStatus.ACCEPTED } : player
                            )),
                        })),
                    }
                    : currentBooking
            )) ?? null);
        } catch {
            window.alert("Errore durante la risposta all'invito.");
        }
    };

    // Verifica se l'utente corrente è il proprietario/creatore della prenotazione
    const isOwner = auth?.id && booking.createdBy?.id ? booking.createdBy.id === auth.id : true;

    const isCaptainPlaced = Boolean(auth?.id && booking.teams.some((team) => (
        team.players.some((player) => player.userId === auth.id)
    )));

    const invitePlayer = async (teamId: string, player: CreateBookingPlayerDto) => {
        if (player.userId && booking.teams.some((team) => team.players.some((currentPlayer) => currentPlayer.userId === player.userId))) {
            window.alert("Questo utente partecipa già alla partita!");
            return;
        }

        if (player.phone && booking.teams.some((team) => team.players.some((currentPlayer) => currentPlayer.phone === player.phone))) {
            window.alert("Questo numero è già inserito per un altro player!");
            return;
        }

        try {
            const response = await apiClient.inviteBookingPlayer(booking.id, { ...player, teamId });
            if (!response.IsSuccess || !response.Data) {
                window.alert(response.Error?.message || "Errore durante l'aggiunta del giocatore.");
                return;
            }

            const updatedBooking = response.Data;
            const responseTeam = updatedBooking.teams.find((team) => team.id === teamId);
            const responsePlayer = responseTeam?.players.find((bookingPlayer) => (
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
                                    ))
                                        ? team.players
                                        : [...team.players, playerToAdd],
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
        }
    };

    const handleAssignMe = (teamId: string) => {
        if (!auth?.auth || !auth?.id) {
            window.alert("Devi effettuare l'accesso");
            return;
        }

        void invitePlayer(teamId, {
            userId: auth.id,
            username: auth.username || "Tu",
            firstName: auth.firstName,
            lastName: auth.lastName,
        });
    };

    const handleDialogPlayer = (player: CreateBookingPlayerDto) => {
        if (activeTeamId) {
            void invitePlayer(activeTeamId, player);
        }
    };

    const closePlayerDialog = () => {
        setDialogType(null);
        setActiveTeamId(null);
    };

    const renderPlayerStatusBadge = (playerStatus?: string) => {
        switch (playerStatus?.toLowerCase()) {
            case 'confirmed':
            case 'accepted':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Confermato
                    </span>
                );
            case 'rejected':
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-medium border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> Rifiutato
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium border border-amber-500/20">
                        <Clock className="w-3 h-3" /> In attesa
                    </span>
                );
        }
    };

    return (
        <div className="flex flex-col p-5 bg-card border border-border/60 shadow-md gap-5 transition-colors">
            {/* Header Card: Info Campo, Data/Ora e Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                            {dateHelper.formatDate(booking.startsAt)}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            {booking.isCourtIndoor ? (
                                <DoorOpen className="h-4 w-4 text-primary" />
                            ) : (
                                <DoorClosed className="h-4 w-4 text-primary" />
                            )}
                            {booking.isCourtIndoor ? "Indoor" : "Outdoor"}
                        </span>
                    </div>

                    <h3 className="font-bold text-lg leading-tight mt-0.5">
                        {booking.courtName || "Campo da Padel"}
                    </h3>

                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Timer className="h-4 w-4 text-primary" />
                        {dateHelper.formatTime(booking.startsAt)} - {dateHelper.formatTime(booking.endsAt)}
                    </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                    <BookingStatusBadge status={booking.status} />
                </div>
            </div>

            {/* Sezione Teams e Giocatori */}
            {booking.teams && booking.teams.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Composizione Team</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {booking.teams.map((team, teamIdx) => {
                            const players = team.players || [];
                            const slots = [0, 1];

                            return (
                                <div key={team.id || teamIdx} className="p-3 bg-muted/30 border border-border/40 space-y-2">
                                    <h5 className="font-semibold text-xs text-primary">{team.teamName || `Team ${teamIdx + 1}`}</h5>
                                    <div className="space-y-2">
                                        {slots.map((slotIdx) => {
                                            const player = players[slotIdx];
                                            const isCurrentAuthUser = Boolean(auth?.id && player?.userId === auth.id);

                                            if (player && (player.firstName || player.lastName || player.userId || player.username)) {
                                                const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");

                                                return (
                                                    <div key={player.id || slotIdx} className="p-2.5 bg-card border border-border/50 flex items-center justify-between gap-2">
                                                        <div>
                                                            <p className="text-xs font-medium">
                                                                {playerName || (player.username ? `@${player.username}` : "Utente")} {isCurrentAuthUser && "(Tu)"}
                                                            </p>
                                                            {player.type === "GUEST" ? (
                                                                <span className="text-[10px] text-muted-foreground italic">Ospite</span>
                                                            ) : player.username && playerName ? (
                                                                <span className="text-[10px] text-muted-foreground">@{player.username}</span>
                                                            ) : null}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {renderPlayerStatusBadge(player.status)}

                                                            {/* Conferma/Rifiuta invito per l'utente invitato */}
                                                            {isCurrentAuthUser && player.status?.toLowerCase() === 'pending' && (
                                                                <div className="flex items-center gap-1 ml-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => isBookingAccepted(booking.id, true)}
                                                                        className="h-7 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                                                                    >
                                                                        Conferma
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => isBookingAccepted(booking.id, false)}
                                                                        className="h-7 text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20"
                                                                    >
                                                                        Rifiuta
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {/* Se è il proprietario E il giocatore NON è se stesso, può rimuoverlo */}
                                                            {isOwner && !isCurrentAuthUser && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => onRemovePlayerFromBooking?.(booking.id, player.id)}
                                                                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 ml-1"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <FieldPlayerForBooking
                                                        key={slotIdx}
                                                        index={slotIdx}
                                                        player={null}
                                                        isCaptainPlaced={isCaptainPlaced}
                                                        isAuthenticated={Boolean(auth?.auth)}
                                                        canManage={Boolean(isOwner)}
                                                        currentUserId={auth?.id}
                                                        onAssignMe={() => handleAssignMe(team.id)}
                                                        onRemovePlayer={() => undefined}
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
                                            }
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <ViewBookingLogs logs={booking.logs || []} />

            {/* Footer Azioni: Visualizza campo e Cancellazione (riservata al creatore) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                <Link to={`/clubs/${booking.clubId}`}>
                    <Button 
                        variant="default"
                        size="sm"
                        className="text-xs font-semibold"
                    >
                        Visualizza campo
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    {isOwner && (
                        <Button
                            disabled={booking.status === bookingStatus.CANCELLED}
                            type="button"
                            size="sm"
                            onClick={(e) => { e.preventDefault(); onDelete(booking); }}
                            className="text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 shadow-none"
                        >
                            Elimina Prenotazione
                        </Button>
                    )}
                </div>
            </div>
            <AddGuestForBookingDialog
                isOpen={dialogType === "GUEST"}
                onClose={closePlayerDialog}
                onAddGuest={handleDialogPlayer}
            />
            <AddUserForBookingDialog
                isOpen={dialogType === "REGISTERED"}
                onClose={closePlayerDialog}
                onSelectUser={handleDialogPlayer}
            />
        </div>
    );
};