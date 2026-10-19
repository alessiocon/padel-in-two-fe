import type { bookingStatus } from "~/client/model/common/Enum/booking.status.dto";

interface BookingStatusBadgeProps {
    status: bookingStatus;
    className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
    CONFIRMED: {
        label: "Confermato",
        classes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    RESERVED: {
        label: "Riservato",
        classes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    PENDING: {
        label: "In attesa di conferma",
        classes: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    CANCELLED: {
        label: "Annullato",
        classes: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
};

export function BookingStatusBadge({ status, className = "" }: BookingStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`inline-flex border px-2.5 py-1 text-xs font-medium ${config?.classes ?? "border-border bg-muted text-muted-foreground"} ${className}`}>
            {config?.label ?? status}
        </span>
    );
}
