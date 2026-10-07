import type { Route } from "./+types/adminTournamentManagement";
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLoaderData } from 'react-router';
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { TournamentResDto } from "../client/model/response/tournament.res.dto";
import { apiClient } from "./../client/apiClient";
import type { TournamentMatchResDto } from "../client/model/response/tournament.match.res.dto";
import TournamentBracket from "../components/tournament/bracket/tournament.bracket";
import { RecordHelper } from "../helper/recordConverter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin gestione evento" },
    { name: "description", content: "gestione evento by admin" },
  ];
}


export default function AdminTournamentManagementPage() {
  const [tournament, setTournament] = useState<TournamentResDto | null>(null);
  const [matches, setMatches] = useState<Record<string, TournamentMatchResDto> | null>(null)
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 relative">

      {/* Header Pannello Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="gap-1 font-semibold uppercase tracking-wider text-[10px]">
              <ShieldAlert className="h-3 w-3" /> Area Riservata Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestione Operativa: {tournament?.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Organizza i match in ordine di round, assegna le squadre e i campi, inserisci i set e finalizza i turni.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start md:self-auto px-3 py-1.5 rounded-md border border-border/40 bg-card cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Torna Indietro
        </button>
      </div>

      {/* Messaggi di feedback */}
      {successMsg && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sezione Lista Partite ordinate */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Elenco Match (Ordinati per Round e Ordine)
        </h2>

        <TournamentBracket
            matches={matches}
            setMatches={setMatches}
            tournamentId={tournamentId ?? null}
            editMode={{ teams: tournament?.teams ?? null}}
        />
      </div>
    </div>
  );
}