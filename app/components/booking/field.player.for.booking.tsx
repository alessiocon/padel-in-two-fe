import { Button } from "../ui/button";
import { UserPlus, Users, Trash2, UserCheck } from "lucide-react";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";

export interface IPlayerSlotCardProps {
    index: number;
    player: CreateBookingPlayerDto | null;
    isCaptainPlaced: boolean;
    isAuthenticated: boolean;
    currentUserId?: string;
    onAssignMe: (index: number) => void;
    onRemovePlayer: (index: number) => void;
    onOpenGuestDialog: (index: number) => void;
    onOpenRegisteredDialog: (index: number) => void;
}

export function FieldPlayerForBooking({
    index,
    player,
    isCaptainPlaced,
    isAuthenticated,
    currentUserId,
    onAssignMe,
    onRemovePlayer,
    onOpenGuestDialog,
    onOpenRegisteredDialog
}: IPlayerSlotCardProps) {
    const isMe = currentUserId && player?.userId === currentUserId;

    return (
        <div className="p-3 rounded-md bg-card border border-border/50 flex items-center justify-between gap-2">
            {player ? (
                <>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Giocatore {index + 1} {isMe && "(Tu)"}
                        </p>
                        {player.userId ? 
                            <p>{player.username} - <span className="text-xs">{player.firstName} {player.lastName}</span></p>
                        :<p className="text-sm font-semibold">{player.firstName} {player.lastName}</p>
                        }
                        
                    </div>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {onRemovePlayer(index)}} 
                        className="text-destructive h-8 w-8 p-0 hover:bg-destructive/10"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </>
            ) : (
                <div className="flex items-center justify-between w-full flex-wrap gap-2">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Giocatore {index + 1}</p>
                        <p className="text-xs text-muted-foreground italic">Slot disponibile</p>
                    </div>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {!isCaptainPlaced && (
                                <Button 
                                    size="sm" 
                                    variant="default" 
                                    onClick={() => onAssignMe(index)} 
                                    className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                                >
                                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Io
                                </Button>
                            )}
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onOpenGuestDialog(index)} 
                                className="text-xs h-8"
                            >
                                <UserPlus className="w-3.5 h-3.5 mr-1" /> Ospite
                            </Button>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => onOpenRegisteredDialog(index)} 
                                className="text-xs h-8"
                            >
                                <Users className="w-3.5 h-3.5 mr-1" /> Utente
                            </Button>
                        </div>
                    ) : (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">Accedi per gestire</p>
                    )}
                </div>
            )}
        </div>
    );
}