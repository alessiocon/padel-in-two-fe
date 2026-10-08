import type { ClubCourtDto } from "../../client/model/common/ClubCourtDto";
import { type ICourtSelectionDialogProps } from "../dialog/select.court.dialog";
import { useContext, useEffect, useRef, useState } from "react";
import type { BookingResDto } from "../../client/model/response/BookingsResDto";
import { apiClient } from "../../client/apiClient";
import { Button } from "../ui/button";
import type { CreateBookingDto } from "../../client/model/request/CreateBookingDto";
import { AuthContext } from "../../store/context";

export interface IInfoBookingClubProps {
    clubId: string,
    selectedDate: string,
    slotState: [string | null, React.Dispatch<React.SetStateAction<string | null>>]
    bookingsState: [BookingResDto[] | null,React.Dispatch<React.SetStateAction<BookingResDto[] | null>>],
    selectedCourtState: [ClubCourtDto | null, React.Dispatch<React.SetStateAction<ClubCourtDto | null>>]
    isLoadingBookingsState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}


export function SendBookingClub({
    clubId, 
    selectedDate, 
    slotState, 
    bookingsState, 
    isLoadingBookingsState,
    selectedCourtState
} :  IInfoBookingClubProps) {
    const [auth, setAuth] = useContext(AuthContext);
    const [selectedSlot, setSelectedSlot] = slotState;
    const [bookings, setBookings] = bookingsState;
    const [isLoadingBookings, setIsLoadingBookings] = isLoadingBookingsState
    const [selectedCourt, setSelectedCourt] = selectedCourtState

    const [selectCourtDialogProps, setSelectCourtDialogProps] = useState<ICourtSelectionDialogProps | null>(null);

    const detailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedCourt && detailsRef.current) {
            detailsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest'
        });
    }
    }, [selectedCourt]);

    async function sendBooking(){
        if (!selectedCourt?.id || !selectedSlot) return;
        if(!auth.auth){
        window.alert("devi accedere per poter prenotare")
        return;
        }
        
        var newBooking : CreateBookingDto = {
        courtId: selectedCourt.id,
        description: "Prenotazione da: "+ auth.username,
        startsAt: new Date(`${selectedDate}T${selectedSlot}`).toISOString(),
        slots: 1 
        }  

        setIsLoadingBookings(true);

        try {
        const res = await apiClient.createBooking(clubId, newBooking);

        if (!res.Data) {
            if(res.Error){ 
            window.alert(res.Error?.message);
            }else{
            throw new Error("errore")
            }
            return;
        }
        const createdBooking = res.Data;

        setBookings((prev) => [...(prev ?? []), createdBooking]);
        window.alert("Campo prenotato correttamente!");

        } catch (error) {
        throw new Error("si è verificato un errore, riprova più tardi")
        } finally {
        setIsLoadingBookings(false);
        setSelectedSlot(null);
        }
    }

  return (<>
        {selectedSlot && selectedCourt && (
            <div ref={detailsRef} className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <p className="text-sm font-semibold text-primary">Campo Selezionato:</p>
                <p className="text-base font-medium">
                {selectedCourt.name} ({selectedCourt.isIndoor ? "Indoor" : "Outdoor"}) • {selectedDate} ore {selectedSlot}
                </p>
                <p className="text-xs text-muted-foreground">
                Totale: € {selectedCourt.price?.toFixed(2)}
                </p>
            </div>
            <Button size="lg" className="w-full sm:w-auto font-bold"
                disabled={isLoadingBookings}
                onClick={sendBooking}>
                Invia Prenotazione
            </Button>
            </div>
        )}
    </>
  );
}