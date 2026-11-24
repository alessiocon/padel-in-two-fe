import React, { useState } from "react";
import { Button } from "../../ui/button";
import { LoaderCircle, X } from "lucide-react";
import { apiClient } from "~/client/apiClient";
import type { BookingPlayerResDto } from "~/client/model/response/booking.player.res.dto";

interface PlayerRequestCancelProps {
    player: BookingPlayerResDto;
    bookingId: string;
    onActionComplete: (bookingId: string) => Promise<void>;
}

export const PlayerRequestCancel: React.FC<PlayerRequestCancelProps> = ({
    player,
    bookingId,
    onActionComplete,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRemoveRequest = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.removePublicJoinRequest(bookingId, {
                accepted: false,
            });

            if (!response.IsSuccess) {
                window.alert(response.Error?.message ?? "Errore nella cancellazione della richiesta");
                return;
            }

            window.alert("Richiesta cancellata");
            await onActionComplete(bookingId);
        } catch (err) {
            window.alert("Errore durante la cancellazione della richiesta");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");

    return (
        <div className="p-2 bg-background border border-border space-y-2">
            <p>
                {playerName}
            </p>
            <p className="text-xs font-medium">
                La tua richiesta è in attesa di approvazione
            </p>
            <Button
                size="xs"
                variant="destructive"
                onClick={handleRemoveRequest}
                disabled={isLoading}
            >
                <X className="w-3 h-3 mr-1" />
                Cancella Richiesta
            </Button>
        </div>
    );
};
