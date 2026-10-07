import { CircleX, Crown } from "lucide-react";

interface TeamMatchProps {
  name: string | null;
  isWinner: boolean;
  isLoser: boolean;
  borderPosition: 'bottom' | 'top';
}

export const TeamMatch: React.FC<TeamMatchProps> = ({ name, isWinner, isLoser, borderPosition }) => {
  const getTeamStyle = () => {
    if (isWinner) return 'text-primary';
    if (isLoser) return 'text-muted-foreground opacity-70';
    return 'text-foreground';
  };

  const borderClass = borderPosition === 'bottom' 
    ? 'pb-1.5 border-b border-foreground/15'
    : 'pt-1.5 border-t border-foreground/15';

  return (
    <div className={`flex items-center justify-center gap-1.5 w-full truncate font-bold ${borderClass} ${getTeamStyle()}`}>
      {isWinner && <Crown className="text-primary shrink-0" size={12} />}
      {isLoser && <CircleX className="text-muted-foreground shrink-0" size={12} />}
      <span className="truncate text-sm">{name || "_ _ _ _"}</span>
    </div>
  );
};