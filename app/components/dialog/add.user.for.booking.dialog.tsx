import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Check, Search, Users, X } from "lucide-react";
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-2 py-7 gap-3">
                <DialogHeader className="mb-6 block mb-2">
                    <Users className="w-6 h-6 inline mr-2 mb-1" />
                    <p className="text-lg font-semibold inline">Seleziona Utente</p>
                </DialogHeader>

                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cerca per nome utente"
                            className="w-full pl-9 pr-3 py-2  border border-foreground bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="max-h-70 overflow-y-auto space-y-2">
                        {isLoading ? (
                            <p className="text-center text-xs text-muted-foreground py-4">Ricerca in corso...</p>
                        ) : users.length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-4">Nessun utente trovato</p>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 border border-foreground bg-card p-2">
                                    <div>
                                        <p className="text-sm font-medium">{user.username}</p>
                                        {user.firstName && <p className="text-xs text-muted-foreground">{user.firstName}{user.lastName ?  " "+user.lastName : ""}</p>}
                                    </div>
                                    <Button
                                        type="button"
                                        size="xs"
                                        variant="default"
                                        className="ml-auto shrink-0"
                                        aria-label={`Seleziona ${user.username}`}
                                        title="Seleziona utente"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onSelectUser(user);
                                        }}
                                    >
                                        <Check /> invita
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}