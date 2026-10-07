interface PointMatchProps {
  team1Games: number | string;
  team2Games: number | string;
}

export const PointMatch: React.FC<PointMatchProps> = ({ team1Games, team2Games }) => {
  return (
    <div className="flex flex-col items-center py-0.5 px-1.5 rounded border border-muted-foreground/30 min-w-[24px] shrink-0">
      <span className="text-[11px] font-mono font-semibold text-foreground">
        {team1Games}
      </span>
      <span className="text-[8px] text-foreground/50 font-mono leading-none my-0.5">-</span>
      <span className="text-[11px] font-mono font-semibold text-foreground">
        {team2Games}
      </span>
    </div>
  );
};