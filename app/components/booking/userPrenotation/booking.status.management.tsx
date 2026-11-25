import { useContext, useEffect, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { apiClient } from "~/client/apiClient";
import { BookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import { ClubRole } from "~/client/model/common/Enum/club.role";
import type { BookingDetailResDto } from "~/client/model/response/booking.detail.res.dto";
import { AuthContext } from "~/store/context";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface BookingStatusManagementProps {
  booking: BookingDetailResDto;
  onBookingUpdated: (booking: BookingDetailResDto) => void;
}

type BookingAction = "accept" | "start" | "cancel" | "restore";

const STAFF_ROLES = new Set([ClubRole.OWNER, ClubRole.MANAGER, ClubRole.STAFF]);

const ACTION_CONTENT: Record<BookingAction, { title: string; description: string; confirmLabel: string }> = {
  accept: {
    title: "Conferma prenotazione",
    description: "Vuoi confermare questa prenotazione?",
    confirmLabel: "Conferma prenotazione",
  },
  start: {
    title: "Avvia prenotazione",
    description: "Avviando la prenotazione, la partita avrà inizio e successivamente i giocatori potranno inserire il punteggio, assicurati che tutti i giocatori siano presenti al club.",
    confirmLabel: "Avvia prenotazione",
  },
  cancel: {
    title: "Annulla prenotazione",
    description: "Indica il motivo dell'annullamento. La motivazione sarà registrata nella prenotazione.",
    confirmLabel: "Annulla prenotazione",
  },
  restore: {
    title: "Ripristina prenotazione",
    description: "Vuoi ripristinare questa prenotazione?",
    confirmLabel: "Ripristina prenotazione",
  },
};

export function BookingStatusManagement({ booking, onBookingUpdated }: BookingStatusManagementProps) {
  const [auth] = useContext(AuthContext);
  const [canManage, setCanManage] = useState(false);
  const [action, setAction] = useState<BookingAction | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setCanManage(false);

    if (!auth?.auth || !auth.sub || !booking.clubId) return () => { isCurrent = false; };

    apiClient.getClub(booking.clubId)
      .then((response) => {
        if (!isCurrent || !response.IsSuccess || !response.Data) return;

        const member = response.Data.members?.find((clubMember) => clubMember.userId === auth.sub);
        setCanManage(Boolean(member && STAFF_ROLES.has(member.role)));
      })
      .catch(() => {
        if (isCurrent) setCanManage(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [auth?.auth, auth?.sub, booking.clubId]);

  const closeDialog = () => {
    if (isSubmitting) return;
    setAction(null);
    setCancelReason("");
    setErrorMessage(null);
  };

  const confirmAction = async () => {
    if (!action || isSubmitting) return;
    if (action === "cancel" && !cancelReason.trim()) {
      setErrorMessage("Inserisci il motivo dell'annullamento.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (action === "accept") {
        const response = await apiClient.acceptBooking(booking.id);
        if (!response.IsSuccess || !response.Data) {
          setErrorMessage(response.Error?.message ?? "Impossibile confermare la prenotazione.");
          return;
        }

        const detailResponse = await apiClient.getBooking(booking.id);
        onBookingUpdated(detailResponse.IsSuccess && detailResponse.Data
          ? detailResponse.Data
          : { ...booking, status: response.Data.status });
      } else if (action === "start") {
        const response = await apiClient.startBooking(booking.id);
        if (!response.IsSuccess || !response.Data) {
          setErrorMessage(response.Error?.message ?? "Impossibile avviare la prenotazione.");
          return;
        }

        const detailResponse = await apiClient.getBooking(booking.id);
        onBookingUpdated(detailResponse.IsSuccess && detailResponse.Data
          ? detailResponse.Data
          : { ...booking, status: response.Data.status });
      } else if (action === "cancel") {
        const response = await apiClient.deleteBooking(booking.id, {
          isStaff: true,
          reason: cancelReason.trim(),
        });
        if (!response.IsSuccess || !response.Data) {
          setErrorMessage(response.Error?.message ?? "Impossibile annullare la prenotazione.");
          return;
        }
        onBookingUpdated(response.Data);
      } else {
        const response = await apiClient.restoreBookigStatus(booking.id, { isStaff: true });
        if (!response.IsSuccess || !response.Data) {
          setErrorMessage(response.Error?.message ?? "Impossibile ripristinare la prenotazione.");
          return;
        }
        onBookingUpdated(response.Data);
      }

      setAction(null);
      setCancelReason("");
    } catch {
      setErrorMessage("Si è verificato un errore. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) return null;

  const isCancelled = booking.status === BookingStatus.CANCELLED;
  const canCancel = booking.status !== BookingStatus.END && booking.status !== BookingStatus.IN_PROGRESS && !isCancelled;
  const actionContent = action ? ACTION_CONTENT[action] : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-4">
        {booking.status === BookingStatus.PENDING && (
          <Button type="button" size="sm" onClick={() => setAction("accept")}>
            <CheckCircle2 aria-hidden="true" /> Conferma
          </Button>
        )}
        {booking.status === BookingStatus.CONFIRMED && (
          <Button type="button" size="sm" onClick={() => setAction("start")}>
            <CheckCircle2 aria-hidden="true" /> Avvia
          </Button>
        )}
        {isCancelled ? (
          <Button type="button" size="sm" onClick={() => setAction("restore")}>
            <RotateCcw aria-hidden="true" /> Ripristina
          </Button>
        ) : canCancel ? (
          <Button type="button" size="sm" variant="destructive" onClick={() => setAction("cancel")}>
            <XCircle aria-hidden="true" /> Annulla
          </Button>
        ) : null}
      </div>

      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pr-10">
            <DialogTitle>{actionContent?.title}</DialogTitle>
            <DialogDescription>{actionContent?.description}</DialogDescription>
          </DialogHeader>

          {action === "cancel" && (
            <div className="grid gap-2">
              <label htmlFor="booking-cancel-reason" className="text-sm font-medium">
                Motivo dell'annullamento
              </label>
              <textarea
                id="booking-cancel-reason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={4}
                maxLength={1000}
                required
                className="w-full resize-y border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                placeholder="Descrivi il motivo..."
              />
            </div>
          )}

          {errorMessage && <p className="text-sm text-destructive" role="alert">{errorMessage}</p>}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeDialog} disabled={isSubmitting}>
              Indietro
            </Button>
            <Button
              type="button"
              variant={action === "cancel" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={isSubmitting || (action === "cancel" && !cancelReason.trim())}
            >
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
              {actionContent?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
