import { CheckCircle, Loader2, Plus} from "lucide-react";
import { Button } from "@base-ui/react";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import { useState } from "react";
import type { TournamentMatchResDto } from "../../client/model/response/tournament.match.res.dto";
import { apiClient } from "../../client/apiClient";
import type { BookingSetScoreProps } from "../../client/model/response/booking.match.score.res.dto";
import { MatchForm } from "../booking/match/match.form";




interface IPointMatchEditDialogProps{
    match: TournamentMatchResDto;
    setMatches: React.Dispatch<React.SetStateAction<Record<string, TournamentMatchResDto> | null>>
    openReact: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export default function PointMatchEditDialog({match , setMatches, openReact} : IPointMatchEditDialogProps) {
    const [tempSets, setTempSets] = useState<BookingSetScoreProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = openReact;

    const handleAddSetRow = () => {
        setTempSets(prev => [...prev, { setNumber: prev.length + 1 , team1Games: 0, team2Games: 0, tieBreak: false,  }]);
    };


      const handleSaveSets = async () => {
        try {
          setLoading(true);
  
          const sets = tempSets.map((s, idx) => ({
              setNumber: idx + 1,
              team1Games: s.team1Games,
              team2Games: s.team2Games,
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
          <div>
            <Button
                onClick={handleAddSetRow}
                className="w-full py-2 border border-dashed border-border rounded-lg text-xs font-medium text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> AGGIUNGI SET
              </Button>
          </div>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <p className="text-xs font-medium text-muted-foreground block" id="">Punteggio Set</p>
            <MatchForm  
                  team1={match?.team1Name ?? undefined} 
                  team2={match?.team2Name ?? undefined} 
                  setInputsState={[tempSets, setTempSets]}
                  isRemovable={true}
                />

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