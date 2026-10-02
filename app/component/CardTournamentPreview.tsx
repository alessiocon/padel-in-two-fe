import { Link } from "react-router";
import { MapPin, Award, Clock, CalendarClock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import type { TournamentsResDto } from "../client/model/response/tournaments.res.dto";
import { useEffect, useState } from "react";
import { apiClient } from "../client/apiClient";
import { dateHelper } from "../helper/dateHelper";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemTitle } from "../components/ui/item";

export function CardTournamentPreview() {
    const [tournaments, setTournaments] = useState<TournamentsResDto[] | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            setIsLoading(true);
            try {
                const res = await apiClient.getTournaments();

                if (!res.IsSuccess) { 
                    throw new Error("Failed to fetch tournament data");
                }

                setTournaments(res.Data!);
            } catch (error) {
                // Fallback di mock in caso di errore per test visivo se necessario
            } finally {
                setIsLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full md:w-xl m-auto flex flex-col gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="w-full bg-card border p-4 flex flex-col gap-3 animate-pulse">
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-3/4 rounded-md" />
                            <Skeleton className="h-2 w-1/2 rounded-md" />
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            <Skeleton className="h-2 w-full rounded-md" />
                            <Skeleton className="h-2 w-2/3 rounded-md" />
                            <Skeleton className="h-2 w-1/3 rounded-md" />
                        </div>
                        <Skeleton className="h-5 w-full md:w-28 rounded-md mt-2 self-end" />
                    </div>
                ))}
            </div>
        );
    }

    if (!tournaments || tournaments.length === 0) {
        return (
           <ItemGroup className="flex w-full flex-col p-4">
                    <Item className="w-full bg-card border border-border/20 px-3"
                    >
                        {/* Sezione Contenuti (Titolo, Indirizzo e Info a scaletta) */}
                        <div className="flex flex-col gap-3 flex-1 w-full">
                            <ItemHeader className="p-0text-left">
                                <ItemTitle className="text-lg font-semibold tracking-tight">
                                    Non ci sono Eventi disponibili
                                </ItemTitle>
                            </ItemHeader>
                        </div>
                    </Item>
        </ItemGroup>
        );
    }

    return (
        <ItemGroup className="w-full md:w-xl m-auto flex flex-col gap-2">
            {tournaments.map((tournament) => {
                const startsISO = typeof tournament.startsAt === 'string' ? tournament.startsAt : tournament.startsAt.toISOString();
                const endsISO = typeof tournament.endsAt === 'string' ? tournament.endsAt : tournament.endsAt.toISOString();

                const startAtTz = dateHelper.GetTimeZone(startsISO, tournament.timezone);
                const endAtTz = dateHelper.GetTimeZone(endsISO, tournament.timezone);
                const startDateFormatted = dateHelper.formatDate(startsISO);

                const startTime = dateHelper.formatTime(startAtTz.toString());
                const endTime = dateHelper.formatTime(endAtTz.toString());

                return (
                    <Item 
                        key={tournament.id} 
                        className="w-full bg-card border border-border/20 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                    >
                        {/* Sezione Contenuti (Titolo, Indirizzo e Info a scaletta) */}
                        <div className="flex flex-col gap-3 flex-1 w-full">
                            <ItemHeader className="p-0text-left">
                                <ItemTitle className="text-lg font-semibold tracking-tight text-primary">
                                    {tournament.title}<span className="text-foreground/90 text-xs"> - {startDateFormatted}</span> 
                                </ItemTitle>
                            </ItemHeader>

                            <ItemContent className="p-0">
                                <ItemDescription className="flex flex-wrap gap-4 text-sm text-foreground/90">
                                    <span className="flex items-start gap-2 font-medium">
                                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                                        {tournament.municipality}
                                    </span>
                                    <span className="flex items-start gap-2 font-medium">
                                        <Clock className="h-4 w-4 text-primary shrink-0" />
                                        {startTime} - {endTime}
                                    </span>
                                    <span className="flex items-start gap-2 font-medium">
                                        <Award className="h-4 w-4 text-primary shrink-0" />
                                        100€
                                    </span>
                                </ItemDescription>
                            </ItemContent>
                        </div>
                        <ItemFooter className="p-0 flex items-center justify-center md:justify-end w-full md:w-auto mt-1">
                            <Link to={`/tournaments/${tournament.id}`} className="w-full md:w-auto">
                                <Button variant="default" className="w-full md:w-auto">
                                    Visualizza
                                </Button>
                            </Link>
                        </ItemFooter>
                    </Item>
                );
            })}
        </ItemGroup>
    );
}