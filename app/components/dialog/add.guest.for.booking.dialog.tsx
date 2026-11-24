import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus, X } from "lucide-react";
import type { CreateBookingPlayerDto } from "../../client/model/request/create.booking.player.dto";

export interface IAddGuestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddGuest: (player: CreateBookingPlayerDto) => void;
}

export function AddGuestForBookingDialog({ isOpen, onClose, onAddGuest }: IAddGuestDialogProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) return;

        onAddGuest({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim() || undefined,
        });

        // Reset & Close
        setFirstName("");
        setLastName("");
        setPhone("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-2 py-7 gap-3">

                <DialogHeader className="block">
                        <UserPlus className="w-6 h-6 inline mr-2 mb-1.5" />
                        <p className="text-lg font-semibold inline">Aggiungi Ospite</p>
                        <p className="text-xs text-muted-foreground mt-1">L'utente non è registrato sulla piattaforma</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="font-medium text-muted-foreground mb-1 block">Nome *</label>
                        <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Es. Mario"
                            className="w-full px-3 py-2 border border-foreground bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-medium text-muted-foreground mb-1 block">Cognome *</label>
                        <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Es. Rossi"
                            className="w-full px-3 py-2 border border-foreground bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="font-medium text-muted-foreground mb-1 block">Telefono *</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Es. +39 333 1234567"
                            className="w-full px-3 py-2 border border-foreground bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose} 
                            className="bg-card">
                            Annulla
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto">
                            Conferma Ospite
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}