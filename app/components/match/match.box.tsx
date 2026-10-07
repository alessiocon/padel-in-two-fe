import type { RefObject } from "react";
import type { TournamentMatchResDto } from "../../client/model/response/tournament.match.res.dto";
import { PointMatch } from "./point.match";
import { TeamMatch } from "./team.match";

interface MatchBoxProps {
  match: TournamentMatchResDto;
  matchRef: RefObject<HTMLDivElement | null>;
}

export const MatchBox: React.FC<MatchBoxProps> = ({ match, matchRef }) => {
  const isTeam1Winner = match.winnerTeamId !== null && match.winnerTeamId === match.team1Id;
  const isTeam2Winner = match.winnerTeamId !== null && match.winnerTeamId === match.team2Id;

  const isTeam1Loser = isTeam2Winner;
  const isTeam2Loser = isTeam1Winner;

  const scores = match.sets || [];

  return (
    <div 
      ref={matchRef}
      className="w-60  bg-muted bg-text text-card-foreground border border-border rounded-lg shadow-lg overflow-hidden relative 
      z-10 transition-all duration-300 hover:border-primary/50 my-auto flex flex-col justify-center items-center py-1.5 px-2.5 gap-1 text-center"
    >
      {/* Squadra 1 */}
      <TeamMatch name={match.team1Name} isWinner={isTeam1Winner} isLoser={isTeam1Loser} borderPosition="bottom" />

      {/* Risultati dei Set */}
      <div className="flex items-center justify-center gap-1 w-full max-w-full overflow-x-auto py-1 px-1 scrollbar-none">
        {scores.length > 0 ? (
          scores.map((set) => (
            <PointMatch 
                team1Games={set.team1Games} 
                team2Games={set.team2Games} 
            />
          ))
        ) : (
          <PointMatch team1Games="-" team2Games="-" />
        )}
      </div>

      {/* Squadra 2 */}
      <TeamMatch name={match.team2Name} isWinner={isTeam2Winner} isLoser={isTeam2Loser} borderPosition="top" />
    </div>
  );
};