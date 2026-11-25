import { useContext, useEffect, useState } from "react";
import { ArrowLeft, CalendarRange, Loader2, ShieldX } from "lucide-react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types/managerbookings";
import { apiClient } from "~/client/apiClient";
import { ClubRole } from "~/client/model/common/Enum/club.role";
import { BookingStatus } from "~/client/model/common/Enum/booking.status.dto";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
import type { ClubResDto } from "~/client/model/response/ClubResDto";
import { ManagerBookingsTable } from "~/components/booking/manager.bookings.table";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AuthContext } from "~/store/context";

const STAFF_ROLES = new Set([ClubRole.OWNER, ClubRole.MANAGER, ClubRole.STAFF]);

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthRange = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
};

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Prenotazioni club - Padel" },
    { name: "description", content: `Gestione delle prenotazioni del club ${params.id ?? ""}` },
  ];
}

export default function ManagerBookingsPage() {
  const { id: clubId } = useParams<{ id: string }>();
  const [auth] = useContext(AuthContext);
  const [club, setClub] = useState<ClubResDto | null>(null);
  const [bookings, setBookings] = useState<BookingQuickResDto[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [month, setMonth] = useState(getCurrentMonth);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [createdByStaffFilter, setCreatedByStaffFilter] = useState<"ALL" | "YES" | "NO">("ALL");
  const [isLoadingClub, setIsLoadingClub] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [clubError, setClubError] = useState<string | null>(null);

  const member = club?.members.find((clubMember) => clubMember.userId === auth.sub);
  const isStaffMember = Boolean(member && STAFF_ROLES.has(member.role));

  useEffect(() => {
    if (!clubId) {
      setClubError("Club non specificato.");
      setIsLoadingClub(false);
      return;
    }

    let isActive = true;

    apiClient.getClub(clubId)
      .then((response) => {
        if (!isActive) return;

        if (!response.IsSuccess || !response.Data) {
          setClubError(response.Error?.message ?? "Impossibile caricare il club.");
          return;
        }

        setClub(response.Data);
      })
      .catch(() => {
        if (isActive) setClubError("Impossibile caricare il club.");
      })
      .finally(() => {
        if (isActive) setIsLoadingClub(false);
      });

    return () => {
      isActive = false;
    };
  }, [clubId]);

  useEffect(() => {
    if (!clubId || !isStaffMember) return;

    let isActive = true;
    const range = getMonthRange(month);
    setIsLoadingBookings(true);

    apiClient.searchBookingForManager(clubId, {
      ...range,
      skip,
      take,
      status: statusFilter === "ALL" ? undefined : [statusFilter],
    })
      .then((response) => {
        if (!isActive) return;

        if (!response.IsSuccess || !response.Data) {
          setBookings([]);
          setTotalBookings(0);
          return;
        }

        setBookings(response.Data.data ?? []);
        setTotalBookings(response.Data.total ?? 0);
      })
      .catch(() => {
        if (isActive) {
          setBookings([]);
          setTotalBookings(0);
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingBookings(false);
      });

    return () => {
      isActive = false;
    };
  }, [clubId, isStaffMember, month, skip, take, statusFilter, createdByStaffFilter]);

  const handleMonthChange = (nextMonth: string) => {
    setMonth(nextMonth);
    setSkip(0);
  };

  const handleStatusFilterChange = (nextStatus: BookingStatus | "ALL") => {
    setStatusFilter(nextStatus);
    setSkip(0);
  };

  const handleCreatedByStaffFilterChange = (nextFilter: "ALL" | "YES" | "NO") => {
    setCreatedByStaffFilter(nextFilter);
    setSkip(0);
  };

  if (isLoadingClub) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center gap-2 text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Verifica accesso al club...
      </main>
    );
  }

  if (clubError || !club) {
    return (
      <div className="mx-auto max-w-3xl p-4 lg:p-8">
        <Card>
          <CardHeader><CardTitle>Club non disponibile</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{clubError ?? "Il club richiesto non esiste."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStaffMember) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center p-4 lg:p-8">
        <Card className="w-full text-center">
          <CardHeader>
            <ShieldX className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
            <CardTitle>Accesso riservato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Solo i membri dello staff di {club.name} possono visualizzare questa pagina.
            </p>
            <Link to={`/clubs/${club.id}`} className={buttonVariants({ variant: "default" })}>
              <ArrowLeft /> Torna al club
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 text-foreground p-4 lg:p-8 space-y-6">
        <Link to={`/clubs/${club.id}/manage`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <ArrowLeft className="inline h-4 w-4" /> Indietro
        </Link>
      <div className="mx-auto max-w-7xl space-y-6 mt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            
          <div>
            <p className="text-xs font-semibold uppercase text-primary">{club.name}</p>
            <h1 className="font-heading text-2xl font-bold uppercase">Gestione prenotazioni</h1>
          </div>


        </div>

        <ManagerBookingsTable
          bookings={bookings}
          total={totalBookings}
          isLoading={isLoadingBookings}
          month={month}
          onMonthChange={handleMonthChange}
          skip={skip}
          take={take}
          onPaginationChange={(nextSkip, nextTake) => {
            setSkip(nextSkip);
            setTake(nextTake);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          createdByStaffFilter={createdByStaffFilter}
          onCreatedByStaffFilterChange={handleCreatedByStaffFilterChange}
        />
      </div>
    </div>
  );
}
