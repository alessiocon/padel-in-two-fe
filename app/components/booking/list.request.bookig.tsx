import { useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { apiClient } from "../../client/apiClient";
import { bookingStatus } from "../../client/model/common/Enum/booking.status.dto";
import type { BookingResDto } from "../../client/model/response/booking.res.dto";
import { dateHelper } from "../../helper/dateHelper";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { BookingUserResDto } from "~/client/model/response/BookingUserResDto";

interface ListRequestBookingProps {
    bookingState: [BookingUserResDto[] | null, React.Dispatch<React.SetStateAction<BookingUserResDto[] | null>>];
    isLoading: boolean;
    courtNameMap: Map<string, string>;
}

export function ListRequestBookig({ bookingState, isLoading, courtNameMap }: ListRequestBookingProps) {
    const [bookings, setBookings] = bookingState;
    const [submittingBookingId, setSubmittingBookingId] = useState<string | null>(null);
    const requestInFlight = useRef(false);
    const pendingBookings = bookings?.filter((booking) => booking.status === bookingStatus.PENDING) ?? [];

    const updateBookingStatus = async (bookingId: string, accepted: boolean) => {
        if (requestInFlight.current) return;

        requestInFlight.current = true;
        setSubmittingBookingId(bookingId);
        try {
            const response = accepted
                ? await apiClient.acceptBooking(bookingId)
                : await apiClient.deleteBooking(bookingId, { isStaff: true });

            if (!response.IsSuccess) {
                window.alert(response.Error?.message || "Errore durante l'aggiornamento della prenotazione.");
                return;
            }

            const status = accepted ? bookingStatus.CONFIRMED : bookingStatus.CANCELLED;
            setBookings((currentBookings) => currentBookings?.map((booking) => (
                booking.id === bookingId
                    ? { ...booking, status, logs: response.Data?.logs ?? booking.logs }
                    : booking
            )) ?? null);
        } catch {
            window.alert("Errore durante l'aggiornamento della prenotazione.");
        } finally {
            requestInFlight.current = false;
            setSubmittingBookingId(null);
        }
    };

    return (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-md">
            <CardHeader className="pb-3">
                <CardTitle className="text-amber-500 text-lg">
                    Richieste Giocatori in Attesa ({pendingBookings.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Giorno</TableHead>
                            <TableHead>Campo</TableHead>
                            <TableHead>Team e giocatori</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || bookings === null ? (
                            Array.from({ length: 3 }, (_, index) => (
                                <TableRow key={`request-skeleton-${index}`}>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-4 w-40" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="ml-auto h-8 w-28" /></TableCell>
                                </TableRow>
                            ))
                        ) : pendingBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Non ci sono prenotazioni in attesa.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pendingBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="align-top">
                                        <div className="font-medium">{dateHelper.formatDate(String(booking.startsAt))}</div>
                                        <div className="text-xs text-muted-foreground">{dateHelper.formatTime(String(booking.startsAt))}</div>
                                    </TableCell>
                                    <TableCell className="align-top font-medium">
                                        {courtNameMap.get(booking.courtId) || booking.courtId || "Campo"}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="grid min-w-[20rem] gap-3 sm:grid-cols-2">
                                            {booking.teams.map((team, teamIndex) => (
                                                <div key={team.id} className="space-y-1">
                                                    <p className="text-xs font-semibold text-primary">
                                                        {team.teamName || `Team ${teamIndex + 1}`}
                                                    </p>
                                                    {team.players.length > 0 ? (
                                                        <ul className="space-y-1">
                                                            {team.players.map((player) => {
                                                                const playerName = [player.firstName, player.lastName].filter(Boolean).join(" ");
                                                                return (
                                                                    <li key={player.id} className="text-xs">
                                                                        <span className="font-medium">
                                                                            {playerName || player.username || "Giocatore"}
                                                                        </span>
                                                                        <span className="ml-1 text-muted-foreground">
                                                                            {player.type === "GUEST" ? "Ospite" : "Utente registrato"}
                                                                        </span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">Nessun giocatore</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-600 text-green-600 hover:bg-green-600/10"
                                                disabled={submittingBookingId !== null}
                                                onClick={() => void updateBookingStatus(booking.id, true)}
                                            >
                                                {submittingBookingId === booking.id ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                                Accetta
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-destructive text-destructive hover:bg-destructive/10"
                                                disabled={submittingBookingId !== null}
                                                onClick={() => void updateBookingStatus(booking.id, false)}
                                            >
                                                {submittingBookingId === booking.id ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                                Rifiuta
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
