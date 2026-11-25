import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, ChevronLeft, ChevronRight, Eye, Info, Loader2, Plus, RotateCcw, X } from "lucide-react";
import { Link } from "react-router";
import { BookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
import { BookingStatusBadge } from "../budge/booking.status.badge";
import { Button, buttonVariants } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table";

interface ManagerBookingsTableProps {
  bookings: BookingQuickResDto[];
  total: number;
  isLoading: boolean;
  month: string;
  onMonthChange: (month: string) => void;
  skip: number;
  take: number;
  onPaginationChange: (skip: number, take: number) => void;
  statusFilter: BookingStatus | "ALL";
  onStatusFilterChange: (status: BookingStatus | "ALL") => void;
  createdByStaffFilter: "ALL" | "YES" | "NO";
  onCreatedByStaffFilterChange: (filter: "ALL" | "YES" | "NO") => void;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.RESERVED]: "Riservato",
  [BookingStatus.PENDING]: "In attesa",
  [BookingStatus.CONFIRMED]: "Confermato",
  [BookingStatus.IN_PROGRESS]: "In corso",
  [BookingStatus.END]: "Concluso",
  [BookingStatus.CANCELLED]: "Annullato",
};

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});

type SortField = "date" | "time";
type SortCriterion = { field: SortField; direction: "asc" | "desc" };

export function ManagerBookingsTable({
  bookings,
  total,
  isLoading,
  month,
  onMonthChange,
  skip,
  take,
  onPaginationChange,
  statusFilter,
  onStatusFilterChange,
  createdByStaffFilter,
  onCreatedByStaffFilterChange,
}: ManagerBookingsTableProps) {
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([]);
  const [descriptionDialog, setDescriptionDialog] = useState<{ courtName: string; description: string } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSort = (field: SortField) => {
    setSortCriteria((current) => {
      const existingIndex = current.findIndex((criterion) => criterion.field === field);

      if (existingIndex === -1) {
        return [...current, { field, direction: "asc" }];
      }

      return current.map((criterion, index) => index === existingIndex
        ? { ...criterion, direction: criterion.direction === "asc" ? "desc" : "asc" }
        : criterion
      );
    });
  };

  const visibleBookings = useMemo(() => {
    return bookings
      .sort((first, second) => {
        const firstDate = new Date(first.startsAt);
        const secondDate = new Date(second.startsAt);

        for (const criterion of sortCriteria) {
          let comparison = 0;

          if (criterion.field === "date") {
            const firstDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate()).getTime();
            const secondDay = new Date(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate()).getTime();
            comparison = firstDay - secondDay;
          } else if (criterion.field === "time") {
            const firstTime = firstDate.getHours() * 60 + firstDate.getMinutes();
            const secondTime = secondDate.getHours() * 60 + secondDate.getMinutes();
            comparison = firstTime - secondTime;
          } else {
            comparison = STATUS_LABELS[first.status].localeCompare(STATUS_LABELS[second.status], "it");
          }

          if (comparison !== 0) return comparison * (criterion.direction === "asc" ? 1 : -1);
        }

        return firstDate.getTime() - secondDate.getTime();
      });
  }, [bookings, sortCriteria]);

  const currentPage = Math.floor(skip / take) + 1;
  const pageCount = Math.max(1, Math.ceil(total / take));

  const sortIndicator = (field: SortField) => {
    const index = sortCriteria.findIndex((criterion) => criterion.field === field);
    if (index === -1) return null;

    const criterion = sortCriteria[index];
    const DirectionIcon = criterion.direction === "asc" ? ArrowUp : ArrowDown;

    return (
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        <DirectionIcon className="h-4 w-4" />
        {index + 1}
      </span>
    );
  };

  const removeSortButton = (field: SortField) => {
    if (!sortCriteria.some((criterion) => criterion.field === field)) return null;

    return (
      <Button
        type="button"
        size={"icon-xs"}
        aria-label={`Rimuovi ordinamento ${field === "date" ? "per data" : field === "time" ? "per ora" : "per stato"}`}
        title="Rimuovi questo ordinamento"
        variant="destructive"
        onClick={() => setSortCriteria((current) => current.filter((criterion) => criterion.field !== field))}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    );
  };

  return (
    <section className="border border-border bg-card">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between my-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Mese
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" />
              <input
                type="month"
                value={month}
                onChange={(event) => onMonthChange(event.target.value)}
                className="h-10 w-full border border-foreground bg-card pl-9 pr-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:w-auto"
              />
            </span>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Stato
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as BookingStatus | "ALL")}
              className="h-10 min-w-40 border border-foreground bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              aria-label="Filtra prenotazioni per stato"
            >
              <option value="ALL" className="bg-card text-foreground">Tutti gli stati</option>
              {Object.values(BookingStatus).map((status) => (
                <option key={status} value={status} className="bg-card text-foreground">
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Prenotazione da:
            <select
              value={createdByStaffFilter}
              onChange={(event) => onCreatedByStaffFilterChange(event.target.value as "ALL" | "YES" | "NO")}
              className="h-10 min-w-40 border border-foreground bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              aria-label="Filtra per prenotazioni create dallo staff"
            >
              <option value="ALL" className="bg-card text-foreground">Tutti</option>
              <option value="YES" className="bg-card text-foreground">Staff</option>
              <option value="NO" className="bg-card text-foreground">Giocatore</option>
            </select>
          </label>
          <button
            type="button"
            disabled={sortCriteria.length === 0}
            onClick={() => setSortCriteria([])}
            className="inline-flex h-10 w-10 items-center justify-center border border-foreground bg-card text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Azzera ordinamento"
            title="Azzera ordinamento"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Table className="table-fixed min-w-[900px]">
        <colgroup>
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
          <col className="w-[30%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
        </colgroup>
        <TableHeader className="bg-foreground/80 text-background">
          <TableRow>
            <TableHead
              className="!h-9 !px-2 !py-1 text-white"
              aria-sort={sortCriteria[0]?.field === "date" ? (sortCriteria[0].direction === "asc" ? "ascending" : "descending") : "none"}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-medium uppercase text-white"
                  onClick={() => handleSort("date")}
                  aria-label="Ordina per data"
                >
                  Data
                  {sortIndicator("date")}
                </button>
                {removeSortButton("date")}
              </div>
            </TableHead>
            <TableHead
              className="!h-9 !px-2 !py-1 text-white"
              aria-sort={sortCriteria[0]?.field === "time" ? (sortCriteria[0].direction === "asc" ? "ascending" : "descending") : "none"}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-medium uppercase text-white"
                  onClick={() => handleSort("time")}
                  aria-label="Ordina per ora"
                >
                  Ora
                  {sortIndicator("time")}
                </button>
                {removeSortButton("time")}
              </div>
            </TableHead>
            <TableHead className="!h-9 !px-2 !py-1 text-white">Campo</TableHead>
            <TableHead className="!h-9 !px-2 !py-1 text-white text-center">Player</TableHead>
            <TableHead className="!h-9 !px-2 !py-1 text-white">Descrizione</TableHead>
            <TableHead className="!h-9 !px-2 !py-1 text-white">Stato</TableHead>
            <TableHead className="!h-9 !px-2 !py-1 text-white">Prezzo</TableHead>
            <TableHead className="!h-9 !px-2 !py-1 text-white text-center">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:hover]:bg-primary/10">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-56 text-center text-sm text-muted-foreground" role="status">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Caricamento prenotazioni...
                </span>
              </TableCell>
            </TableRow>
          ) : visibleBookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-56 text-center text-sm text-muted-foreground">
                Nessuna prenotazione trovata per il mese selezionato.
              </TableCell>
            </TableRow>
          ) : (
            visibleBookings.map((booking) => {
              const startsAt = new Date(booking.startsAt);
              const endsAt = new Date(booking.endsAt);

              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium" title={dateFormatter.format(startsAt)}>
                    {String(startsAt.getDate()).padStart(2, "0")}/{String(startsAt.getMonth() + 1).padStart(2, "0")}/{startsAt.getFullYear()}
                  </TableCell>
                  <TableCell>{timeFormatter.format(startsAt)} - {timeFormatter.format(endsAt)}</TableCell>
                  <TableCell>
                    <div>{booking.courtName}</div>
                  </TableCell>
                  {booking.status !== BookingStatus.RESERVED ?  (
                    
                    <TableCell className={`text-center font-semibold tabular-nums ${booking.nPlayer === booking.courtSize ? "text-primary" : "text-secondary"}`}>
                    {booking.nPlayer}/{booking.courtSize}
                  </TableCell>
                  ) : <TableCell className="text-center font-semibold tabular-nums">-</TableCell>}
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="min-w-0 flex-1 truncate" title={booking.description}>
                        {booking.description || "-"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 hover:bg-primary text-primary-foreground"
                        aria-label={`Mostra descrizione per ${booking.courtName}`}
                        title="Mostra descrizione completa"
                        onClick={() => {
                          setDescriptionDialog({
                            courtName: booking.courtName,
                            description: booking.description,
                          });
                          setOpenDialog(true);
                        }}
                      >
                        <Info aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell><BookingStatusBadge status={booking.status} /></TableCell>
                  <TableCell>{booking.price.toFixed(2)}€</TableCell>
                  <TableCell className="text-center">
                    <Link
                      to={`/booking/${booking.id}`}
                      className={" hover:bg-primary text-primary-foreground " +buttonVariants({ variant: "ghost", size: "icon-sm" })}
                      aria-label={`Apri prenotazione del ${dateFormatter.format(startsAt)}`}
                    >
                      <Eye aria-hidden="true" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="grid grid-cols-2  gap-3 items-center bg-foreground/80 border-t border-border p-2 text-sm text-background">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="hidden md:inline">Elementi per pagina</span>
            <select
              value={take}
              onChange={(event) => onPaginationChange(0, Number(event.target.value))}
              className="border border-input bg-card px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              aria-label="Numero di prenotazioni per pagina"
            >
              {[1, 10, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>{pageSize}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={skip === 0 || isLoading}
              onClick={() => onPaginationChange(Math.max(0, skip - take), take)}
              aria-label="Pagina precedente"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <p className="text-xs">{currentPage} di {pageCount}</p>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={skip + take >= total || isLoading}
              onClick={() => onPaginationChange(skip + take, take)}
              aria-label="Pagina successiva"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={openDialog}
        onOpenChange={() => { setOpenDialog(false)}}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pr-10">
            <DialogTitle>Descrizione prenotazione</DialogTitle>
            <DialogDescription>{descriptionDialog?.courtName}</DialogDescription>
          </DialogHeader>
          <p className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words text-foreground">
            {descriptionDialog?.description || "Nessuna descrizione disponibile."}
          </p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
