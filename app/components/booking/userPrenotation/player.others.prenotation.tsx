import type { BookingPlayerResDto } from "../../../client/model/response/booking.player.res.dto";
import { PlayerStatusBadge } from "~/components/budge/player.status.badge";

interface PlayerOthersPrenotationProps {
    player: BookingPlayerResDto;
}

export function PlayerOthersPrenotation({ player }: PlayerOthersPrenotationProps) {

    const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");
   

    return (
        <div className="relative p-2.5 bg-card border border-border/50 flex items-center justify-between gap-2">
            <div>
                <p className="text-xs font-medium">
                    {playerName || (player.username ? `${player.username}` : "Utente")}
                </p>
                {player.type === "GUEST" ? (
                    <span className="text-[10px] text-muted-foreground italic">Ospite</span>
                ) : player.username && playerName ? (
                    <span className="text-[10px] text-muted-foreground">{player.username}</span>
                ) : null}
            </div>

            <div className="flex items-center gap-2">
                <PlayerStatusBadge status={player.status}/>
            </div>
        </div>
    );
}