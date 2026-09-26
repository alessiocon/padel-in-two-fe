import { DoorClosed, DoorOpen } from "lucide-react";
import type { FC } from "react";
import type { ClubCourtDto } from "~/client/model/common/ClubCourtDto";
import { Badge } from "~/components/ui/badge";
import type { CourtWithStatusDto } from "~/routes/club";

// Estendiamo il DTO per supportare la proprietà booleana opzionale 'occuped'


export const ButtonCourtSelection: FC<{
  court: CourtWithStatusDto;
  onSelect: (court: ClubCourtDto) => void;
  onClose: () => void;
}> = ({ court, onSelect, onClose }) => {
  
  return (
    <button
      key={court.id}
      disabled={court.isOccupied}
      onClick={() => {
        if (!court.isOccupied) {
          onSelect(court);
          onClose();
        }
      }}
      className={`p-3 sm:p-4 rounded-lg border transition-all flex flex-col justify-between gap-4 text-left w-full overflow-hidden ${
        court.isOccupied
          ? "border-destructive/30 bg-destructive/5 cursor-not-allowed opacity-60 text-muted-foregroun"
          : "border-border bg-background hover:border-primary hover:bg-primary/5 active:scale-[0.98] text-foreground"
      }`}
    >
      {/* Sezione superiore: Icona e Nome */}
      <div className="flex items-center gap-2 min-w-0">
        {court.isIndoor 
          ? <DoorClosed className="h-5 w-5 shrink-0 text-primary"/>
          : <DoorOpen className="h-5 w-5 shrink-0 text-primary"/>
        }
        <span className={"font-bold text-xs sm:text-sm truncate"}>
          {court.name}
        </span>
      </div>

      {/* Sezione inferiore: Prezzo e Badge */}
      <div className="flex flex-col md:flex-row items-center justify-between pt-1.5 border-t border-border text-[11px] md:text-[12px] w-full gap-1">
        <span className="font-extrabold truncate">
          € {court.price?.toFixed(2)}
        </span>

        {court.isOccupied ? (
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 border-destructive/40 bg-destructive/10 text-destructive shrink-0"
          >
            Occupato
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 border-emerald-500/40 bg-emerald-500/10 text-emerald-500 shrink-0"
          >
            Disponibile
          </Badge>
        )}
      </div>
    </button>
  );
};