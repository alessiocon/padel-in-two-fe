import React, { useContext, useState } from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, Timer, Shield, CheckCircle2, XCircle, Clock, Terminal, ChevronDown, ChevronUp, UserPlus, Users, Trash2, UserCheck } from "lucide-react";
import { dateHelper } from "../helper/dateHelper";
import { Button } from "./../components/ui/button";
import { bookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import { AuthContext } from "../store/context";
import type { BookingUserResDto } from "../client/model/response/BookingUserResDto";

interface BookingCardProps {
    booking: BookingUserResDto;
    onDelete: (booking: BookingUserResDto) => void;
    onConfirmInvite?: (bookingId: string) => void;
    onRejectInvite?: (bookingId: string) => void;
    onAddPlayerToBooking?: (bookingId: string, teamIndex: number, playerDto: any) => void;
    onRemovePlayerFromBooking?: (bookingId: string, playerId: string) => void;
}

export const CardBookingUser: React.FC<BookingCardProps> = ({ 
    booking, 
    onDelete, 
    onConfirmInvite, 
    onRejectInvite,
    onAddPlayerToBooking,
    onRemovePlayerFromBooking
}) => {
    const [auth] = useContext(AuthContext);
    const [isLogsOpen, setIsLogsOpen] = useState(false);

    // Verifica se l'utente corrente è il proprietario/creatore della prenotazione
    const isOwner = auth?.id && booking.createdBy?.id ? booking.createdBy.id === auth.id : true;

    const renderStatusBadge = (status: string) => {
        const baseClasses = "text-xs px-2.5 py-1 rounded-full font-medium border";

        const statusConfig: Record<string, { label: string; classes: string }> = {
            confirmed: {
                label: "Confermato",
                classes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            },
            reserved: {
                label: "Riservato",
                classes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            },
            pending: {
                label: "In attesa",
                classes: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            },
            cancelled: {
                label: "Annullato",
                classes: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            },
        };

        const currentStatus = statusConfig[status?.toLowerCase()];

        if (!currentStatus) {
            return (
                <span className={`${baseClasses} bg-muted text-muted-foreground border-border`}>
                    {status}
                </span>
            );
        }

        return (
            <span className={`${baseClasses} ${currentStatus.classes}`}>
                {currentStatus.label}
            </span>
        );
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

    const handleAssignMe = (teamIdx: number) => {
        if (!auth?.auth || !auth?.id) {
            window.alert("Devi effettuare l'accesso");
            return;
        }

        const playerDto = {
            userId: auth.id,
            firstName: auth.username || "Tu",
            lastName: ""
        };

        onAddPlayerToBooking?.(booking.id, teamIdx, playerDto);
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
                    {renderStatusBadge(booking.status)}
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
                                            const isCurrentAuthUser = auth?.id && player?.userId === auth.id;

                                            if (player && (player.firstName || player.lastName || player.userId)) {
                                                return (
                                                    <div key={player.id || slotIdx} className="p-2.5 bg-card border border-border/50 flex items-center justify-between gap-2">
                                                        <div>
                                                            <p className="text-xs font-medium">
                                                                {player.firstName} {player.lastName} {isCurrentAuthUser && "(Tu)"}
                                                            </p>
                                                            {!player.userId && (
                                                                <span className="text-[10px] text-muted-foreground italic">Ospite</span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {renderPlayerStatusBadge(player.status)}

                                                            {/* Conferma/Rifiuta invito per l'utente invitato */}
                                                            {isCurrentAuthUser && player.status?.toLowerCase() === 'pending' && (
                                                                <div className="flex items-center gap-1 ml-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => onConfirmInvite?.(booking.id)}
                                                                        className="h-7 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                                                                    >
                                                                        Conferma
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => onRejectInvite?.(booking.id)}
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
                                                    <div key={slotIdx} className="p-2.5 bg-card border border-border/50 flex items-center justify-between gap-2 border-dashed">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground font-medium">Slot {slotIdx + 1}</p>
                                                            <p className="text-[10px] text-muted-foreground italic">Slot disponibile</p>
                                                        </div>

                                                        {isOwner && auth?.auth && (
                                                            <div className="flex items-center gap-1 flex-wrap justify-end">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="default" 
                                                                    onClick={() => handleAssignMe(teamIdx)} 
                                                                    className="text-[10px] h-7 bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-2"
                                                                >
                                                                    <UserCheck className="w-3 h-3 mr-1" /> Io
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    onClick={() => onAddPlayerToBooking?.(booking.id, teamIdx, null)} 
                                                                    className="text-[10px] h-7 px-2"
                                                                >
                                                                    <UserPlus className="w-3 h-3 mr-1" /> Ospite
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="secondary" 
                                                                    onClick={() => onAddPlayerToBooking?.(booking.id, teamIdx, null)} 
                                                                    className="text-[10px] h-7 px-2"
                                                                >
                                                                    <Users className="w-3 h-3 mr-1" /> Utente
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
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

            {/* Sezione Tendina Log in Basso */}
            <div className="border border-border/40 bg-muted/20">
                <button
                    type="button"
                    onClick={() => setIsLogsOpen(!isLogsOpen)}
                    className="w-full flex items-center justify-between p-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        <span>Visualizza Log Attività & Cronologia ({booking.logs?.length || 0})</span>
                    </div>
                    {isLogsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isLogsOpen && (
                    <div className="p-3 border-t border-border/40 bg-background/50 space-y-2 text-xs font-mono text-muted-foreground">
                        {booking.logs && booking.logs.length > 0 ? (
                            booking.logs.map((log, lIdx) => (
                                <div key={lIdx} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                                    <span>{log.message || "Evento di sistema"}</span>
                                    <span className="text-[10px]">{log.createdAt ? dateHelper.formatDate(log.createdAt) : ""}</span>
                                </div>
                            ))
                        ) : (
                            <p className="italic text-center py-1">Nessun log disponibile per questa prenotazione.</p>
                        )}
                    </div>
                )}
            </div>

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
        </div>
    );
};