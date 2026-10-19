import React, { useContext } from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, Timer, Shield } from "lucide-react";
import { dateHelper } from "../../../helper/dateHelper";
import { Button } from "../../ui/button";
import { ViewBookingLogs } from "../logs/view.booking.logs";
import { AddTeamPlayer } from "../add.team.player";
import { PlayerMePrenotation } from "./player.prenotation";
import { PlayerPrenotationManagement } from "./player.prenotation.menagment";
import { BookingStatusBadge } from "../../budge/booking.status.badge";
import { bookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import { AuthContext } from "../../../store/context";
import type { BookingDetailResDto } from "~/client/model/response/booking.detail.res.dto";
import { PlayerOthersPrenotation } from "./player.others.prenotation";

interface CardUserPrenotationDetailProps {
    bookingState: [BookingDetailResDto, React.Dispatch<React.SetStateAction<BookingDetailResDto[] | null>>];
    onDelete: (booking: BookingDetailResDto) => void;
}

export const CardUserPrenotationDetail: React.FC<CardUserPrenotationDetailProps> = ({ 
    bookingState,
    onDelete, 
}) => {
    const [auth] = useContext(AuthContext);
    const [booking] = bookingState;
    const isOwner = Boolean(auth?.id && booking.createdBy?.id && booking.createdBy.id === auth.id);

    return (
        <div className="flex flex-col p-2 bg-card border border-border/60 shadow-md gap-5 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex flex-col gap-1.5 w-full">

                    <div className="text-right">
                        <BookingStatusBadge status={booking.status} />
                    </div>
                    <h3 className="font-bold text-sx mb-0.5 ">
                            {booking.clubName || "Campo da Padel"}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                            {dateHelper.formatDate(booking.startsAt)} 
                        </span>
                        <span className="flex gap-1 text-xs font-semibold px-1 py-0.5 bg-primary/10 text-primary border border-primary/20 text-sm font-semibold text-foreground">
                            <Timer className="h-4 w-4 text-primary" /> {dateHelper.formatTime(booking.startsAt)} - {dateHelper.formatTime(booking.endsAt)}
                        </span>
                    </div>
                     <h3 className="font-bold text-lg leading-tight mt-0.5">
                            {booking.courtName || "Campo da Padel"}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        {booking.isCourtIndoor ? (
                            <DoorOpen className="h-4 w-4 text-primary" />
                        ) : (
                            <DoorClosed className="h-4 w-4 text-primary" />
                        )}
                        {booking.isCourtIndoor ? "Indoor" : "Outdoor"}
                    </span>
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
                                                if(Boolean(auth?.id && player.userId === auth.id)){

                                                    return <PlayerMePrenotation
                                                        key={player.id || slotIdx}
                                                        bookingState={bookingState}
                                                        player={player}
                                                    />
                                                }else{
                                                    return <PlayerOthersPrenotation
                                                        player={player}
                                                    />
                                                }
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
            <div className="grid grid-cols-2 gap-10">
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
                            className=" w-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 shadow-none"
                        >
                            Elimina
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};