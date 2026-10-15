import React, { useContext } from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, Timer, Shield } from "lucide-react";
import { dateHelper } from "../../../helper/dateHelper";
import { Button } from "../../ui/button";
import { ViewBookingLogs } from "../logs/view.booking.logs";
import { AddTeamPlayer } from "../add.team.player";
import { PlayerPrenotation } from "./player.prenotation";
import { PlayerPrenotationManagement } from "./player.prenotation.menagment";
import { bookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import { AuthContext } from "../../../store/context";
import type { BookingUserResDto } from "../../../client/model/response/BookingUserResDto";

interface CardUserPrenotationProps {
    bookingState: [BookingUserResDto, React.Dispatch<React.SetStateAction<BookingUserResDto[] | null>>];
    onDelete: (booking: BookingUserResDto) => void;
}

export const CardUserPrenotation: React.FC<CardUserPrenotationProps> = ({ 
    bookingState,
    onDelete, 
}) => {
    const [auth] = useContext(AuthContext);
    const [booking] = bookingState;
    const isOwner = Boolean(auth?.id && booking.createdBy?.id && booking.createdBy.id === auth.id);

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
                label: "In attesa di conferma",
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

            {/* Team e azioni specifiche per ruolo */}
            {booking.teams && booking.teams.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Composizione Team</h4>
                    </div>
                    {isOwner ? (
                        <PlayerPrenotationManagement
                            bookingState={bookingState}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {booking.teams.map((team, teamIdx) => (
                                <div key={team.id || teamIdx} className="p-3 bg-muted/30 border border-border/40 space-y-2">
                                    <h5 className="font-semibold text-xs text-primary">{team.teamName || `Team ${teamIdx + 1}`}</h5>
                                    <div className="space-y-2">
                                        {[0, 1].map((slotIdx) => {
                                            const player = team.players[slotIdx];
                                            if (player) {
                                                return (
                                                    <PlayerPrenotation
                                                        key={player.id || slotIdx}
                                                        bookingState={bookingState}
                                                        player={player}
                                                        isCurrentUser={Boolean(auth?.id && player.userId === auth.id)}
                                                    />
                                                );
                                            }

                                            return (
                                                <AddTeamPlayer
                                                    key={slotIdx}
                                                    index={slotIdx}
                                                    isCaptainPlaced={false}
                                                    isAuthenticated={Boolean(auth?.auth)}
                                                    canManage={false}
                                                    onAssignMe={() => undefined}
                                                    onOpenGuestDialog={() => undefined}
                                                    onOpenRegisteredDialog={() => undefined}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
        </div>
    );
};