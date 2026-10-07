import { useState, type RefObject } from "react";
import type { TournamentMatchResDto } from "../../client/model/response/tournament.match.res.dto";
import type { TournamentTeamResDto } from "../../client/model/response/tournamentTeam.res.dto";
import { apiClient } from "../../client/apiClient";
import { Button } from "../ui/button";
import { MatchFormat } from "../../client/model/common/Enum/match.format.dto";
import { FieldMatchEdit } from "./field.match.edit";
import { PointMatch } from "./point.match";
import { FastForward, Loader2 } from "lucide-react";
import { MatchStatus } from "../../client/model/common/Enum/matchStatus.dto";
import type { UpdateMatchReqDto } from "../../client/model/request/update.match.req.dto";
import PointMatchEditDialog from "../dialog/point.match.edit.dialog";

interface MatchBoxEditProps {
  match: TournamentMatchResDto;
  matchRef: RefObject<HTMLDivElement | null>;
  teams: TournamentTeamResDto[] | null;
  courts?: { id: string; name: string }[] | null;
  setMatches: React.Dispatch<React.SetStateAction<Record<string, TournamentMatchResDto> | null>>;
}

export const MatchBoxEdit: React.FC<MatchBoxEditProps> = ({ match, matchRef, setMatches,  teams, courts}) => {
  const [showEditPointDialog, setShowEditPointDialog] = useState(false);
  const [changesMatch, setChangesMatch] = useState<Record<keyof TournamentMatchResDto, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const scores = match.sets || [];

  const handleFieldChange = async (field: keyof TournamentMatchResDto, value: any) => {
    if (match[field] === value) {
      if (changesMatch && field in changesMatch) {
        setChangesMatch((prev) => {
          if(prev === null) return null;
          delete prev[field];
          return Object.keys(prev).length === 0 ? null : {...prev};
        });
      }
      return;
    }

    setChangesMatch((prev) => {
      let changes = prev ? { ...prev } : {} as Record<keyof TournamentMatchResDto, any>;
      changes[field] = value;
      return changes;
    });
  }

  async function handleSaveChanges(){
    if (!changesMatch || Object.keys(changesMatch).length === 0) {
      alert("Nessuna modifica da salvare per il match");
      return;
    }; 

    if(changesMatch["team1Id"] === changesMatch["team2Id"] && changesMatch["team1Id"] !== null && changesMatch["team1Id"] !== 'none'){
      alert("Le squadre non possono essere uguali");
      return;
    }
  
    try {
      setLoading(true);
      
      const updatedMatch: TournamentMatchResDto = {
        ...match,
        ...Object.fromEntries(
            Object.entries(changesMatch).map(([key, value]) => [
              key,
              value === "none" ? null : value,
            ])
          ),
      };

      let res = await apiClient.updateMatch(match.tournamentId, match.id, {
        ...updatedMatch, 
        scheduledAt: updatedMatch.scheduledAt ?? undefined
      });

      if(!res.IsSuccess && !res.Data){
        alert("Errore durante il salvataggio delle modifiche: " + res.Error?.message);
        return;
      }else{
        setMatches((prev) => {
          if (!prev) return null;
          return { ...prev, 
            [match.id]: res.Data as TournamentMatchResDto
          };
        })
      }

      
      setChangesMatch(null);

    } catch (error) {
      console.error("Errore durante il salvataggio delle modifiche:", error);
    }finally{
      setLoading(false);
    }
  }

  const handleNextMatch = async () => {
      try {
        setLoading(true);

        const res = await apiClient.nextMatch(match.tournamentId, match.id);
        if (res && !res.IsSuccess) {
          throw new Error(res.Error?.message ?? "Impossibile avanzare lo slot del match.");
        }

        if(res.Data){
          const nextMatch = res.Data;

          setMatches((prev) => {
            if (!prev) return null;
            const updated = { ...prev };
    
            if(nextMatch) {
              updated[nextMatch.id] = nextMatch as TournamentMatchResDto;
            }
            return updated;
          });
        }
        alert("Avanzamento del turno completato con successo.");
      } catch (err: any) {
        alert(err.message || "Errore durante l'avanzamento del turno.");
      } finally {
        setLoading(false);
      }
  };

  const startMatch = async () => {
    try {
        setLoading(true);
        let input: UpdateMatchReqDto = {
          status: MatchStatus.IN_PROGRESS
        }

        const res = await apiClient.updateMatch(match.tournamentId, match.id, input);
        if (res && !res.IsSuccess) {
          throw new Error(res.Error?.message ?? "Impossibile avanzare lo slot del match.");
        }

        setMatches((prev) => {
          if (!prev) return null;
          return { ...prev, 
            [match.id]: res.Data as TournamentMatchResDto
          };
        })
  
      } catch (err: any) {
        alert(err.message || "Errore durante l'avanzamento del turno.");
      } finally {
        setLoading(false);
      }
  }

  const cssChanges = 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 dark:border-amber-500/40';
  const cssBlockInput = 'opacity-50 pointer-events-none border-primary/50'
  const isScheduled = match.status === MatchStatus.SCHEDULED;

  const teamOptions = teams?.map((team) => ({ value: team.id, label: team.teamName,})) || [];
  
  return (
    <div 
      ref={matchRef}
      className={`w-70  bg-muted bg-text  border  rounded-lg shadow-lg overflow-hidden relative 
      hover:border-primary/50 my-auto flex flex-col justify-center  py-2 px-1.5 gap-2 text-center`}
    >
      <div className={`grid grid-cols-2 gap-1 w-full ${!isScheduled ? cssBlockInput : ""}`}>
        <FieldMatchEdit
          label="Formato"
          value={changesMatch?.["format"] || match.format || "none"}
          onChange={(val) => handleFieldChange('format', val)}
          isDisabled={!isScheduled}
          options={[
            { value: MatchFormat.SINGLE_SET, label: "Set Unico" },
            { value: MatchFormat.BEST_OF_3, label: "Al meglio di 3" }
          ]}
          placeholder="-- Seleziona Formato --"
          isModified={Boolean(changesMatch?.["format"])}
          modifiedClassName={cssChanges}
        />
       
        <FieldMatchEdit
            label="Campo"
            value={changesMatch?.["courtId"] || match.courtId || "none"}
            onChange={(val) => handleFieldChange('courtId', val)}
            isDisabled={!isScheduled}
            options={[]}
            placeholder="-- Seleziona Campo --"
            isModified={Boolean(changesMatch?.["courtId"])}
            modifiedClassName={cssChanges}
          />
      </div>
      
      <FieldMatchEdit
        label="Squadra 1"
        value={changesMatch?.["team1Id"] || match.team1Id || "none"}
        onChange={(val) => handleFieldChange('team1Id', val)}
        options={teamOptions}
        isDisabled={!isScheduled}
        placeholder="-- Seleziona Squadra 1 --"
        isModified={Boolean(changesMatch?.["team1Id"])}
        modifiedClassName={cssChanges}
        cssExtra={!isScheduled ? cssBlockInput : ""}
      />

      <div className={`${isScheduled && cssBlockInput} flex items-center justify-center gap-1 w-full max-w-full overflow-x-auto py-1 px-1 scrollbar-none`}
        onClick={() => setShowEditPointDialog(true)}>
        {scores.length > 0 ? (
          scores.map((set, index) => (
            <PointMatch 
                key={"set-"+index} 
                team1Games={set.team1Games} 
                team2Games={set.team2Games} 
            />
          ))
        ) : (
          <PointMatch team1Games="-" team2Games="-" />
        )}
      </div>

      <FieldMatchEdit
        label="Squadra 2"
        value={changesMatch?.["team2Id"] || match.team2Id || "none"}
        onChange={(val) => handleFieldChange('team2Id', val)}
        options={teamOptions}
        isDisabled={!isScheduled}
        placeholder="-- Seleziona Squadra 2 --"
        isModified={Boolean(changesMatch?.["team2Id"])}
        modifiedClassName={cssChanges}
        cssExtra={!isScheduled ? cssBlockInput : ""}
      />

      {changesMatch && (
        <div className="flex gap-1 p-1 border-t border-border/40 w-full">
          {/* Pulsante Annulla (Solo linee) */}
          <Button type="button" variant="outline" className="flex-1" onClick={() => setChangesMatch(null)}>
            Annulla
          </Button>

          {/* Pulsante Salva (Pieno) */}
          <Button type="button" variant="default" className="flex-1" disabled={loading} onClick={handleSaveChanges}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FastForward className="h-3.5 w-3.5" />}
            Salva
          </Button>          
        </div>
      )}
      

      {match.status === MatchStatus.SCHEDULED ? 
          match.team1Name === null || match.team2Name === null ? 
            <p className="py-3 uppercase text  text-xs"> Seleziona le squadre </p>
          :
            <Button type="button" disabled={loading} onClick={startMatch}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FastForward className="h-3.5 w-3.5" />}
              Start Match
            </Button> 
        : <></>
      }

      {match.status === MatchStatus.IN_PROGRESS && 
        <Button type="button" disabled={loading} onClick={(e) => { e.preventDefault(); setShowEditPointDialog(true)}}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FastForward className="h-3.5 w-3.5" />}
          Inserisci Set
        </Button>
      }

      {match.status === MatchStatus.COMPLETED && 
        <Button type="button" disabled={loading} onClick={handleNextMatch}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FastForward className="h-3.5 w-3.5" />}
          Trasferisci Vincitore
        </Button>
      }

      <PointMatchEditDialog 
        openReact={[showEditPointDialog, setShowEditPointDialog]} 
        match={match}  
        setMatches={setMatches}
      />
    </div>


  );
};
