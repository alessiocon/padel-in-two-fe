import { useEffect, useState } from "react";
import { 
  Trophy, 
  ChevronDown, 
  Loader2, 
  AlertCircle,
  Swords,
  CheckCircle2,
  Clock,
  MapPin
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { 
  TournamentMatchResDto} from "./../client/model/response/tournament.match.res.dto"
import {MatchStatus} from "./../client/model/common/Enum/matchStatus.dto";

// Struttura a round utile per la visualizzazione a scaletta
export interface ScheduleRound {
  roundNumber: number;
  roundName: string;
  matches: TournamentMatchResDto[];
}

interface TournamentScheduleProps {
  tournamentId: string;
  matches: TournamentMatchResDto[]; // Passiamo i match direttamente dal DTO principale o li carichiamo internamente
}

export function TournamentSchedule({ tournamentId, matches = [] }: TournamentScheduleProps) {
  const [rounds, setRounds] = useState<ScheduleRound[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Raggruppiamo i match del torneo per "round" non appena cambiano
  useEffect(() => {
    if (!matches || matches.length === 0) {
      setRounds([]);
      return;
    }

    const groupedMap = new Map<number, TournamentMatchResDto[]>();

    matches.forEach((match) => {
      const currentRound = match.round || 1;
      if (!groupedMap.has(currentRound)) {
        groupedMap.set(currentRound, []);
      }
      groupedMap.get(currentRound)?.push(match);
    });

    const formattedRounds: ScheduleRound[] = Array.from(groupedMap.entries())
      .map(([roundNumber, roundMatches]) => ({
        roundNumber,
        roundName: getRoundName(roundNumber, groupedMap.size),
        matches: roundMatches.sort((a, b) => a.matchOrder - b.matchOrder),
      }))
      .sort((a, b) => a.roundNumber - b.roundNumber);

    setRounds(formattedRounds);
  }, [matches]);

  // Helper per dare un nome logico ai round in base al totale o al numero
  function getRoundName(roundNum: number, totalRounds: number): string {
    if (totalRounds === 1) return "Fase a Gironi / Unica";
    if (roundNum === totalRounds) return "Finale";
    if (roundNum === totalRounds - 1) return "Semifinali";
    if (roundNum === totalRounds - 2) return "Quarti di Finale";
    return `Turno ${roundNum}`;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-border/30 rounded-lg bg-card overflow-hidden shadow-none"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors text-left cursor-pointer">
        <div className="flex items-center gap-2 font-semibold text-base text-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          <span>Scaletta e Tabellone Partite ({matches.length})</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="p-0 border-t border-border/20">
        {rounds.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nessuna partita pianificata o scaletta disponibile per questo torneo.
          </div>
        ) : (
          <div className="flex flex-col max-h-[600px] overflow-y-auto relative">
            {rounds.map((round) => (
              <div key={round.roundNumber} className="relative pb-4">
                
                {/* Sticky Header del Turno */}
                <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur-md border-y border-border/50 px-4 py-2.5 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <Swords className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {round.roundName}
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {round.matches.length} {round.matches.length === 1 ? 'partita' : 'partite'}
                  </span>
                </div>

                {/* Griglia delle Partite */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {round.matches.map((match) => {
                    const isCompleted = match.status === MatchStatus.COMPLETED;
                    const isLive = match.status === MatchStatus.IN_PROGRESS;
                    const isCancelled = match.status === MatchStatus.CANCELLED;

                    return (
                      <div
                        key={match.id}
                        className="flex flex-col justify-between p-3 rounded-md border border-border/40 bg-card hover:bg-muted/30 transition-colors gap-2.5 text-xs shadow-2xs"
                      >
                        {/* Header Partita: Stato e Campo */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/20 pb-2">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isCompleted ? (
                              <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                <CheckCircle2 className="h-3 w-3" />
                                Conclusa
                              </span>
                            ) : isLive ? (
                              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                In corso
                              </span>
                            ) : isCancelled ? (
                              <span className="flex items-center gap-1 text-destructive">
                                Annullata
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {match.scheduledAt 
                                  ? new Date(match.scheduledAt).toLocaleTimeString([], {}) 
                                  : 'Da giocare'}
                              </span>
                            )}
                          </div>

                          {match.courtName && (
                            <span className="flex items-center gap-1 font-semibold text-foreground/80 bg-muted px-2 py-0.5 rounded border border-border/30 text-[10px]">
                              <MapPin className="h-2.5 w-2.5 text-primary" />
                              {match.courtName}
                            </span>
                          )}
                        </div>

                        {/* Squadre e Punteggi basati sul DTO dei Set */}
                        <div className="flex flex-col gap-2 py-0.5">
                          
                          {/* Squadra 1 */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`truncate font-medium ${
                                match.winnerTeamId && match.winnerTeamId === match.team1Id
                                  ? "text-emerald-500 font-bold"
                                  : match.team1Name
                                  ? "text-foreground"
                                  : "italic text-muted-foreground text-[11px]"
                              }`}
                            >
                              {match.team1Name || "Da definire"}
                            </span>

                            {/* Punteggio Set Squadra 1 */}
                            <div className="flex items-center gap-1">
                              {match.score && match.score.length > 0 ? (
                                match.score.map((set) => (
                                  <Badge
                                    key={set.id}
                                    variant={match.winnerTeamId === match.team1Id ? "default" : "outline"}
                                    className={`h-4 min-w-[20px] px-1 justify-center text-[11px] font-bold ${
                                      match.winnerTeamId === match.team1Id 
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none" 
                                        : ""
                                    }`}
                                  >
                                    {set.team1Games}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-[10px]">-</span>
                              )}
                            </div>
                          </div>

                          {/* Squadra 2 */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`truncate font-medium ${
                                match.winnerTeamId && match.winnerTeamId === match.team2Id
                                  ? "text-emerald-500 font-bold"
                                  : match.team2Name
                                  ? "text-foreground"
                                  : "italic text-muted-foreground text-[11px]"
                              }`}
                            >
                              {match.team2Name || "Da definire"}
                            </span>

                            {/* Punteggio Set Squadra 2 */}
                            <div className="flex items-center gap-1">
                              {match.score && match.score.length > 0 ? (
                                match.score.map((set) => (
                                  <Badge
                                    key={set.id}
                                    variant={match.winnerTeamId === match.team2Id ? "default" : "outline"}
                                    className={`h-4 min-w-[20px] px-1 justify-center text-[11px] font-bold ${
                                      match.winnerTeamId === match.team2Id 
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none" 
                                        : ""
                                    }`}
                                  >
                                    {set.team2Games}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-[10px]">-</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}