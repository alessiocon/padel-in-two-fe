import { User, UserCheck} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./../../../components/ui/dialog";


export interface ISelectedPlayerDialog{
    username?: string; 
    fullName: string; 
    isExternal: boolean
}

export default function TournamentTeamsRowMessage(input : ISelectedPlayerDialog 
    & {  openReact: [boolean, React.Dispatch<React.SetStateAction<boolean>>];}) {
    const [open, setOpen] = input.openReact;
    const {isExternal, username, fullName } = input;

    return <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                {isExternal ? (
                    <User className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <UserCheck className="h-5 w-5 text-emerald-500" />
                )}
                Profilo Giocatore
                </DialogTitle>
                <DialogDescription>
                {isExternal 
                    ? "Giocatore non registrato sulla piattaforma" 
                    : "Giocatore registrato sulla piattaforma"}
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
                {/* Se registrato mostra Username */}
                {!isExternal && username && (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Username</span>
                    <span className="text-base font-semibold text-primary">
                    {username}
                    </span>
                </div>
                )}
                {/* Nome e Cognome */}
                <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Nome e Cognome</span>
                <span className="text-sm font-medium text-foreground">{fullName}</span>
                </div>
                {/* Stato Giocatore se Esterno */}
                {isExternal && (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Stato</span>
                    <span className="text-sm font-medium text-muted-foreground">Giocatore Esterno</span>
                </div>
                )}
            </div>
        </DialogContent>
        
    </Dialog>
}   