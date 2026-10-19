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
        <div className="p-2.5 rounded-md bg-card border border-border/50 flex flex-col items-start gap-2">
            <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">Giocatore {index + 1}</p>
            {!canManage ? null : isAuthenticated ? (
                <div className="grid w-full grid-cols-3 gap-1">
                    <Button
                        size="sm"
                        variant="default"
                        disabled={isLoading || isCaptainPlaced}
                        onClick={() => onAssignMe(index)}
                        className="h-8 min-w-0 px-1 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                    >
                        {isLoading ? <LoaderCircle className="w-3.5 h-3.5 mr-1 animate-spin" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />} Io
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => onOpenGuestDialog(index)}
                        className="h-8 min-w-0 px-1 text-[10px]"
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Ospite
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={isLoading}
                        onClick={() => onOpenRegisteredDialog(index)}
                        className="h-8 min-w-0 px-1 text-[10px]"
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