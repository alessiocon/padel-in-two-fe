import { Gift, CalendarIcon, Loader2 } from "lucide-react";
import type { ClubResDto } from "../../client/model/response/ClubResDto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { GroupedTimeSlot } from "../GroupedTimeSlot";
import type { ClubCourtDto } from "../../client/model/common/ClubCourtDto";
import SelectCourtDialog, { type CourtWithStatusDto, type ICourtSelectionDialogProps } from "../dialog/select.court.dialog";
import { useState } from "react";
import type { BookingResDto } from "../../client/model/response/BookingsResDto";

export interface ITableBookingClubProps {
    club: ClubResDto | null,
    dateState: [string ,React.Dispatch<React.SetStateAction<string>>]
    slotState: [string | null, React.Dispatch<React.SetStateAction<string | null>>]
    bookingsState: [BookingResDto[] | null,React.Dispatch<React.SetStateAction<BookingResDto[] | null>>],
    isLoadingBooking: boolean,
    setSelectedCourt: React.Dispatch<React.SetStateAction<ClubCourtDto | null>>
}


export function TableBookingClub({
    club, 
    dateState, 
    slotState, 
    bookingsState, 
    isLoadingBooking,
    setSelectedCourt
} :  ITableBookingClubProps) {
    const [selectedDate, setSelectedDate] = dateState;
    const [selectedSlot, setSelectedSlot] = slotState;
    const [bookings, setBookings] = bookingsState;

    const [openSelectCourtDialog, setOpenSelectCourtDialog] = useState(false);
    const [selectCourtDialogProps, setSelectCourtDialogProps] = useState<ICourtSelectionDialogProps | null>(null);

    const todayStr = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    const handleOpenCourtSelection = (slot: string, courts: ClubCourtDto[]) => {
        if(!bookings) return;
        setSelectedCourt(null);

        const courtModels: CourtWithStatusDto[] = courts.map((court) => ({
            ...court,
            isOccupied: false,
        }));

        setSelectCourtDialogProps({
            slotState: [slot, setSelectedSlot],
            selectedDate,
            courts:courtModels,
            bookings: bookings,
            onSelectCourt: (court) => {
            setSelectedCourt(court);
        }})
        setOpenSelectCourtDialog(true);
    };

    if (!club) {
        return <div className="lg:col-span-3 space-y-6">
            <Card className="bg-card border-primary/20 overflow-hidden">
            {/* Skeleton Banner Promo */}
            <div className="p-3.5 bg-primary/10 border-b border-primary/20 flex items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-sm" />
                <Skeleton className="h-4 w-3/4 max-w-md" />
            </div>

            {/* Skeleton Card Header */}
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-11 w-full sm:w-44 rounded-lg" />
            </CardHeader>

            {/* Skeleton Content - Griglia Orari */}
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, index) => (
                    <Skeleton key={`slot-skeleton-${index}`} className="h-12 w-full rounded-md" />
                ))}
                </div>
            </CardContent>
            </Card>
        </div>
    }

    return (<>
        <div className="lg:col-span-3 space-y-6">
            <Card className="bg-card border-primary/20">
                {/* BANNER PROMO PRINCIPALE */}
                <div className="p-3.5  bg-primary/10 border border-primary/30 flex items-center gap-3">
                <div className="p-2 bg-primary text-primary-foreground  shrink-0">
                    <Gift className="h-5 w-5" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Prenotando su <strong className="text-foreground">PadelInTwo</strong>,per ricevere il noleggio delle pale <strong className="text-primary font-semibold">in omaggio</strong> per tutti i partecipanti!
                </p>
                </div>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" /> 
                    Seleziona Data e ora
                    </CardTitle>
                    <CardDescription>
                    Clicca sull'orario desiderato per scegliere il campo
                    </CardDescription>
                </div>

                <div className="relative flex items-center">
                    <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    min={todayStr}
                    max={maxDateStr}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                        setSelectedCourt(null);
                    }}
                    className="w-full sm:w-auto bg-background border-input text-foreground dark:scheme-dark rounded-lg border-2 px-4 py-2.5 text-base font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50 cursor-pointer"
                    />
                </div>
                </CardHeader>

                <CardContent className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                    {!bookings && (
                        <span className="text-xs text-primary flex items-center gap-1.5 font-medium animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Caricamento prenotazioni...
                        </span>
                    )}
                    </div>
                    <GroupedTimeSlot
                        opening={club.openingTime}
                        closing={club.closingTime}
                        durationMinutes={club.slotDurationMinutes}
                        selectedDateStr={selectedDate}
                        selectedSlotStr={selectedSlot}
                        isLoadingBookings={isLoadingBooking && Boolean(bookings === null)}
                        courts={club.courts}
                        onSelect={handleOpenCourtSelection}
                    />
                    </div>
                </CardContent>
            </Card>
        </div>
        {openSelectCourtDialog &&  selectCourtDialogProps && 
        <SelectCourtDialog
            slotState={selectCourtDialogProps.slotState}
            courts={selectCourtDialogProps.courts}
            bookings={selectCourtDialogProps.bookings}
            onSelectCourt={selectCourtDialogProps.onSelectCourt}
            openState={[openSelectCourtDialog, setOpenSelectCourtDialog]}
            selectedDate={selectCourtDialogProps.selectedDate}
        />}
    </>
    );
}