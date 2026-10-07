import React, { useRef, useState, type RefObject } from "react";

import type { TournamentMatchResDto } from "../../../client/model/response/tournament.match.res.dto";
import { MatchBox } from "../../match/match.box";
import { LineTournamentBracket, type ILineTournamentBracket } from "./svg/line.tournament.bracket";
import { apiClient } from "../../../client/apiClient";
import { RefreshCw, X } from "lucide-react";
import { MatchBoxEdit } from "../../match/match.box.edit";
import type { TournamentTeamResDto } from "../../../client/model/response/tournamentTeam.res.dto";
import { RecordHelper } from "../../../helper/recordConverter";




interface TournamentBracketProps {
  matches: Record<string, TournamentMatchResDto> | null;
  setMatches: React.Dispatch<React.SetStateAction<Record<string, TournamentMatchResDto> | null>>;
  tournamentId: string | null; // Necessario per effettuare la chiamata di refresh

  editMode?: {
    teams: TournamentTeamResDto[] | null;
  };
}

export default function TournamentBracket({
  matches,
  setMatches,
  tournamentId,
  editMode,
}: TournamentBracketProps) {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // const [isOpen, setIsOpen] = useState<boolean>(true); // Gestisce l'apertura/chiusura a locandina
  const matchRefs = useRef<Record<string, RefObject<HTMLDivElement | null>>>({});

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if(!tournamentId) return;
      const res = await apiClient.getMatches(tournamentId);

      if(!tournamentId) return;
      if(res.Data === null) return;

      const recordMatches = RecordHelper.fromArrayByProperty(res.Data, "id")
      setMatches(recordMatches);

    } catch (error) {
      console.error("Errore durante l'aggiornamento dei match:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full mx-auto my-6 bg-muted/40 text-foreground rounded-2xl border border-border/60 shadow-xl flex flex-col overflow-hidden transition-all duration-300">

      {/* INTESTAZIONE: Titolo in alto, pulsanti nella riga sottostante */}
      <div className="flex flex-col px-4 py-3 bg-muted/60 border-b border-border/40 select-none gap-2.5">

        {/* Titolo in alto (centrato) */}
        <div className="text-center w-full flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest">
            Tabellone Torneo {editMode ? "EDIT MODE" : ""}
          </span>

           <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Aggiorna tabellone"
              className="px-3 py-1.5 rounded-lg bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 text-xs font-medium shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Aggiorna</span>
            </button>

        </div>

        {/* Pulsanti nella riga inferiore (centrati) */}
        {/* <div className="flex items-center justify-center gap-2">
          {/* Pulsante Aggiorna (visibile solo se aperto) */}
          {/* {isOpen && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Aggiorna tabellone"
              className="px-3 py-1.5 rounded-lg bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 text-xs font-medium shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Aggiorna</span>
            </button>
          )} */}

          {/* Pulsante Apri / Chiudi (Locandina) */}
          {/* <button
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? "Chiudi tabellone" : "Apri tabellone"}
            className="px-3 py-1.5 rounded-lg bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition shadow-sm flex items-center gap-1.5 text-xs font-medium"
          >
            <span>{isOpen ? "Chiudi" : "Apri"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button> }
        </div> */}

      </div>

      {/* CORPO DEL TABELLONE (Collassabile stile locandina) */}
      {/* <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}> */}

        {/* STATO DI CARICAMENTO INIZIALE (SKELETON SE matches === null) */}
        {matches === null ? (
          <div className="relative w-full overflow-hidden p-4 flex-1">
            <div className="relative inline-flex gap-16 justify-center items-stretch min-w-full px-6 animate-pulse">
              {[1, 2, 3].map((roundCol) => (
                <div key={roundCol} className="flex flex-col gap-6 justify-around min-w-[200px]">
                  <div className="h-4 w-20 bg-muted rounded mx-auto mb-4" />
                  {[1, 2, 4].map((matchItem) => (
                    <div key={matchItem} className="w-[200px] h-[90px] rounded-xl bg-card/60 border border-border/40 p-3" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : Object.keys(matches).length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <span className="text-sm text-muted-foreground">Nessun match caricato per questo torneo.</span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-95 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Carica Partite
            </button>
          </div>
        ) : (
          (() => {
            // Registrazione sicura dei ref

            if (matches) {Object.keys(matches).forEach(id => {
              if (id && !matchRefs.current[id]) {
                  matchRefs.current[id] = React.createRef<HTMLDivElement>();
                }
              });
            }

            const roundsMap = matches 
              ? Object.values(matches).reduce<Record<number, (TournamentMatchResDto | null)[]>>((acc, match) => {
                  if (!match) return acc;
                  if (!acc[match.round]) acc[match.round] = [];
                  acc[match.round].push(match);
                  return acc;
                }, {})
              : {};

            const matchValues = matches ? Object.values(matches) : [];
            const roundKeys = Array.from(new Set(matchValues.map(m => m.round))).sort((a, b) => a - b);

            if (roundKeys.length === 0) {
              return <div className="p-10 text-center text-slate-500">Nessun turno disponibile.</div>;
            }
            const linesTournamentBracket: ILineTournamentBracket[] = [];
            if (roundKeys.length > 1) {
              for (let i = 0; i < roundKeys.length - 1; i++) {
                const currentRoundMatches = roundsMap[roundKeys[i]];
                const nextRoundMatches = roundsMap[roundKeys[i + 1]];
                
                if(!currentRoundMatches) return;
                currentRoundMatches.forEach((match, index) => {
                  if (!match) return;
                  const nextMatchIndex = Math.floor(index / 2);
                  const nextMatch = nextRoundMatches[nextMatchIndex];

                  if (nextMatch && nextMatch.id) {
                    linesTournamentBracket.push({
                      fromMatchId: match.id,
                      toMatchId: nextMatch.id
                    });
                  }
                });
              }
            }

            const totalRows = roundsMap[roundKeys[0]]?.length || 1;

            return (
              <div className="relative w-full overflow-x-auto p-4 pb-6 flex-1 [mask-image:linear-gradient(to_right,transparent_0%,black_4%,black_97%,transparent_100%)]">
                <div className="relative inline-flex gap-16 justify-center items-stretch min-w-full bracket-container px-6">

                    {/* Linee SVG */}
                    {linesTournamentBracket.map((conn, index) => {
                      const fromRef = matchRefs.current[conn.fromMatchId];
                      const toRef = matchRefs.current[conn.toMatchId];

                      if (!fromRef || !toRef) return null;

                      return (
                        <LineTournamentBracket key={`conn-${index}`} fromRef={fromRef} toRef={toRef} />
                      );
                    })}

                    {/* Colonne dei Turni */}
                    {roundKeys.map((roundNum, roundIndex) => {
                      const matchesInRound = roundsMap[roundNum] || [];
                      const rowSpanMultiplier = Math.pow(2, roundIndex);

                      return (
                        <div key={`round-${roundNum}`} className="flex flex-col flex-shrink-0">
                          <div className="flex items-center justify-center text-center font-bold text-xs uppercase tracking-widest mb-4 h-[40px]">
                            {roundNum === roundKeys[roundKeys.length - 1] ? "Finale"
                              : roundNum === roundKeys[roundKeys.length - 2] && roundKeys.length > 1 ? "Semifinali"
                              : roundNum === roundKeys[roundKeys.length - 3] && roundKeys.length > 2 ? "Quarti"
                              : roundNum === roundKeys[roundKeys.length - 4] && roundKeys.length > 3 ? `Ottavi`
                              : `Turno ${roundNum}`}
                          </div>

                          <div
                            className="grid h-full w-full gap-4"
                            style={{ gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))` }}
                          >
                            {matchesInRound.map((match, mIndex) => {
                              const gridRowStart = mIndex * rowSpanMultiplier + 1;
                              const gridRowSpan = rowSpanMultiplier;

                              if (!match) {
                                return (
                                  <div
                                    key={`empty-${roundNum}-${mIndex}`}
                                    className="flex items-center justify-center w-full"
                                    style={{ gridRow: `${gridRowStart} / span ${gridRowSpan}` }}
                                  >
                                    <div className="w-[200px] h-[90px] rounded-xl bg-card/20 border border-dashed border-border/60 p-3 flex flex-col items-center justify-center text-center">
                                      <span className="text-xs text-muted-foreground font-medium">In attesa</span>
                                      <span className="text-[10px] text-muted-foreground/60 mt-1">TBD vs TBD</span>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={match.id}
                                  className="flex items-center justify-center w-full"
                                  style={{ gridRow: `${gridRowStart} / span ${gridRowSpan}` }}
                                >
                                  {editMode ? 
                                    <MatchBoxEdit match={match} setMatches={setMatches} matchRef={matchRefs.current[match.id]} 
                                      teams={editMode?.teams ?? null} 
                                    />
                                    :
                                    <MatchBox match={match} matchRef={matchRefs.current[match.id]}/>
                                  }
                                  
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
            );
          })()
        )}
      {/* </div> */}
    </div>
  );
}