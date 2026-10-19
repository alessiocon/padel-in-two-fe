import type { BookingPlayerStatus } from "~/client/model/common/Enum/booking.player.status";

interface PlayerStatusBadgeProps {
    status: BookingPlayerStatus;
    className?: string;
}

const statusConfig: Record<BookingPlayerStatus, { label: string; classes: string }> = {
    ACCEPTED: {
        label: "Confermato",
        classes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    DECLINED: {
        label: "Rifiutato",
        classes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    PENDING: {
        label: "In attesa di conferma",
        classes: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    REMOVED: {
        label: "Rimosso",
        classes: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
};

export function PlayerStatusBadge({ status, className = "" }: PlayerStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`inline-flex border px-2.5 py-1 text-xs font-medium ${config?.classes ?? "border-border bg-muted text-muted-foreground"} ${className}`}>
            {config?.label ?? status}
        </span>
    );
}
