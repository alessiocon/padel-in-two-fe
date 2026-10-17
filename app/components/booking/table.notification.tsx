import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { BookingQuickResDto } from "../../client/model/response/booking.quick.res.dto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { BookingNotificationRaw } from "./raw/booking.notification.raw";

interface TableNotificationProps {
    bookings: BookingQuickResDto[] | null;
    isLoading: boolean;
    isSubmitting: boolean;
    title: ReactNode;
    description?: ReactNode;
    emptyMessage?: ReactNode;
    onAccept: (bookingId: string) => void;
    onCancel: (bookingId: string) => void;
    onRestore: (bookingId: string) => void;
}

export function TableNotification({
    bookings,
    isLoading,
    isSubmitting,
    title,
    description,
    emptyMessage = "Nessuna prenotazione presente.",
    onAccept,
    onCancel,
    onRestore,
}: TableNotificationProps) {
    return (
        <Card className="bg-card border-border py-3 ">
            <CardHeader className="px-4">
                <CardTitle className="text-xl">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="px-4">
                {isLoading ? (
                    <div className="space-y-3" aria-label="Caricamento prenotazioni">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div key={`booking-skeleton-${index}`} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-14" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-3 w-52" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-24" />
                            </div>
                        ))}
                        <span className="sr-only"><Loader2 className="animate-spin" /> Caricamento prenotazioni</span>
                    </div>
                ) : !bookings?.length ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
                ) : (
                    <div className="max-h-[200px] space-y-1 overflow-y-auto pr-2">
                        {bookings.map((booking) => (
                            <BookingNotificationRaw
                                key={booking.id}
                                booking={booking}
                                isSubmitting={isSubmitting}
                                onAccept={() => onAccept(booking.id)}
                                onCancel={() => onCancel(booking.id)}
                                onRestore={() => onRestore(booking.id)}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
