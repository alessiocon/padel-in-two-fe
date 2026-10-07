import { useState} from "react";
import type { TournamentTeamResDto } from "../../../client/model/response/tournamentTeam.res.dto";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible";
import { ChevronDown, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import TournamentTeamsRow from "../../team/tournament.teams.row";


export default function TournamentTeam({teams}: {teams: TournamentTeamResDto[] | null}) {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    return (<>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-border/30 rounded-lg bg-card overflow-hidden shadow-none">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors text-left cursor-pointer">
                <div className="flex items-center gap-2 font-semibold text-base text-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>Partecipanti</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="p-0 border-t border-border/20">
                
                {teams === null ?   
                    <Table className="min-w-[650px]">
                        <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[60px] text-center py-3">#</TableHead>
                            <TableHead className="w-[200px] py-3">Squadra</TableHead>
                            <TableHead className="w-[200px] py-3">Giocatore 1</TableHead>
                            <TableHead className="w-[200px] py-3">Giocatore 2</TableHead>
                        </TableRow>
                        </TableHeader>

                        <TableBody>
                        {Array.from({ length: 6 }, (_, rowIndex) => (
                            <TableRow key={`row-${rowIndex}`} className="h-[55px]">
                            <TableCell className="text-center py-3">
                                <div className="h-4 w-6 bg-muted rounded mx-auto animate-pulse" />
                            </TableCell>
                            <TableCell className="py-3">
                                <div className="h-4 w-[140px] bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell className="py-3">
                                <div className="h-4 w-[160px] bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell className="py-3">
                                <div className="h-4 w-[160px] bg-muted rounded animate-pulse" />
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>  
                :teams.length === 0 ? (
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
                        {teams.map((team, index) => <TournamentTeamsRow 
                            key={team.id}
                            position={index} 
                            team={team}></TournamentTeamsRow>)}
                    </TableBody>
                </Table>
                )}
            </CollapsibleContent>
            </Collapsible>
    </>
        
      )
}