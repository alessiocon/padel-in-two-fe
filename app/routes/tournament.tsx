import type { Route } from "./+types/tournament";
import { useContext, useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { AuthContext, PopUpContext } from "../store/context";
import { apiClient } from "../client/apiClient";
import type { TournamentResDto } from "../client/model/response/tournament.res.dto";
import { dateHelper } from "../helper/dateHelper";

import { 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  User, 
  ChevronDown,
  FileText,
  Info
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { TournamentSchedule } from "../component/TournamentSchedule";

export function meta({ data }: Route.MetaArgs) {
  const tournament = data as TournamentResDto | undefined;
  return [
    { title: tournament ? `${tournament.title} - Dettaglio Torneo` : "Dettaglio Torneo - Padel" },
    { name: "description", content: tournament?.description || "Dettagli del torneo di Padel" },
  ];
}

// export const mockTournamentDetail: TournamentResDto = {
//   id: "tourn-test-123",
//   title: "Torneo Padel Autunnale - Open Maschile",
//   description: "Torneo amatoriale di padel a gironi ed eliminazione diretta. È richiesta la massima puntualità. Al termine dell'evento ci sarà un rinfresco per tutti i partecipanti offerto dal circolo.",
//   position: "Via Roma 45, Circolo Padel Club",
//   municipality: "Milano",
//   province: "MI",
//   timezone: "Europe/Rome",
//   isClosed: false,
//   showTeams: true,
//   endsAt: new Date(),
//   startsAt: new Date(),
//   isVisible: true,
//   maxTeams: 8,
//   award: "Buono acquisto 200€ + Coppa",
//   teams: [
//     {
//       id: "team-1",
//       tournamentId: "tourn-test-123",
//       teamName: "Padel Kings",
//       player1Id: "usr-p1-1",
//       player2Id: "usr-p2-1",
//       player2FName: null,
//       player2LName: null,
//       player2Phone: null,
//       player1: {
//         firstName: "Mario",
//         lastName: "Rossi",
//         phone: "+393331234567",
//         username: "mario.rossi"
//       },
//       player2: {
//         firstName: "Luca",
//         lastName: "Bianchi",
//         phone: "+393339876543",
//         username: "luca.bianchi"
//       }
//     },
//     {
//       id: "team-2",
//       tournamentId: "tourn-test-123",
//       teamName: "Smash Bros",
//       player1Id: "usr-p1-2",
//       player2Id: null,
//       player2FName: "Giovanni",
//       player2LName: "Neri",
//       player2Phone:"+399658745852",
//       player1: {
//         firstName: "Alessio",
//         lastName: "Verdi",
//         phone: "+393341122334",
//         username: "alessio"
//       },
//       player2: null
//     },
//     {
//       id: "team-3",
//       tournamentId: "tourn-test-123",
//       teamName: "Los Matadores",
//       player1Id: "usr-p1-3",
//       player2Id: "usr-p2-3",
//       player2FName: null,
//       player2LName: null,
//       player2Phone:null,
//       player1: {
//         firstName: "Marco",
//         lastName: "Gialli",
//         phone: "+393355566778",
//         username: "marcog"
//       },
//       player2: {
//         firstName: "Davide",
//         lastName: "Blu",
//         phone: "+393355566778",
//         username: "davide.blu"
//       }
//     },
//     {
//       id: "team-4",
//       tournamentId: "tourn-test-123",
//       teamName: "The Wall",
//       player1Id: "usr-p1-4",
//       player2Id: null,
//       player2FName: "Francesco",
//       player2LName: "Rossi",
//       player2Phone: "+393355566778",
//       player1: {
//         firstName: "Simone",
//         lastName: "Neri",
//         phone: null,
//         username: "simonen"
//       },
//       player2: null
//     }
//   ],
//   matches: []
// };

export async function loader({ params }: LoaderFunctionArgs) {
  if (params.id === undefined) {
    throw new Error("Torneo non specificato");
  }

  const response = await apiClient.getTournament(params.id);

  if (!response.IsSuccess) {
    throw new Error("Impossibile recuperare i dettagli del torneo");
  }
  return response.Data;
  // return mockTournamentDetail
}

export default function TournamentDetailPage() {
  const tournament = useLoaderData<TournamentResDto>();
  const [, setPopup] = useContext(PopUpContext);

  // Stato PopUp Giocatore
  const [selectedPlayer, setSelectedPlayer] = useState<{
    username?: string;
    fullName: string;
    isExternal: boolean;
  } | null>(null);

  const [isOpenDesc, setIsOpenDesc] = useState<boolean>(false);
  const [isOpenTeams, setIsOpenTeams] = useState<boolean>(true);

  // Formattazione Date e Ore
  const startsISO = typeof tournament.startsAt === 'string' ? tournament.startsAt : tournament.startsAt.toISOString();
  const endsISO = typeof tournament.endsAt === 'string' ? tournament.endsAt : tournament.endsAt.toISOString();

  const startAtTz = dateHelper.GetTimeZone(startsISO, tournament.timezone);
  const endAtTz = dateHelper.GetTimeZone(endsISO, tournament.timezone);
  const startDateFormatted = dateHelper.formatDate(startsISO);
  const startTime = dateHelper.formatTime(startAtTz.toString());
  const endTime = dateHelper.formatTime(endAtTz.toString());

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
      <div className="flex flex-col gap-3 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {tournament.title}
          </h1>
          <Badge 
            variant="outline" 
            className={`capitalize font-medium ${
              tournament.isClosed 
                ? "bg-muted text-muted-foreground border-border" 
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {tournament.isClosed ? (
              <span className="flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Chiuso
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Iscrizioni Aperte
              </span>
            )}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            {tournament.position}, {tournament.municipality} ({tournament.province})
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            {startTime} - {endTime}
          </span>
        </div>
      </div>

      {/* Bar delle Info Fisse (Premio, Data, Squadre) */}
      <div className="grid grid-cols-3 gap-2 bg-muted/40 border border-border/30 rounded-lg p-3 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 border-r border-border/30 pr-2">
          <Award className="h-4 w-4 text-primary shrink-0" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Premio</p>
            <p className="text-xs md:text-sm font-semibold">{tournament.award || "N.D."}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 border-r border-border/30 px-2">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Data Evento</p>
            <p className="text-xs md:text-sm font-semibold">{startDateFormatted}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 pl-2">
          <Users className="h-4 w-4 text-primary shrink-0" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Squadre</p>
            <p className="text-xs md:text-sm font-semibold">{tournament.teams.length} / {tournament.maxTeams}</p>
          </div>
        </div>
      </div>

      {/* Descrizione del Torneo a tendina (Collapsible) */}
      {tournament.description && (
        <Collapsible open={isOpenDesc} onOpenChange={setIsOpenDesc} className="border border-border/30 rounded-lg bg-card overflow-hidden shadow-none">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors text-left cursor-pointer">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>Informazioni e Descrizione Torneo</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpenDesc ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4 pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pt-2 border-t border-border/20">
              {tournament.description}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Tabella Partecipanti a tendina (Collapsible) */}
      {tournament.showTeams && (
        <Collapsible open={isOpenTeams} onOpenChange={setIsOpenTeams} className="border border-border/30 rounded-lg bg-card overflow-hidden shadow-none">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors text-left cursor-pointer">
            <div className="flex items-center gap-2 font-semibold text-base text-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>Partecipanti</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpenTeams ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="p-0 border-t border-border/20">
            {tournament.teams.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Ancora nessuna squadra iscritta.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[40px] text-center py-3">#</TableHead>
                    <TableHead className="py-3">Squadra</TableHead>
                    <TableHead className="py-3">Giocatore 1</TableHead>
                    <TableHead className="py-3">Giocatore 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournament.teams.map((team, index) => {
                    const p1Username = team.player1?.username || "Giocatore 1";
                    const p1FullName = team.player1 
                      ? `${team.player1.firstName} ${team.player1.lastName}` 
                      : "";

                    const isP2Registered = !!team.player2;
                    const isP2External = !team.player2 && !!(team.player2FName || team.player2LName);
                    
                    let p2Display = "In attesa...";
                    let p2FullName = "";

                    if (team.player2) {
                      p2Display = team.player2.username;
                      p2FullName = `${team.player2.firstName} ${team.player2.lastName}`;
                    } else if (isP2External) {
                      p2FullName = `${team.player2FName || ''} ${team.player2LName || ''}`.trim();
                      p2Display = p2FullName;
                    }

                    return (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium text-center text-muted-foreground text-xs py-3.5">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground text-sm py-3.5">
                          {team.teamName}
                        </TableCell>

                        {/* Giocatore 1 */}
                        <TableCell className="py-3.5">
                          {team.player1 ? (
                            <button
                              onClick={() => setSelectedPlayer({
                                username: team.player1!.username,
                                fullName: p1FullName,
                                isExternal: false
                              })}
                              className="group flex items-center gap-1.5 text-sm font-medium hover:underline text-left cursor-pointer text-foreground"
                            >
                              <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>{p1Username}</span>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 ml-0.5" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <User className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                              <span>{p1Username}</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Giocatore 2 */}
                        <TableCell className="py-3.5">
                          {isP2Registered ? (
                            <button
                              onClick={() => setSelectedPlayer({
                                username: team.player2!.username,
                                fullName: p2FullName,
                                isExternal: false
                              })}
                              className="group flex items-center gap-1.5 text-sm font-medium hover:underline text-left cursor-pointer text-foreground"
                            >
                              <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>{p2Display}</span>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 ml-0.5" />
                            </button>
                          ) : isP2External ? (
                            <button
                              onClick={() => setSelectedPlayer({
                                fullName: p2FullName,
                                isExternal: true
                              })}
                              className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline text-left cursor-pointer"
                            >
                              <User className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                              <span>{p2Display}</span>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 ml-0.5" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <User className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                              <span>In attesa...</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      <TournamentSchedule tournamentId={tournament.id} matches={tournament.matches} />

      {/* PopUp (Dialog) Dettagli Giocatore */}
      <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlayer?.isExternal ? (
                <User className="h-5 w-5 text-muted-foreground" />
              ) : (
                <UserCheck className="h-5 w-5 text-emerald-500" />
              )}
              Profilo Giocatore
            </DialogTitle>
            <DialogDescription>
              {selectedPlayer?.isExternal 
                ? "Giocatore non registrato sulla piattaforma" 
                : "Giocatore registrato sulla piattaforma"}
            </DialogDescription>
          </DialogHeader>
          {selectedPlayer && (
            <div className="flex flex-col gap-4 py-2">
              {/* Se registrato mostra Username */}
              {!selectedPlayer.isExternal && selectedPlayer.username && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Username</span>
                  <span className="text-base font-semibold text-primary">
                    {selectedPlayer.username}
                  </span>
                </div>
              )}

              {/* Nome e Cognome */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Nome e Cognome</span>
                <span className="text-sm font-medium text-foreground">{selectedPlayer.fullName}</span>
              </div>

              {/* Stato Giocatore se Esterno */}
              {selectedPlayer.isExternal && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Stato</span>
                  <span className="text-sm font-medium text-muted-foreground">Giocatore Esterno</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}