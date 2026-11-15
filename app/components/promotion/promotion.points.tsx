import type { PromotionAccountResDto } from "~/client/model/response/promotion.account.res.dto";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { promotionConfig } from "../budge/promotion.badges";

interface PromotionPointsProps {
    accounts: PromotionAccountResDto[] | null;
    isLoading: boolean;
    className?: string;
}

function PointsStat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-0.5 border border-border/50 bg-card p-2">
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <span className={`text-lg font-extrabold ${highlight ? "text-primary" : ""}`}>{value}</span>
        </div>
    );
}

function PromotionPointsSkeleton() {
    return (
        <>
            {Array.from({ length: 2 }).map((_, index) => (
                <div key={`promotion-skeleton-${index}`} className="space-y-2 border border-border/50 p-3">
                    <Skeleton className="h-4 w-40" />
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full" />
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
}

export function PromotionPoints({ accounts, isLoading, className = "" }: PromotionPointsProps) {
    if (!isLoading && (!accounts || accounts.length === 0)) return null;

    return (
        <Card className={`${className} border rounded-xl py-2 bg-hidden`}>
            <CardContent className="space-y-3 px-3">
                {isLoading ? (
                    <PromotionPointsSkeleton />
                ) : (
                    accounts?.map((account) => {
                        const config = promotionConfig[account.promotion];
                        const Icon = config?.icon;
                        return (
                            <div key={account.promotion} className="space-y-1 py-2 max-w-[450px] mx-auto">
                                <p className="text-lg font-semibold text-primary">
                                    {Icon && <Icon className="h-4 w-4 inline mr-1 mb-0.5" />}
                                    {config?.label ?? account.promotion}
                                </p>
                                <p className="text-sm text-muted-foreground">prenota e gioca per accumulare punti!</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <PointsStat label="Totali" value={account.totalPoints} />
                                    <PointsStat label="Disponibili" value={account.availablePoints} highlight />
                                    <PointsStat label="Riscattati" value={account.redeemedPoints} />
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
