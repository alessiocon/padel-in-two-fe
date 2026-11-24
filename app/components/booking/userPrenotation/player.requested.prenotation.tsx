import React, { useState } from "react";
import { Button } from "../../ui/button";
import { apiClient } from "~/client/apiClient";
import type { BookingPlayerResDto } from "~/client/model/response/booking.player.res.dto";
import type { BookingDetailResDto } from "~/client/model/response/booking.detail.res.dto";
import { Check, X } from "lucide-react";

interface PlayerRequestedPrenotationProps {
    player: BookingPlayerResDto;
    isOwner: boolean;
    isCurrentUser: boolean;
    bookingId: string;
    onActionComplete: (bookingId: string) => Promise<void>;
}

export const PlayerRequestedPrenotation: React.FC<PlayerRequestedPrenotationProps> = ({
    player,
    isOwner,
    isCurrentUser,
    bookingId,
    onActionComplete,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = async () => {
        if (!isOwner) return;

        setIsLoading(true);
        try {
            const response = await apiClient.decidePublicJoinRequest(bookingId, player.id, {
                accepted: true
            });

            if (!response.IsSuccess) {
                window.alert(response.Error?.message ?? "Errore nell'accettazione della richiesta");
                return;
            }

            window.alert("Richiesta accettata!");
            await onActionComplete(bookingId);
        } catch (err) {
            window.alert("Errore durante l'accettazione della richiesta");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!isOwner) return;

        setIsLoading(true);
        try {
            const response = await apiClient.decidePublicJoinRequest(bookingId, player.id, {
                accepted: false,
            });

            if (!response.IsSuccess) {
                window.alert(response.Error?.message ?? "Errore nel rifiuto della richiesta");
                return;
            }

            window.alert("Richiesta rifiutata");
            await onActionComplete(bookingId);
        } catch (err) {
            window.alert("Errore durante il rifiuto della richiesta");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveRequest = async () => {
        if (!isCurrentUser) return;

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

    return (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-md space-y-2">
            <div className="text-xs text-amber-700 font-medium">
                {player.firstName} {player.lastName}
                <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                    In attesa
                </span>
            </div>

            {isOwner && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs h-7 bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-200"
                        onClick={handleAccept}
                        disabled={isLoading}
                    >
                        <Check className="w-3 h-3 mr-1" />
                        Accetta
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs h-7 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-200"
                        onClick={handleDecline}
                        disabled={isLoading}
                    >
                        <X className="w-3 h-3 mr-1" />
                        Rifiuta
                    </Button>
                </div>
            )}

            {isCurrentUser && !isOwner && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs h-7 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-200"
                    onClick={handleRemoveRequest}
                    disabled={isLoading}
                >
                    <X className="w-3 h-3 mr-1" />
                    Cancella Richiesta
                </Button>
            )}
        </div>
    );
};
