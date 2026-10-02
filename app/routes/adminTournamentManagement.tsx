import type { Route } from "./+types/adminTournamentManagement";
import React, { useState } from 'react';
import { useParams, useNavigate, useLoaderData } from 'react-router';
import { 
  ShieldAlert, 
  Loader2, 
  AlertCircle, 
  Save, 
  CheckCircle, 
  FastForward, 
  MapPin, 
  Users, 
  ArrowLeft,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { TournamentResDto } from "../client/model/response/tournament.res.dto";
import { MatchStatus } from "../client/model/common/Enum/matchStatus.dto";
import { MatchFormat } from "../client/model/common/Enum/match.format.dto";
import { apiClient } from "./../client/apiClient";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin gestione evento" },
    { name: "description", content: "gestione evento by admin" },
  ];
}

// export const mockTournamentDetail: TournamentResDto = {
//   id: "tourn-test-123",
//   title: "Torneo Padel Autunnale - Open Maschile",
//   description: "Torneo amatoriale di padel a gironi ed eliminazione diretta.",
//   position: "Via Roma 45, Circolo Padel Club",
//   municipality: "Milano",
//   province: "MI",
//   timezone: "Europe/Rome",
//   isClosed: false,
//   showTeams: true,
//   endsAt: new Date(),
//   startsAt: new Date(),
//   isVisible: true,
//   maxTeams: 8,
//   award: "Buono acquisto 200€ + Coppa",
//   teams: [
//     {
//       id: "team-1",
//       tournamentId: "tourn-test-123",
//       teamName: "Padel Kings",
//       player1Id: "usr-p1-1",
//       player2Id: "usr-p2-1",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       player1: { firstName: "Mario", lastName: "Rossi", phone: "+393331234567", username: "mario.rossi" },
//       player2: { firstName: "Luca", lastName: "Bianchi", phone: "+393339876543", username: "luca.bianchi" }
//     },
//     {
//       id: "team-2",
//       tournamentId: "tourn-test-123",
//       teamName: "Smash Bros",
//       player1Id: "usr-p1-2",
//       player2Id: null,
//       player2FName: "Giovanni",
//       player2LName: "Neri",
//       player2Phone: "+399658745852",
//       player1: { firstName: "Alessio", lastName: "Verdi", phone: "+393341122334", username: "alessio" },
//       player2: null
//     },
//     {
//       id: "team-3",
//       tournamentId: "tourn-test-123",
//       teamName: "Los Matadores",
//       player1Id: "usr-p1-3",
//       player2Id: "usr-p2-3",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       player1: { firstName: "Marco", lastName: "Gialli", phone: "+393355566778", username: "marcog" },
//       player2: { firstName: "Davide", lastName: "Blu", phone: "+393355566778", username: "davide.blu" }
//     }
//   ],
//   matches: [
//     {
//       id: "match-102",
//       tournamentId: "tourn-test-123",
//       courtId: "court-1",
//       courtName: "Campo Secondario",
//       team1Id: "team-2",
//       team2Id: "team-3",
//       team1Name: "Smash Bros",
//       team2Name: "Los Matadores",
//       format: MatchFormat.BEST_OF_3,
//       winnerTeamId: null,
//       round: 1,
//       matchOrder: 2,
//       status: MatchStatus.SCHEDULED,
//       scheduledAt: new Date(),
//       score: []
//     },
//     {
//       id: "match-101",
//       tournamentId: "tourn-test-123",
//       courtId: "court-1",
//       courtName: "Campo Centrale",
//       team1Id: "team-1",
//       team2Id: "team-2",
//       team1Name: "Padel Kings",
//       team2Name: "Smash Bros",
//       format: MatchFormat.BEST_OF_3,
//       winnerTeamId: null,
//       round: 1,
//       matchOrder: 1,
//       status: MatchStatus.IN_PROGRESS,
//       scheduledAt: new Date(),
//       score: []
//     }
//   ]
// };

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    throw new Error("Torneo non specificato");
  }

  try {
    const response = await apiClient.getTournament(params.id);
    if (response && response.IsSuccess && response.Data) {
      return response.Data;
    }
  } catch (err) {
    console.warn("Chiamata API fallita o in ambiente di test, carico il mock locale:", err);
  }
}

export default function AdminTournamentManagementPage() {
  const tournament = useLoaderData<TournamentResDto>();
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stato modale per la sola gestione dei set di un match specifico
  const [activeModalMatch, setActiveModalMatch] = useState<any | null>(null);
  const [tempSets, setTempSets] = useState<Array<{ team1Games: number; team2Games: number; tieBreak: boolean }>>([]);

  // Lista campi ricavata dai match esistenti o mock
  const availableCourts = React.useMemo(() => {
    const map = new Map<string, string>();
    tournament?.matches?.forEach(m => {
      if (m.courtId && m.courtName) {
        map.set(m.courtId, m.courtName);
      }
    });
    if (map.size === 0) {
      map.set("court-1", "Campo Centrale");
      map.set("court-2", "Campo Secondario");
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tournament]);

  // Stato locale dei match mappato per gestirne le modifiche (incluso il courtId) prima del salvataggio dello slot
  const [matchEdits, setMatchEdits] = useState<Record<string, {
    team1Id: string | null;
    team2Id: string | null;
    courtId: string | null;
    format: MatchFormat | null;
    scheduledAt: Date | null;
  }>>(() => {
    const initial: Record<string, any> = {};
    tournament?.matches?.forEach(m => {
      initial[m.id] = {
        team1Id: m.team1Id,
        team2Id: m.team2Id,
        courtId: m.courtId,
        format: m.format,
        scheduledAt: m.scheduledAt
      };
    });
    return initial;
  });

  const handleFieldChange = (matchId: string, field: string, value: any) => {
    setMatchEdits(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value === "none" ? null : value
      }
    }));
  };

  // Funzione di utilità per ricavare il nome della squadra dallo stato corrente o dalle liste
  const getTeamName = (matchId: string, teamPosition: 'team1Id' | 'team2Id') => {
    const currentEdit = matchEdits[matchId];
    const targetTeamId = currentEdit ? currentEdit[teamPosition] : null;
    if (!targetTeamId) return teamPosition === 'team1Id' ? 'Squadra 1 (Non assegnata)' : 'Squadra 2 (Non assegnata)';
    
    const found = tournament.teams?.find?.(t => t.id === targetTeamId);
    return found ? found.teamName : (teamPosition === 'team1Id' ? 'Squadra 1' : 'Squadra 2');
  };

  // Apertura modale gestione set
  const openSetsModal = (match: any) => {
    setActiveModalMatch(match);
    const existingSets = match.score?.map((s: any) => ({
      team1Games: s.team1Games ?? 0,
      team2Games: s.team2Games ?? 0,
      tieBreak: s.tieBreak ?? false
    })) || [{ team1Games: 0, team2Games: 0, tieBreak: false }];
    setTempSets(existingSets);
  };

  const handleAddSetRow = () => {
    setTempSets(prev => [...prev, { team1Games: 0, team2Games: 0, tieBreak: false }]);
  };

  const handleRemoveSetRow = (index: number) => {
    setTempSets(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetGameChange = (index: number, teamField: 'team1Games' | 'team2Games', value: string) => {
    const val = parseInt(value, 10);
    setTempSets(prev => {
      const updated = [...prev];
      updated[index][teamField] = isNaN(val) ? 0 : val;
      return updated;
    });
  };

  const handleSetTieBreakChange = (index: number, value: boolean) => {
    setTempSets(prev => {
      const updated = [...prev];
      updated[index].tieBreak = value;
      return updated;
    });
  };

  // Salvataggio dei set e chiusura automatica del match tramite apiClient.endMatch
  const handleSaveSets = async () => {
    if (!activeModalMatch || !tournamentId) return;
    try {
      setActionLoading(activeModalMatch.id);
      setError(null);

      const endMatchPayload = {
        sets: tempSets.map((s, idx) => ({
          setNumber: idx + 1,
          team1Games: s.team1Games,
          team2Games: s.team2Games,
          tieBreak: s.tieBreak
        }))
      };

      const res = await apiClient.endMatch(tournamentId, activeModalMatch.id, endMatchPayload);
      if (res && !res.IsSuccess) {
        throw new Error("Errore durante la chiusura del match e il salvataggio dei set.");
      }

      setSuccessMsg(`Match chiuso e set registrati con successo.`);
      setActiveModalMatch(null);
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio dei set.");
    } finally {
      setActionLoading(null);
    }
  };

  // Azione Update Match (Slot / Campo / Formato / Squadre)
  const handleSaveMatch = async (matchId: string) => {
    if (!tournamentId) return;
    try {
      setActionLoading(matchId);
      setError(null);
      setSuccessMsg(null);

      const input = matchEdits[matchId];
      const res = await apiClient.updateMatch(tournamentId, matchId, input);
      if (res && !res.IsSuccess) {
        throw new Error("Errore durante l'aggiornamento del match.");
      }

      setSuccessMsg(`Match aggiornato con successo.`);
    } catch (err: any) {
      setError(err.message || "Errore di connessione durante il salvataggio.");
    } finally {
      setActionLoading(null);
    }
  };

  // Azione Next Match
  const handleNextMatch = async (matchId: string) => {
    if (!tournamentId) return;
    try {
      setActionLoading(matchId);
      setError(null);
      setSuccessMsg(null);

      const res = await apiClient.nextMatch(tournamentId, matchId);
      if (res && !res.IsSuccess) {
        throw new Error("Impossibile avanzare lo slot del match.");
      }

      setSuccessMsg(`Vincitore inoltrato con successo nello slot successivo.`);
    } catch (err: any) {
      setError(err.message || "Errore durante l'avanzamento del turno.");
    } finally {
      setActionLoading(null);
    }
  };

  // Ordinamento dei match per Round (crescente) e poi per MatchOrder (crescente)
  const sortedMatches = tournament?.matches ? [...tournament.matches].sort((a, b) => {
    if (a.round !== b.round) {
      return a.round - b.round;
    }
    return a.matchOrder - b.matchOrder;
  }) : [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 relative">
      
      {/* Header Pannello Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="gap-1 font-semibold uppercase tracking-wider text-[10px]">
              <ShieldAlert className="h-3 w-3" /> Area Riservata Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestione Operativa: {tournament?.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Organizza i match in ordine di round, assegna le squadre e i campi, inserisci i set e finalizza i turni.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start md:self-auto px-3 py-1.5 rounded-md border border-border/40 bg-card cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Torna Indietro
        </button>
      </div>

      {/* Messaggi di feedback */}
      {successMsg && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sezione Lista Partite ordinate */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Elenco Match (Ordinati per Round e Ordine)
        </h2>

        {sortedMatches.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/60 rounded-lg text-muted-foreground text-xs">
            Nessun match trovato per questo torneo.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedMatches.map((match) => {
              const currentEdit = matchEdits[match.id] || {
                team1Id: match.team1Id,
                team2Id: match.team2Id,
                courtId: match.courtId,
                format: match.format,
                scheduledAt: match.scheduledAt
              };

              const isBusy = actionLoading === match.id;

              return (
                <div 
                  key={match.id}
                  className="p-5 rounded-lg border border-border/40 bg-card space-y-4 shadow-2xs"
                >
                  {/* Riga info match con ordine esplicito */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/20 pb-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                        Turno (Round) {match.round} — Match #{match.matchOrder}
                      </span>
                      <Badge variant={match.status === MatchStatus.COMPLETED ? 'secondary' : 'default'} className="text-[10px]">
                        {match.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>Stato Campo attuale: <strong className="text-foreground">{match.courtName || 'Non assegnato'}</strong></span>
                    </div>
                  </div>

                  {/* Form di modifica slot (Squadra 1, Squadra 2, Campo, Formato) */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    
                    {/* Squadra 1 */}
                    <div className="space-y-1.5">
                      <label className="font-medium text-muted-foreground">Squadra 1</label>
                      <select
                        value={currentEdit.team1Id || "none"}
                        onChange={(e) => handleFieldChange(match.id, 'team1Id', e.target.value)}
                        className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="none">-- Seleziona Squadra 1 --</option>
                        {tournament.teams?.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.teamName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Squadra 2 */}
                    <div className="space-y-1.5">
                      <label className="font-medium text-muted-foreground">Squadra 2</label>
                      <select
                        value={currentEdit.team2Id || "none"}
                        onChange={(e) => handleFieldChange(match.id, 'team2Id', e.target.value)}
                        className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="none">-- Seleziona Squadra 2 --</option>
                        {tournament.teams?.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.teamName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Campo (Court) */}
                    <div className="space-y-1.5">
                      <label className="font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> Assegna Campo
                      </label>
                      <select
                        value={currentEdit.courtId || "none"}
                        onChange={(e) => handleFieldChange(match.id, 'courtId', e.target.value)}
                        className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="none">-- Seleziona Campo --</option>
                        {availableCourts.map((court) => (
                          <option key={court.id} value={court.id}>
                            {court.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Formato */}
                    <div className="space-y-1.5">
                      <label className="font-medium text-muted-foreground">Formato Partita</label>
                      <select
                        value={currentEdit.format || MatchFormat.BEST_OF_3}
                        onChange={(e) => handleFieldChange(match.id, 'format', e.target.value as MatchFormat)}
                        className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value={MatchFormat.SINGLE_SET}>Set Unico (SINGLE_SET)</option>
                        <option value={MatchFormat.BEST_OF_3}>Al meglio di 3 (BEST_OF_3)</option>
                      </select>
                    </div>

                  </div>

                  {/* Pulsanti azioni amministrative */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/10">
                    
                    {/* Pulsante per aprire il popup dei set e chiudere il match */}
                    <button
                      onClick={() => openSetsModal(match)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Inserisci Set & Chiudi Match
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Salva slot e campo (updateMatch) */}
                      <button
                        onClick={() => handleSaveMatch(match.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Salva Slot
                      </button>

                      {/* Avanza vincitore turno successivo (nextMatch) */}
                      <button
                        onClick={() => handleNextMatch(match.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FastForward className="h-3.5 w-3.5" />}
                        Avanti al Tabellone (Next)
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALE POPUP INSERIMENTO SET E CHIUSURA MATCH */}
      {activeModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Inserimento Set e Conclusione Match</h3>
                <p className="text-xs text-muted-foreground">Round {activeModalMatch.round} — Match #{activeModalMatch.matchOrder}</p>
              </div>
              <button 
                onClick={() => setActiveModalMatch(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lista Set Dinamica */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <label className="text-xs font-medium text-muted-foreground block">Punteggio Set</label>
              {tempSets.map((setObj, index) => (
                <div key={index} className="flex flex-col gap-2.5 p-3.5 rounded-lg border border-border/40 bg-background/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Set #{index + 1}</span>
                    <button
                      onClick={() => handleRemoveSetRow(index)}
                      className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Rimuovi set"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 justify-between">
                    {/* Campo Team 1 con nome reale */}
                    <div className="flex flex-col items-start flex-1">
                      <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[140px]" title={getTeamName(activeModalMatch.id, 'team1Id')}>
                        {getTeamName(activeModalMatch.id, 'team1Id')}
                      </span>
                      <input 
                        type="number"
                        min="0"
                        max="7"
                        value={setObj.team1Games}
                        onChange={(e) => handleSetGameChange(index, 'team1Games', e.target.value)}
                        className="w-full rounded border border-border px-2 py-1 text-center text-xs bg-background mt-0.5"
                      />
                    </div>

                    <span className="text-muted-foreground font-bold pt-4">-</span>

                    {/* Campo Team 2 con nome reale */}
                    <div className="flex flex-col items-start flex-1">
                      <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[140px]" title={getTeamName(activeModalMatch.id, 'team2Id')}>
                        {getTeamName(activeModalMatch.id, 'team2Id')}
                      </span>
                      <input 
                        type="number"
                        min="0"
                        max="7"
                        value={setObj.team2Games}
                        onChange={(e) => handleSetGameChange(index, 'team2Games', e.target.value)}
                        className="w-full rounded border border-border px-2 py-1 text-center text-xs bg-background mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Checkbox Tie-break */}
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="checkbox"
                      id={`tiebreak-${index}`}
                      checked={setObj.tieBreak}
                      onChange={(e) => handleSetTieBreakChange(index, e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <label htmlFor={`tiebreak-${index}`} className="text-[11px] text-muted-foreground cursor-pointer">
                      Tie-break giocato in questo set
                    </label>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddSetRow}
                className="w-full py-2 border border-dashed border-border rounded-lg text-xs font-medium text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Aggiungi un altro set
              </button>
            </div>

            {/* Footer Modale */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
              <button
                onClick={() => setActiveModalMatch(null)}
                className="px-4 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-muted/50 cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveSets}
                disabled={actionLoading !== null}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading !== null && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <CheckCircle className="h-3.5 w-3.5" /> Salva e Chiudi Partita
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}