import type { Route } from "./+types/tournament";
import { useEffect, useState } from "react";
import { Link} from "react-router";

import type { TournamentResDto } from "../client/model/response/tournament.res.dto";

import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

import TournamentBracket from "../components/tournament/bracket/tournament.bracket";
import type { TournamentMatchResDto } from "../client/model/response/tournament.match.res.dto";
import { useParams } from "react-router";
import TournamentTeam from "../components/tournament/team/tournament.teams";
import TournamentInfo from "../components/tournament/tournament.info";
import { RecordHelper } from "../helper/recordConverter";
import { apiClient } from "../client/apiClient";

export function meta({ data }: Route.MetaArgs) {
  const tournament = data as TournamentResDto | undefined;
  return [
    { title: tournament ? `${tournament.title} - Dettaglio Torneo` : "Dettaglio Torneo - Padel" },
    { name: "description", content: tournament?.description || "Dettagli del torneo di Padel" },
  ];
}



export default function TournamentDetailPage() {
  const { id : tournamentId } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<TournamentResDto | null >(null)
  const [matches, setMatches] = useState<Record<string, TournamentMatchResDto> | null>(null)

  useEffect(() => {
    if (!tournamentId) return;
    apiClient.getTournament(tournamentId)
      .then(res => setTournament(res.Data ?? null))
      .catch(err => console.error("Errore dati torneo", err));

    apiClient.getMatches(tournamentId)
      .then(res => {
        if (res.IsSuccess && res.Data) {
          const recordMatches = RecordHelper.fromArrayByProperty(res.Data, "id")
          setMatches(recordMatches);
        }
      })
      .catch(err => console.error("Errore match", err));
  }, []);


  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-6 md:py-8 flex flex-col gap-6">
      {/* Tasto Back */}
      <div>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground p-0 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Torna alla home
          </Button>
        </Link>
      </div>

      {/* Header Torneo */}
      
      <TournamentInfo tournament={tournament}/>

      <TournamentTeam teams={tournament?.teams ?? null} />

      <TournamentBracket matches={matches} setMatches={setMatches} tournamentId={tournament?.id ?? null}/>
    </div>
  );
}