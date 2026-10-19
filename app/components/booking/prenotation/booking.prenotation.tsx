import { useEffect, useRef, useState } from "react";
import type { ClubResDto } from "../../../client/model/response/ClubResDto";
import type { ClubCourtDto } from "../../../client/model/common/ClubCourtDto";
import { apiClient } from "../../../client/apiClient";
import type { BookingQuickResDto } from "../../../client/model/response/booking.quick.res.dto";
import { SlotPrenotation } from "../slot.prenotation";
import { EditTeamPrenotation } from "../edit.team.prenotation";

interface BookingPrenotationProps {
    club: ClubResDto | null;
    bookingsState: [BookingQuickResDto[] | null, React.Dispatch<React.SetStateAction<BookingQuickResDto[] | null>>];
    isLoadingBookingsState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export function BookingPrenotation({ club, bookingsState, isLoadingBookingsState }: BookingPrenotationProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<ClubCourtDto | null>(null);
    const [bookings, setBookings] = bookingsState;
    const [isLoadingBookings, setIsLoadingBookings] = isLoadingBookingsState;
    const prenotationRef = useRef<HTMLDivElement>(null);
    const isShowingTeamForm = Boolean(selectedCourt && selectedSlot);
    const previousView = useRef(isShowingTeamForm);

    useEffect(() => {
        if (previousView.current === isShowingTeamForm) return;
        previousView.current = isShowingTeamForm;
        const container = prenotationRef.current;
        if (!container) return;

        const frameId = window.requestAnimationFrame(() => {
            const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 64;
            const top = window.scrollY + container.getBoundingClientRect().top - headerHeight;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [isShowingTeamForm]);

    useEffect(() => {
        if (!club) return;

        let isCurrentRequest = true;
        const fetchBookings = async () => {
            setIsLoadingBookings(true);
            setBookings(null);
            try {
                const response = await apiClient.searchBookings({
                    from: selectedDate,
                    to: selectedDate,
                    clubId: club.id,
                });

                if (!isCurrentRequest) return;
                if (!response.IsSuccess) {
                    window.alert(response.Error?.message ?? "Errore nel recupero delle prenotazioni.");
                }
                setBookings(response.Data ?? []);
            } catch {
                if (!isCurrentRequest) return;
                window.alert("Errore nel recupero delle prenotazioni.");
                setBookings([]);
            } finally {
                if (isCurrentRequest) setIsLoadingBookings(false);
            }
        };

        void fetchBookings();
        return () => {
            isCurrentRequest = false;
        };
    }, [club, selectedDate]);

    return (
        <div ref={prenotationRef} className="lg:col-span-3 space-y-6 bg-card border-primary/20">
            {selectedCourt && selectedSlot ? (
                <EditTeamPrenotation
                    selectedCourtState={[selectedCourt, setSelectedCourt]}
                    bookingsState={[bookings, setBookings]}
                    isLoadingBookingsState={[isLoadingBookings, setIsLoadingBookings]}
                    slotState={[selectedSlot, setSelectedSlot]}
                    clubId={club?.id ?? null}
                    selectedDate={selectedDate}
                    onCancel={() => {
                        setSelectedCourt(null);
                        setSelectedSlot(null);
                    }}
                />
            ) : (
                <SlotPrenotation
                    club={club}
                    dateState={[selectedDate, setSelectedDate]}
                    slotState={[selectedSlot, setSelectedSlot]}
                    bookingsState={[bookings, setBookings]}
                    isLoadingBooking={isLoadingBookings}
                    setSelectedCourt={setSelectedCourt}
                />
            )}
        </div>
    );
}
