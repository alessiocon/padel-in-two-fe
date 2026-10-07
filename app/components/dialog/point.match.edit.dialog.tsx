import { CheckCircle, Loader2, Plus, Trash2, User, UserCheck} from "lucide-react";
import { Button } from "@base-ui/react";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import { useState } from "react";
import type { TournamentMatchResDto } from "../../client/model/response/tournament.match.res.dto";
import { apiClient } from "../../client/apiClient";
import { Input } from "../ui/input";




interface IPointMatchEditDialogProps{
    match: TournamentMatchResDto;
    setMatches: React.Dispatch<React.SetStateAction<Record<string, TournamentMatchResDto> | null>>
    openReact: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export default function PointMatchEditDialog({match , setMatches, openReact} : IPointMatchEditDialogProps) {
    const [tempSets, setTempSets] = useState<{ team1Games: number | string; team2Games: number | string; tieBreak: boolean }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = openReact;

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

      const handleSaveSets = async () => {
        try {
          setLoading(true);
  
          const sets = tempSets.map((s, idx) => ({
              setNumber: idx + 1,
              team1Games: s.team1Games === "" || s.team1Games === "-" ? 0 : Number(s.team1Games),
              team2Games: s.team2Games === "" || s.team2Games === "-" ? 0 : Number(s.team2Games),
              tieBreak: Boolean(s.tieBreak),
          }));

          const endMatchPayload ={sets};
          const res = await apiClient.assignPointsMatch(match.tournamentId, match.id, endMatchPayload);
          if (res && !res.IsSuccess) {
              throw new Error(res.Error?.message || "Errore durante il salvataggio dei set.");
          }
          
          setMatches((prev) => {
            if (!prev) return null;
            return { ...prev, 
                [match.id]: res.Data as TournamentMatchResDto
            };
          })

        } catch (err: any) {
          alert(err.message || "Errore durante il salvataggio dei set.");
        } finally {
          setLoading(false);
          setOpen(false)
        }
      };


    return <Dialog  open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <h3>Inserimento Set e Conclusione Match</h3>
        </DialogHeader>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <p className="text-xs font-medium text-muted-foreground block" id="">Punteggio Set</p>
            {tempSets.map((setObj, index) => (
              <form key={index} className="flex flex-col gap-2.5 p-3.5 rounded-lg border border-border/40 bg-background/50">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Set #{index + 1}</span>
                    <Button
                        onClick={() => handleRemoveSetRow(index)}
                        className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Rimuovi set"
                        >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-3 justify-between">
                  {/* Campo Team 1 con nome reale */}
                  <div className="flex flex-col items-start flex-1">
                      <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[140px]" 
                          title={match.team1Name ?? "Squadra non selezionata"}
                      >
                      {match.team1Name ?? "Squadra non selezionata"}
                    </span>
                    <Input type="text" inputMode="numeric" minLength={0}  maxLength={2} pattern="[0-9]*" value={setObj.team1Games || ""} 
                      onChange={(e) => handleSetGameChange(index, 'team1Games', e.target.value)}
                      className="w-full rounded border border-border px-2 py-1 text-center text-xs bg-background mt-0.5"
                    />
                  </div>

                  <span className="text-muted-foreground font-bold pt-4">-</span>

                  {/* Campo Team 2 con nome reale */}
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[140px]" 
                      title={match.team2Name ?? "Squadra non selezionata"}
                  >
                      {match.team2Name ?? "Squadra non selezionata"}
                    </span>
                    <Input type="text" inputMode="numeric" minLength={0} maxLength={2} pattern="[0-9]*" value={setObj.team2Games || ""} 
                      onChange={(e) => handleSetGameChange(index, 'team2Games', e.target.value)}
                      className="w-full rounded border border-border px-2 py-1 text-center text-xs bg-background mt-0.5"
                    />
                  </div>
                </div>

                {/* Checkbox Tie-break */}
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id={`tiebreak-${index}`} checked={setObj.tieBreak}
                    onChange={(e) => handleSetTieBreakChange(index, e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <label htmlFor={`tiebreak-${index}`} className="text-[11px] text-muted-foreground cursor-pointer">
                    Tie-break giocato in questo set
                  </label>
                </div>
              </form>
            ))}

            <Button
              onClick={handleAddSetRow}
              className="w-full py-2 border border-dashed border-border rounded-lg text-xs font-medium text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> AGGIUNGI SET
            </Button>
          </div>
          <DialogFooter>
            <Button
                onClick={handleSaveSets}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <CheckCircle className="h-3.5 w-3.5" /> Salva e Chiudi Partita
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
}   