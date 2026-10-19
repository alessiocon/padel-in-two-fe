import { useState } from "react";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background border border-border/40 rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Aggiungi Giocatore Ospite</h3>
                        <p className="text-xs text-muted-foreground">L'utente non è registrato sulla piattaforma</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label>
                        <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Es. Mario"
                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Cognome *</label>
                        <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Es. Rossi"
                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefono *</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Es. +39 333 1234567"
                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Annulla
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto">
                            Conferma Ospite
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}