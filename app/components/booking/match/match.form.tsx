import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { BookingMatchResDto } from "../../../client/model/response/booking.match.res.dto";
import { Button } from "../../ui/button";
import type { BookingSetScoreProps } from "../../../client/model/response/booking.match.score.res.dto";
import { Input } from "../../ui/input";

interface MatchFormProps {
    isRemovable: boolean,
    team1?: string,
    team2?: string,
    setInputsState: [BookingSetScoreProps[] ,React.Dispatch<React.SetStateAction<BookingSetScoreProps[]>>]
}

export function MatchForm({
    setInputsState,
    team1,
    team2,
    isRemovable
}: MatchFormProps) {


    // Form states per la creazione della proposta
    const [setsInput, setSetsInput] = setInputsState

    const handleRemoveSetRow = (index: number) => {
        setSetsInput(prev => prev.filter((_, i) => i !== index));
    };

    const handleSetGameChange = (index: number, teamField: 'team1Games' | 'team2Games', value: string) => {
        const val = parseInt(value, 10);
        setSetsInput(prev => {
        const updated = [...prev];
        updated[index][teamField] = isNaN(val) ? 0 : val;
        return updated;
        });
    };

    const handleSetTieBreakChange = (index: number, value: boolean) => {
        setSetsInput(prev => {
            const updated = [...prev];
            updated[index].tieBreak = value;
            return updated;
        });
    };


    return <>
        {setsInput.map((setObj, index) => (
            <form key={index} className="flex flex-col gap-2.5 p-3.5 rounded-lg border border-border/40 bg-background/50">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Set #{index + 1}</span>
                    {isRemovable && 
                        <Button
                            onClick={() => handleRemoveSetRow(index)}
                            className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Rimuovi set"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    }
                    
                </div>

                <div className="flex items-center gap-3 justify-between">
                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[140px]" 
                            title={team1 ?? "Squadra non selezionata"}
                        >
                        {team1  ?? "Squadra non selezionata"}
                        </span>
                        <Input type="text" inputMode="numeric" minLength={0}  maxLength={2} pattern="[0-9]*" value={setObj.team1Games || ""} 
                            onChange={(e) => handleSetGameChange(index, 'team1Games', e.target.value)}
                        className="w-full rounded border border-border px-2 py-1 text-center text-xs bg-background mt-0.5"
                        />
                    </div>

                    <span className="text-muted-foreground font-bold pt-4">-</span>

                    <div className="flex flex-col items-start flex-1">
                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[140px]" 
                        title={team2  ?? "Squadra non selezionata"}
                    >
                        {team2 ?? "Squadra non selezionata"}
                        </span>
                        <Input type="text" inputMode="numeric" minLength={0} maxLength={2} pattern="[0-9]*" value={setObj.team2Games || ""} 
                            onChange={(e) => handleSetGameChange(index, 'team2Games', e.target.value)}
                        className="w-full rounded border border-border px-2 py-1 text-center text-xs bg-background mt-0.5"
                        />
                    </div>
                </div>

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
    </>
}