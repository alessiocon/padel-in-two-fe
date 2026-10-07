import { Award, Calendar, CheckCircle2, ChevronDown, Clock, FileText, MapPin, Users, XCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { TournamentResDto } from "../../client/model/response/tournament.res.dto";
import { dateHelper } from "../../helper/dateHelper";
import { Skeleton } from "../ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";


export default function TournamentInfo({tournament}: {tournament: TournamentResDto | null}) {
    const [isOpenDesc, setIsOpenDesc] = useState<boolean>(false)

    if(tournament === null) return <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-5">
        <Skeleton className="h-8 md:h-9 w-3/4 max-w-md" />

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Seconda sezione: Grid a 3 colonne (Premi, Data, Squadre) */}
      <div className="grid grid-cols-3 gap-2 bg-muted/40 border border-border/30 rounded-lg p-3">
        <div className="border-r border-border/30 pr-2 flex items-center justify-center">
          <Skeleton className="h-5 w-16 rounded" />
        </div>

        <div className="border-r border-border/30 px-2 flex items-center justify-center">
          <Skeleton className="h-5 w-20 rounded" />
        </div>

        <div className="pl-2 flex items-center justify-center">
          <Skeleton className="h-5 w-12 rounded" />
        </div>
      </div>
    </div>

    const startsISO = typeof tournament.startsAt === 'string' ? tournament.startsAt : tournament.startsAt.toISOString();
    const endsISO = typeof tournament.endsAt === 'string' ? tournament.endsAt : tournament.endsAt.toISOString();
    
    const startAtTz = dateHelper.GetTimeZone(startsISO, tournament.timezone);
    const endAtTz = dateHelper.GetTimeZone(endsISO, tournament.timezone);
    const startDateFormatted = dateHelper.formatDate(startsISO);
    const startTime = dateHelper.formatTime(startAtTz.toString());
    const endTime = dateHelper.formatTime(endAtTz.toString());

    return (<>
        <div className="flex flex-col gap-3 border-b border-border/40 pb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {tournament.title}
              </h1>
              <Badge 
                variant={"outline"}
                className={`capitalize font-medium ${
                  tournament.isClosed 
                    ? "bg-muted text-muted-foreground border-border" 
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {tournament.isClosed ? (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Chiuso
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Iscrizioni Aperte
                  </span>
                )}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                {tournament.position}, {tournament.municipality} ({tournament.province})
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                {startTime} - {endTime}
              </span>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-muted/40 border border-border/30 rounded-lg p-3 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 border-r border-border/30 pr-2">
            <Award className="h-4 w-4 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Premio</p>
              <p className="text-xs md:text-sm font-semibold">{tournament.award || "N.D."}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 border-r border-border/30 px-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Data Evento</p>
              <p className="text-xs md:text-sm font-semibold">{startDateFormatted}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 pl-2">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Squadre</p>
              <p className="text-xs md:text-sm font-semibold">{tournament.teams.length} / {tournament.maxTeams}</p>
            </div>
          </div>
        </div>

        <Collapsible open={isOpenDesc} onOpenChange={setIsOpenDesc} className="border border-border/30 rounded-lg bg-card overflow-hidden shadow-none">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors text-left cursor-pointer">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>Informazioni e Descrizione Torneo</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpenDesc ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4 pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pt-2 border-t border-border/20">
              {tournament.description}
            </p>
          </CollapsibleContent>
        </Collapsible>
    </>
        
      )
}