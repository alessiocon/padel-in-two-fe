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
        <div className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground font-medium whitespace-nowrap">Giocatore {index + 1}</p>
            {!canManage ? null : isAuthenticated ? (
                <div className="grid w-full grid-cols-3 gap-1">
                    <Button
                        size="sm"
                        variant="default"
                        disabled={isLoading || isCaptainPlaced}
                        onClick={() => onAssignMe(index)}
                    >
                        {isLoading ? <LoaderCircle className="w-3.5 h-3.5 mr-1 animate-spin" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />} Io
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={isLoading}
                        onClick={() => onOpenRegisteredDialog(index)}
                    >
                        <Users className="w-3.5 h-3.5 mr-1" /> Utente
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => onOpenGuestDialog(index)}
                        className="bg-background"
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Ospite
                    </Button>
                    
                </div>
            ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">Accedi per gestire</p>
            )}
        </div>
    );
}