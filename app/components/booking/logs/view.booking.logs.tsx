import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import type { BookingLogResDto } from "../../../client/model/response/booking.log.res.dto";
import { dateHelper } from "../../../helper/dateHelper";

interface ViewBookingLogsProps {
    logs: BookingLogResDto[];
}

export function ViewBookingLogs({ logs }: ViewBookingLogsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border/40 bg-muted/20">
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    Visualizza Log Attività &amp; Cronologia ({logs.length})
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="p-3 border-t border-border/40 bg-background/50 space-y-2 text-xs font-mono text-muted-foreground">
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div key={`${log.createdAt}-${index}`} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                                <span>{log.message || "Evento di sistema"}</span>
                                <span className="text-[10px]">{log.createdAt ? dateHelper.formatDate(log.createdAt) : ""}</span>
                            </div>
                        ))
                    ) : (
                        <p className="italic text-center py-1">Nessun log disponibile per questa prenotazione.</p>
                    )}
                </div>
            )}
        </div>
    );
}