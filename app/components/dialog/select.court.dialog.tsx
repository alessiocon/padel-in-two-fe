import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { useState } from "react";
import { bookingStatus } from "../../client/model/common/Enum/bookingStatusDto";
import type { BookingResDto } from "../../client/model/response/BookingsResDto";
import type { ClubCourtDto } from "../../client/model/common/ClubCourtDto";
import { ButtonCourtSelection } from "../../component/ButtonCourtSelection";


export type CourtWithStatusDto = ClubCourtDto & { isOccupied: boolean; };

export interface ICourtSelectionDialogProps {
  slot: string;
  selectedDate: string;
  courts: CourtWithStatusDto[];
  bookings: BookingResDto[];
  onSelectCourt: (court: ClubCourtDto) => void;
}

export default function SelectCourtDialog({slot, selectedDate, courts, bookings, onSelectCourt, openState} : ICourtSelectionDialogProps 
    & {  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]}) {
    const [open, setOpen] = openState;

    var slotTime = new Date(selectedDate+"T"+slot).toISOString();
    const bookedCourtIdsForSlot = bookings
        .filter((b) => (b.startsAt.slice(0, 16) === slotTime.slice(0, 16) && b.status !== bookingStatus.CANCELLED ))
        .map((b) => b.courtId);

    var courtsCheck: CourtWithStatusDto[] = courts.map((court, index) => {
        court.isOccupied = bookedCourtIdsForSlot.includes(court.id);
        return court
    });

    return <Dialog  open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <h3>{selectedDate.replaceAll("-", "/")} - {slot}</h3>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {courtsCheck.map((court) => {
                return (
                <ButtonCourtSelection key={court.name} court={court} onSelect={onSelectCourt} onClose={() => setOpen(false)}/>
                );
            })}
        </div>
      </DialogContent>
    </Dialog>
}   