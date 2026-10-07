import { useState } from "react";
import type { TournamentTeamResDto } from "./../../client/model/response/tournamentTeam.res.dto";
import { Info, User, UserCheck} from "lucide-react";
import { TableCell, TableRow } from "./../ui/table";
import TournamentTeamsRowMessage, { type ISelectedPlayerDialog } from "../../component/popup/message/tournament.teams..row.message";


interface ITournamentTeamProps {
    team: TournamentTeamResDto, 
    position: number,
}

export default function TournamentTeamsRow({team, position}: ITournamentTeamProps) {
    const [teamInfoDialog, setTeamInfoDialog] = useState<ISelectedPlayerDialog | null>(null);
    const [open, setOpen] = useState<boolean>(false);
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

    return (<>
        <TableRow key={team.id}>
            <TableCell className="font-medium text-center text-muted-foreground text-xs py-3.5">
                {position}
            </TableCell>
            <TableCell className="font-semibold text-foreground text-sm py-3.5">
                {team.teamName}
            </TableCell>

            {/* Giocatore 1 */}
            <TableCell className="py-3.5">
            {team.player1 ? (
                <button
                    onClick={() => {
                        setTeamInfoDialog({
                            fullName: p1FullName,
                            username: team.player1!.username,
                            isExternal: false}), setOpen(true)}}
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
                    onClick={() =>  {setTeamInfoDialog({
                        fullName:team.player2!.username,
                        username: p2FullName,
                        isExternal: false
                    }), setOpen(true)}}
                    className="group flex items-center gap-1.5 text-sm font-medium hover:underline text-left cursor-pointer text-foreground"
                >
                    <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{p2Display}</span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 ml-0.5" />
                </button>
            ) : isP2External ? (
                <button onClick={() => 
                    {setTeamInfoDialog({
                        fullName:team.player2!.username,
                        isExternal: true
                    }), setOpen(true)}}
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
        {open && teamInfoDialog && 
            <TournamentTeamsRowMessage 
                fullName={teamInfoDialog.fullName}
                username={teamInfoDialog.username}
                isExternal={teamInfoDialog.isExternal}
                openReact={[open, setOpen]}
                />
        }
      </>
    );

}   