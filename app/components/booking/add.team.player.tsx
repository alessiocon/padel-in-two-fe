import { Button } from "../ui/button";
import { LoaderCircle, UserPlus, Users, UserCheck } from "lucide-react";

interface AddTeamPlayerProps {
    index: number;
    isCaptainPlaced: boolean;
    isAuthenticated: boolean;
    canManage?: boolean;
    isLoading?: boolean;
    onAssignMe: (index: number) => void;
    onOpenGuestDialog: (index: number) => void;
    onOpenRegisteredDialog: (index: number) => void;
}

export function AddTeamPlayer({
    index,
    isCaptainPlaced,
    isAuthenticated,
    canManage = true,
    isLoading = false,
    onAssignMe,
    onOpenGuestDialog,
    onOpenRegisteredDialog,
}: AddTeamPlayerProps) {
    return (
        <div className="p-3 rounded-md bg-card border border-border/50 flex items-center justify-between gap-2">
            <div>
                <p className="text-xs text-muted-foreground font-medium">Giocatore {index + 1}</p>
            </div>
            {!canManage ? null : isAuthenticated ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {!isCaptainPlaced && (
                        <Button
                            size="sm"
                            variant="default"
                            disabled={isLoading}
                            onClick={() => onAssignMe(index)}
                            className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                        >
                            {isLoading ? <LoaderCircle className="w-3.5 h-3.5 mr-1 animate-spin" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />} Io
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => onOpenGuestDialog(index)}
                        className="text-xs h-8"
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Ospite
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={isLoading}
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
    );
}