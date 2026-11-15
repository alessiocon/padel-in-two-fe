import { useState } from "react";
import { Gift, Star, type LucideIcon } from "lucide-react";
import { PromotionType } from "~/client/model/common/Enum/promotion.type";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

interface PromotionBadgesProps {
    promotions?: PromotionType[] | null;
    className?: string;
}

export const promotionConfig: Record<PromotionType, { label: string; description: string; icon: LucideIcon }> = {
    [PromotionType.RACKET_FREE]: {
        label: "Noleggio pale in omaggio",
        description: "Prenotando da qui il noleggio delle pale è in omaggio per tutti i giocatori.",
        icon: Gift,
    },
    [PromotionType.ACCUMULATE_POINTS]: {
        label: "Accumulo punti",
        description: "Questa prenotazione ti permette di accumulare punti.",
        icon: Star,
    },
};

export function PromotionBadges({ promotions, className = "" }: PromotionBadgesProps) {
    const [selected, setSelected] = useState<PromotionType | null>(null);

    const items = (promotions ?? []).filter((promotion) => promotion in promotionConfig);
    if (items.length === 0) return null;

    const selectedConfig = selected ? promotionConfig[selected] : null;

    return (
        <>
            <div className={`flex items-center gap-1.5 ${className}`}>
                {items.map((promotion) => {
                    const { icon: Icon, label } = promotionConfig[promotion];
                    return (
                        <button
                            key={promotion}
                            type="button"
                            title={label}
                            aria-label={label}
                            onClick={() => setSelected(promotion)}
                            className="inline-flex border border-primary/20 bg-primary/10 p-1.5 text-primary-foreground transition-colors hover:bg-primary/20"
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    );
                })}
            </div>

            <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="sm:max-w-sm">
                    {selectedConfig && (
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-primary">
                                <selectedConfig.icon className="h-5 w-5" /> {selectedConfig.label}
                            </DialogTitle>
                            <DialogDescription>{selectedConfig.description}</DialogDescription>
                        </DialogHeader>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
