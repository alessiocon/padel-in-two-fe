import React, { useContext } from "react";
import { Link } from "react-router";
import { DoorOpen, DoorClosed, Timer, BicepsFlexed } from "lucide-react";
import { dateHelper } from "../../../helper/dateHelper";
import { Button } from "../../ui/button";
import { ViewBookingLogs } from "../logs/view.booking.logs";
import { AddTeamPlayer } from "../add.team.player";
import { PlayerMePrenotation } from "./player.prenotation";
import { PlayerPrenotationManagement } from "./player.prenotation.menagment";
import { BookingStatusBadge } from "../../budge/booking.status.badge";
import { PromotionBadges } from "../../budge/promotion.badges";
import { BookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import { AuthContext } from "../../../store/context";
import type { BookingDetailResDto } from "~/client/model/response/booking.detail.res.dto";
import { PlayerOthersPrenotation } from "./player.others.prenotation";
import { PlayerRequestCancel } from "./player.request.cancel";
import { BookingMatchSection } from "../match/booking.match.section";
import { BookingPlayerStatus } from "../../../client/model/common/Enum/booking.player.status";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "~/components/ui/dialog";
import { useState } from "react";
import { apiClient } from "~/client/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PLAYER_LEVELS } from "~/components/ui/level-select";

interface CardUserPrenotationDetailProps {
    bookingState: [BookingDetailResDto, React.Dispatch<React.SetStateAction<BookingDetailResDto[] | null>>];
    onDelete: (booking: BookingDetailResDto) => void;
}

export const CardUserPrenotationDetail: React.FC<CardUserPrenotationDetailProps> = ({ 
    bookingState,
    onDelete, 
}) => {
    const [auth] = useContext(AuthContext);
    const [booking, setBooking] = bookingState;
    const isOwner = Boolean(auth?.sub && booking.createdBy?.id && booking.createdBy.id === auth.sub);
    const isStaff = !auth.playerId;
    const acceptedPlayersCount = booking.teams.flatMap(team => team.players ?? [])
      .filter(player => player.status === BookingPlayerStatus.ACCEPTED).length;
    
    // Verifica se l'utente corrente fa parte di qualche team
    const userIsInTeam = booking.teams.some(team => 
      team.players?.some(player => player.playerId === auth?.playerId)
    );
    
    // State per il dialog di join
    const [joinDialog, setJoinDialog] = useState<{
      isOpen: boolean;
      selectedTeamId: string | null;
      isLoading: boolean;
    }>({
      isOpen: false,
      selectedTeamId: null,
      isLoading: false,
    });

    const handleJoinClick = (teamId: string) => {
      setJoinDialog({
        isOpen: true,
        selectedTeamId: teamId,
        isLoading: false,
      });
    };

    const handleConfirmJoin = async () => {
      if (!joinDialog.selectedTeamId) return;

      setJoinDialog(prev => ({ ...prev, isLoading: true }));

      try {
        const response = await apiClient.joinPublicBooking(booking.id, {
          teamId: joinDialog.selectedTeamId,
        });

        if (!response.IsSuccess) {
          window.alert(response.Error?.message ?? "Errore nella partecipazione");
          return;
        }

        window.alert(
          booking.joinMode === "OPEN"
            ? "Ti sei unito alla partita con successo!"
            : "Richiesta di partecipazione inviata! Attendi l'approvazione."
        );

        setJoinDialog({
          isOpen: false,
          selectedTeamId: null,
          isLoading: false,
        });

        // Ricarica la prenotazione
        const response2 = await apiClient.getBooking(booking.id);
        if (response2.IsSuccess && response2.Data) {
          setBooking([response2.Data]);
        }
      } catch (err) {
        window.alert("Errore durante la partecipazione. Riprova più tardi.");
        console.error(err);
      } finally {
        setJoinDialog(prev => ({ ...prev, isLoading: false }));
      }
    };

    const reloadBooking = async (bookingId: string) => {
      try {
        const response = await apiClient.getBooking(bookingId);
        if (response.IsSuccess && response.Data) {
          setBooking([response.Data]);
        }
      } catch (err) {
        console.error("Errore nel ricaricamento della prenotazione", err);
      }
    };
    
      return (
        <div className="flex flex-col   gap-5 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
               
                <div className="flex flex-col gap-1.5 w-full">
                    {booking.cancAt && booking.cancReason && (
                        <div className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1">
                            <p className="font-semibold">Motivo della cancellazione</p>
                            <p className="text-sm ">
                                {booking.cancReason}
                            </p>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                        <PromotionBadges promotions={booking.eligiblePromotions} />
                        <BookingStatusBadge status={booking.status} className="ml-auto" />
                    </div>
                    <h3 className="font-bold text-sx mb-0.5 ">
                        {booking.clubName || "Campo da Padel"}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-primary text-primary-foreground">
                            {dateHelper.formatDate(booking.startsAt)} 
                        </span>
                        <span className="flex gap-1 text-xs font-semibold px-1 py-0.5 bg-primary text-primary-foreground">
                            <Timer className="h-4 w-4 text-primary-foreground" /> {dateHelper.formatTime(booking.startsAt)} - {dateHelper.formatTime(booking.endsAt)}
                        </span>
                        <span className="flex gap-1 text-xs font-semibold px-1 py-0.5 bg-primary text-primary-foreground">
                            {booking.price ? `€ ${booking.price.toFixed(2)}` : "N/A"}
                        </span>
                    </div>
                     <p className="font-bold leading-tight mt-0.5">
                            {booking.courtName || "Campo da Padel"}
                    </p>
                    <span className="text-xs text-muted-foreground font-medium">
                        {booking.isCourtIndoor ? (
                            <DoorOpen className="h-4 w-4 text-primary inline mr-1 mb-0.5" />
                        ) : (
                            <DoorClosed className="h-4 w-4 text-primary inline mr-1 mb-0.5" />
                        )}
                        {booking.isCourtIndoor ? "Indoor" : "Outdoor"}
                    </span>
                    <span>
                        {booking.minPlayerLevel && booking.maxPlayerLevel ? (
                            <span className="text-xs text-muted-foreground font-medium">
                                <BicepsFlexed className="h-4 w-4 text-primary inline mr-1 mb-0.5" /> {booking.minPlayerLevel} - {booking.maxPlayerLevel} ({PLAYER_LEVELS.find(l => l.value === booking.minPlayerLevel)?.label} - {PLAYER_LEVELS.find(l => l.value === booking.maxPlayerLevel)?.label})
                            </span>
                        ) : null}
                    </span>
                </div>
            </div>

            
            {/* Team e azioni specifiche per ruolo */}
            {(booking.status !== BookingStatus.RESERVED && booking.status !== BookingStatus.CANCELLED) && booking.teams && booking.teams.length > 0 && (
                <div className="space-y-3">
                    {isOwner ? (
                        <PlayerPrenotationManagement
                            bookingState={bookingState}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {booking.teams.map((team, teamIdx) => (
                                <Card key={team.id || teamIdx} className="gap-1">
                                    <CardHeader>
                                        <CardTitle>
                                            {team.teamName || `Team ${teamIdx + 1}`}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2 space-y-2">
                                        {[0, 1].map((slotIdx) => {
                                            const player = team.players[slotIdx];
                                            if (player) {
                                                
                                                // Se lo player è REQUESTED e sei tu che hai mandato la richiesta
                                                if (player.status === BookingPlayerStatus.REQUESTED && Boolean(auth?.playerId && player.playerId === auth.playerId)) {
                                                    return <PlayerRequestCancel
                                                        key={player.id || slotIdx}
                                                        player={player}
                                                        bookingId={booking.id}
                                                        onActionComplete={reloadBooking}
                                                    />
                                                }
                                                
                                                if(Boolean(auth?.playerId && player.playerId === auth.playerId)){
                                                    return <PlayerMePrenotation
                                                        key={player.id || slotIdx}
                                                        bookingState={bookingState}
                                                        player={player}
                                                    />
                                                }else{
                                                    return <PlayerOthersPrenotation
                                                        key={player.id || slotIdx}
                                                        player={player}
                                                    />
                                                }
                                            }

                                            // Se la partita è pubblica e l'utente non è in un team, mostra pulsante "Partecipa"
                                            if (booking.isPublic && !userIsInTeam && auth?.playerId) {
                                                return (
                                                    <Button
                                                        key={slotIdx}
                                                        size="lg"
                                                        className="min-h-10 w-full"
                                                        onClick={() => handleJoinClick(team.id)}
                                                    >
                                                        Partecipa
                                                    </Button>
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
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {(booking.status !== BookingStatus.RESERVED && booking.status !== BookingStatus.CANCELLED) && <BookingMatchSection 
                bookingId={booking.id} 
                team1Name={booking.teams[0].teamName}
                team2Name={booking.teams[1].teamName}
                bookingStatus={booking.status}
                isStaff={isStaff} 
                allPlayer={acceptedPlayersCount === booking.courtSize}/>
            }

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
                            disabled={booking.status === BookingStatus.CANCELLED}
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

            {/* Dialog Selezione Team per Partecipa Partita Pubblica */}
            <Dialog
                open={joinDialog.isOpen}
                onOpenChange={(isOpen) =>
                    setJoinDialog(prev => ({ ...prev, isOpen }))
                }
            >
                <DialogContent className="px-2">
                    <DialogHeader className="pr-12">
                        <DialogTitle>Conferma Partecipazione</DialogTitle>
                        <DialogDescription>
                            {booking.joinMode === "OPEN"
                                ? "Ti unirai subito alla partita nel team selezionato"
                                : "La tua richiesta sarà inviata per l'approvazione"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Stai per partecipare a questa partita pubblica nel team seguente:
                        </p>
                        {joinDialog.selectedTeamId && (
                            <div className="p-3 bg-card border border-border/40">
                                <div className="font-semibold text-sm">
                                    {booking.teams.find(t => t.id === joinDialog.selectedTeamId)?.teamName || "Team"}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setJoinDialog({
                                    isOpen: false,
                                    selectedTeamId: null,
                                    isLoading: false,
                                })
                            }
                            disabled={joinDialog.isLoading}
                        >
                            Annulla
                        </Button>
                        <Button
                            onClick={handleConfirmJoin}
                            disabled={joinDialog.isLoading}
                        >
                            {joinDialog.isLoading ? "Invio..." : "Conferma"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};