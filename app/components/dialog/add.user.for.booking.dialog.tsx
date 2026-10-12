import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Search, Users, X } from "lucide-react";
import { apiClient } from "../../client/apiClient";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";
import type { UserSearchListReqDto } from "../../client/model/request/user.search.list.dto";
import type { UserSearchListResDto } from "../../client/model/response/user.search.list.res.dto";

export interface ISelectRegisteredUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (player: CreateBookingPlayerDto) => void;
}

// Interfaccia di esempio per gli utenti trovati dalla ricerca
export function AddUserForBookingDialog({ isOpen, onClose, onSelectUser }: ISelectRegisteredUserDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<UserSearchListResDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setUsers([]);
            return;
        }

    const fetchUsers = async () => {
        setIsLoading(true);
        try {

            let input : UserSearchListReqDto = {username: searchQuery};
            const res = await apiClient.searchList(input);


            if(!res.IsSuccess){
                alert(res.Error?.message ?? "Impossibile ricercare gli utenti");
                return;
            }
            setUsers(res.Data || []);
        } catch (error) {
            console.error("Errore ricerca utenti", error);
        } finally {
            setIsLoading(false);
        }
        };

        const timer = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background border border-border/40 rounded-xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Seleziona Utente Registrato</h3>
                        <p className="text-xs text-muted-foreground">Cerca tra gli utenti della piattaforma</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cerca per nome o username..."
                            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 border border-border/30 rounded-md p-2">
                        {isLoading ? (
                            <p className="text-center text-xs text-muted-foreground py-4">Ricerca in corso...</p>
                        ) : users.length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-4">Nessun utente trovato</p>
                        ) : (
                            users.map((user) => (
                                <div key={user.id}
                                    className="flex items-center justify-between p-1 px-3 rounded-lg hover:bg-muted/60 bg-card cursor-pointer transition-colors border border-transparent hover:border-border/40"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSelectUser({ 
                                            userId: user.id, 
                                            username:user.username,
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            phone: user.phone
                                        });
                                    }}
                                >
                                    <div>
                                        <p className="text-sm font-medium">{user.username}</p>
                                        {user.firstName && <p className="text-xs text-muted-foreground">{user.firstName}{user.lastName ?  " "+user.lastName : ""}</p>}
                                    </div>
                                    <Button size="sm" variant="ghost">Seleziona</Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}