import { useRef} from "react";
import { Button } from "../ui/button";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";


interface ManageTeamPlayerPrenotationProps {
    index: number;
    playerState: [(CreateBookingPlayerDto | null)[], React.Dispatch<React.SetStateAction<(CreateBookingPlayerDto | null)[]>>];
}

export function ManageTeamPlayerPrenotation({
    index,
    playerState,
}: ManageTeamPlayerPrenotationProps) {
    const requestInFlight = useRef(false);
    const [players, setPlayers] = playerState;
    const player  = players[index];

    if(!player) return;

    const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");

    const handleRemove = async () => {
        if (requestInFlight.current) return;
       
         setPlayers(prev => {
            prev[index] = null;
            return  [...prev];
        });
    };

    return (
        <div className="relative p-3 rounded-md bg-background border border-border/50">
            <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-medium">
                    Giocatore {index + 1}
                </p>
            </div>
 
            <div className="flex justify-between items-center">
                {player.playerId 
                    ? <p>{player.username || "Utente"}</p>
                    : <p className="text-sm font-semibold">{playerName || "Ospite"}</p>
                }

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleRemove()}
                    className="text-destructive  hover:bg-destructive/10 p-0"
                    aria-label="Rimuovi giocatore"
                >
                    rimuovi
                </Button>
            </div>
        </div>
    );
}