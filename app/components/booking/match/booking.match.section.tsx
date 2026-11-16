import { useState, useEffect, useContext } from "react";
import { Trophy, CheckCircle2, XCircle, Trash2,  Users, Send } from "lucide-react";
import { AuthContext } from "../../../store/context";
import type { BookingMatchResDto } from "../../../client/model/response/booking.match.res.dto";
import { MatchFormat } from "../../../client/model/common/Enum/match.format.dto";
import { apiClient } from "../../../client/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { MatchPropose } from "../../../client/model/common/Enum/match.propose";
import { Button } from "../../ui/button";
import type { BookingSetScoreProps } from "../../../client/model/response/booking.match.score.res.dto";
import { MatchForm } from "./match.form";
import { BookingStatus } from "../../../client/model/common/Enum/booking.status.dto";
import { MatchProposeBadge } from "../../budge/match.propose.badge";

interface BookingMatchSectionProps {
  bookingId: string;
  team1Name: string,
  team2Name: string,
  bookingStatus: BookingStatus,
  isStaff: boolean;
  allPlayer: boolean;

}

export function BookingMatchSection({
  bookingId,
  isStaff,
  allPlayer,
  team1Name,
  team2Name,
  bookingStatus
}: BookingMatchSectionProps) {
  const [auth] = useContext(AuthContext);
  const [match, setMatch] = useState<BookingMatchResDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states per la creazione della proposta
  const [selectedFormat, setSelectedFormat] = useState<MatchFormat>(MatchFormat.SINGLE_SET);
  const [setsInput, setSetsInput] = useState<BookingSetScoreProps[]>([
    { setNumber: 1, team1Games: 0, team2Games: 0, tieBreak: false },
  ]);

  const fetchMatch = async () => {
    if (!allPlayer && bookingStatus !== BookingStatus.IN_PROGRESS) {
      setMatch(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.getMatchOfBooking(bookingId);
      setMatch(res.Data ?? null);
    } catch (err) {

      alert("Impossibile caricare i dati del match.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    
  }, [bookingId, allPlayer]);

  // Gestione dinamica dei set in base al formato scelto
  const handleFormatChange = (format: MatchFormat) => {
    setSelectedFormat(format);
    if (format === MatchFormat.SINGLE_SET) {
      setSetsInput([{ setNumber: 1, team1Games: 0, team2Games: 0, tieBreak: false }]);
    } else {
      setSetsInput([
        { setNumber: 1, team1Games: 0, team2Games: 0, tieBreak: false },
        { setNumber: 2, team1Games: 0, team2Games: 0, tieBreak: false },
        { setNumber: 3, team1Games: 0, team2Games: 0, tieBreak: false },
      ]);
    }
  };

  const handleAddMatchPropose = async () => {
    if (!allPlayer &&  bookingStatus !== BookingStatus.IN_PROGRESS) return;
    
    try {
      setLoading(true);
      let errorMessage = null;

      const payload = {
        format: selectedFormat,
        isStaff: isStaff,
        matches: setsInput.map((s) => {
          const game1 = Number(s.team1Games);
          const game2 = Number(s.team2Games)
          if(game1 < 6 && game2 < 6 ){
            errorMessage = "un set non può finire se una delle due squadre non arriva almeno a 6 game viniti"
          }
          if(game1 === game2){
            errorMessage = "un set non può finire con un pareggio"
          }

          return {
            setNumber: s.setNumber,
            team1Games: Number(game1),
            team2Games: Number(game2),
            tieBreak: s.tieBreak,
          }
        }),
      };

      if(errorMessage) return alert(errorMessage);

      const res = await apiClient.addMatchPropose(bookingId, payload);

      if(res.Data) setMatch(res.Data);
      if(res.Error) alert(res.Error.message);

    } catch (err) {
      alert("Impossibile inviare i dati del match.");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Accetta o Rifiuta Proposta
  const handleAcceptMatch = async (isAccepted: boolean) => {
    try {
      setLoading(true);

      const res = await apiClient.acceptMatchPropose(bookingId, {
        isAccepted,
        isStaff,
      });

      if(res.Data) setMatch(res.Data);
      if(res.Error) alert(res.Error.message);

    } catch (err) {
      alert("Errore durante la gestione della risposta.");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Elimina Proposta
  const handleDeleteMatch = async () => {
    try {
      setLoading(true);
      
      let res = await apiClient.deleteMatchPropose(bookingId, { isStaff });

      if(res.Error) return alert(res.Error.message);
      setMatch(null);
    } catch (err) {

      alert("Errore durante l'eliminazione.");
    } finally {
      setLoading(false);
    }
  };

  if ( bookingStatus !== BookingStatus.END && (bookingStatus !== BookingStatus.IN_PROGRESS  || !allPlayer)) {
  
    let message = bookingStatus !== BookingStatus.IN_PROGRESS
      ? ["Match non attivo", "Arrivati al Club, lo staff attiverà il match"]
      : ["Squadre non al completo", "Mancano dei giocatori, o non tutti hanno accettato il match"]

    return (
      <Card className="w-full max-w-xl mx-auto border shadow-sm">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Risultato Match
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/30 rounded-md border border-dashed space-y-2">
            <Users className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{message[0]}</p>
            <p className="text-xs text-muted-foreground"> {message[1]} </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <Card className="w-full max-w-xl mx-auto p-6 space-y-4 animate-pulse bg-card text-card-foreground">
        <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
        <div className="h-32 bg-muted rounded"></div>
        <div className="flex justify-end gap-2">
          <div className="h-9 bg-muted rounded w-24"></div>
        </div>
      </Card>
    );
  }

  // --- DERIVAZIONE DEI RUOLI DALLE LISTE ---
  const playerId = auth?.playerId;
  const isProponent = Boolean(match?.proposePlayerIds?.includes(playerId));
  const isPendingPlayer = Boolean(match?.pendingPlayerIds?.includes(playerId));
  const hasAccess = isStaff || Boolean(playerId);
  // Stati del match
  const isDeclined = match?.status === MatchPropose.DECLINED;

  // Condizione per mostrare il form di proposta (se non c'è match, è NOTHING, oppure è DECLINED)
  const showProposalForm =  !match || isDeclined;

  if (showProposalForm) {
    return (
      <Card className="w-full max-w-xl mx-auto border shadow-sm">
        <CardHeader className="px-0">
          <CardTitle className="text-center text-xs md:text-lg font-semibold flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> 
              {isDeclined ? "Proposta Rifiutata" : "Inserisci Risultato Match"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2">
          {isDeclined && (
            <div className="text-xs bg-muted p-3 rounded-md text-muted-foreground">
              La proposta precedente è stata rifiutata. Puoi inserire un nuovo risultato per sbloccare nuovamente il match.
            </div>
          )}

          {!hasAccess ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              Non disponi dei permessi necessari per inserire il risultato di questo match.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Formato Match */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Formato Partita</label>
                <select
                  className="p-2 rounded-md border bg-background text-foreground text-sm"
                  value={selectedFormat}
                  onChange={(e) => handleFormatChange(e.target.value as MatchFormat)}
                >
                  <option value={MatchFormat.SINGLE_SET}>Un set</option>
                  <option value={MatchFormat.BEST_OF_3}>Tre set</option>
                </select>
              </div>

              {/* Set Dinamici */}
              <div className="space-y-3">
                <MatchForm  
                  team1={team1Name} 
                  team2={team2Name} 
                  setInputsState={[setsInput, setSetsInput]}
                  isRemovable={false}
                />
              </div>

              <div className="flex justify-center pt-2">
                <Button onClick={handleAddMatchPropose} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {isDeclined ? "Invia Nuova Proposta" : "Invia Proposta Risultato"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // --- RENDER: MATCH ESISTENTE (PENDING / ACCEPTED) ---
  return (
    <Card className="w-full max-w-xl mx-auto p-2 gap-1">
      <CardHeader className="px-2 pb-2">
        <div className="ml-auto mb-2">
          <MatchProposeBadge status={match.status}/>
        </div>
        
        <CardTitle className="text-base font-medium flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> Dettagli Partita
        </CardTitle>
        
      </CardHeader>
      <CardContent className="px-2 space-y-4">

        {/* Nomi delle Squadre */}
        <div className="flex justify-center gap-4 items-center p-3 rounded-md text-sm font-semibold">
          <span className="text-primary">{match.team1Name || "Team 1"}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">vs</span>
          <span className="text-primary">{match.team2Name || "Team 2"}</span>
        </div>

        {/* Visualizzazione Set */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Punteggio Set</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {match.sets?.map((set, idx) => (
              <div key={idx} className="p-3 border rounded-md text-center bg-background">
                <span className="text-xs text-muted-foreground block mb-1">Set {set.setNumber}</span>
                <span className="text-lg font-bold">
                  {set.team1Games} - {set.team2Games}
                </span>
                {set.tieBreak && <span className="text-[10px] text-primary block">Tie-break</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Azioni in base a status e liste */}
        <div className="pt-4 border-t flex flex-wrap items-center justify-end gap-3">
          {match.status === MatchPropose.PENDING && (isProponent || isStaff) && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteMatch}
            >
                <Trash2 className="w-4 h-4 mr-2" /> Elimina Proposta
            </Button>
          )}

          {match.status === MatchPropose.PENDING && (isPendingPlayer || isStaff) && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="destructive"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleAcceptMatch(false)}
              >
                <XCircle className="w-4 h-4 mr-2" /> Rifiuta
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAcceptMatch(true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Conferma
              </Button>
            </div>
          )}

          {(match.status !== MatchPropose.PENDING || (!isProponent && !isPendingPlayer && !isStaff)) && (
            <p className="text-xs text-muted-foreground italic w-full text-center">
              {match.status === MatchPropose.ACCEPTED
                ? `Risultato confermato (Vincitore: ${match.winnerTeamNumber === 1 ? team1Name: team2Name}).`
                : "Nessuna azione disponibile per il tuo profilo."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}