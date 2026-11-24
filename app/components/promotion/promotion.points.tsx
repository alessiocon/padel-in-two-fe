import type { PromotionAccountResDto } from "~/client/model/response/promotion.account.res.dto";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { promotionConfig } from "../budge/promotion.badges";
import { PromotionType } from "~/client/model/common/Enum/promotion.type";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "../ui/button";

interface PromotionPointsProps {
    accounts: PromotionAccountResDto[] | null;
    isLoading: boolean;
    className?: string;
}

function PointsStat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-0.5 border border-border bg-background p-2">
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

    const promotion = accounts?.find(account => account.promotion === PromotionType.ACCUMULATE_POINTS);
    return (
        <Card className={`${className} border py-2`}>
            <CardContent className="space-y-2 px-3">
                {isLoading ? (
                    <PromotionPointsSkeleton />
                ) : (
                    <div key="Prenota e gioca" className="space-y-1 py-2 mx-auto">
                        <p className="text-lg font-semibold text-primary">
                            <Star className="h-4 w-4 inline mr-1 mb-0.5" />  Prenota e gioca
                        </p>
                        <p className="text-sm text-muted-foreground">Con 10 punti puoi contattarci e richiedere il tuo premio</p>
                        <div className="grid grid-cols-3 gap-2 mt-5">
                            <PointsStat label="Totali" value={promotion?.totalPoints ?? 0} />
                            <PointsStat label="Disponibili" value={promotion?.availablePoints ?? 0}/>
                            <PointsStat label="Riscattati" value={promotion?.redeemedPoints ?? 0} />
                        </div>
                        <div className="text-end">
                            <Link to="/clubs" className={`${buttonVariants()} text-primary text-sm mt-2`}>
                                Vedi Club <ArrowRight className="inline-block h-4 w-4" />
                            </Link>
                        </div>
                       
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
