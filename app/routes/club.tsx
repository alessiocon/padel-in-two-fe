import type { Route } from "./+types/home";
import {useEffect, useState } from "react";
import { useParams } from "react-router";

import { apiClient } from "./../client/apiClient";
import type { ClubResDto } from "../client/model/response/ClubResDto";
import type { ClubCourtDto } from "./../client/model/common/ClubCourtDto";
import type { BookingResDto } from "../client/model/response/BookingsResDto";
import { ClubStatusDto } from "../client/model/common/Enum/ClubStatusDto";
import { CourtStatusDto } from "../client/model/common/Enum/CourtStatusDto";
import { CardClubInfo } from "../components/club/card.club.info";
import { HeaderClub } from "../components/club/header.club";
import { TableBookingClub } from "../components/booking/table.booking.club";
import { SendBookingClub } from "../components/booking/send.booking.club";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Prenota Campo - Padel" },
    { name: "description", content: "Seleziona orario e campo per la tua partita" },
  ];
}

//TODO: DA LEVARE IL MOCK
export const MOCK_CLUB: ClubResDto = {
  id: "e0fe08cf-fca4-4e10-b1d2-11793c3d1a92",
  ownerId: "8f8fc242-8719-45a9-b141-8028e39d45df",
  name: "Up Padel Arzano",
  email: "uppadelarzano@gmail.com",
  slotDurationMinutes: 90,
  openingTime: "08:00",
  closingTime: "23:00",
  position: "Via Atellana n. 65, Arzano",
  timezone: "Europe/Rome",
  status: ClubStatusDto.ACTIVE,
  courtsInDoor: 0,
  courtsOutDoor: 4,
  averagePrice: 30,
  racketPrice: 2,
  courts: [
    {
      id: "a7c7f6e8-0727-4972-9e26-61fc4ee8fd17",
      clubId: "e0fe08cf-fca4-4e10-b1d2-11793c3d1a92",
      name: "campo 1",
      isIndoor: false,
      offsetMinutes: 0,
      price: 30,
      status: CourtStatusDto.AVAILABLE,
    },
    {
      id: "66346bfe-0c06-424e-b2aa-08e9a455e386",
      clubId: "e0fe08cf-fca4-4e10-b1d2-11793c3d1a92",
      name: "campo 2",
      isIndoor: false,
      offsetMinutes: 0,
      price: 30,
      status: CourtStatusDto.AVAILABLE,
    },
    {
      id: "bfd98d5c-a393-4bbf-a2f1-d9620a744222",
      clubId: "e0fe08cf-fca4-4e10-b1d2-11793c3d1a92",
      name: "campo 3",
      isIndoor: false,
      offsetMinutes: 0,
      price: 30,
      status: CourtStatusDto.AVAILABLE,
    },
    {
      id: "e4b520a7-539a-404b-b896-98cfd1b9cae3",
      clubId: "e0fe08cf-fca4-4e10-b1d2-11793c3d1a92",
      name: "campo 4",
      isIndoor: false,
      offsetMinutes: 30,
      price: 30,
      status: CourtStatusDto.AVAILABLE,
    },
  ],
};


export default function ClubDetailPage() {
  const [club, setClub] = useState<ClubResDto | null>(null);
  const { id: clubId } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<string>( new Date().toISOString().split("T")[0] );
  
  const [bookings, setBookings] = useState<BookingResDto[] | null >(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<ClubCourtDto | null>(null);

  useEffect(() => {
    if(clubId == undefined){
      alert("Club non specificato")
      return;
    }

    apiClient.getClub(clubId)
      .then(res => {
        if(!res.IsSuccess){
          alert(res.Error?.message ?? "Errore nel recupero del club");
          //TODO: SOLO PER I MOCK
          // setClub(MOCK_CLUB)
          return;
        }
        setClub(res.Data ?? null);
      })
      .catch(err => console.error("Errore nel recupero dei club", err))
  }, [])

  useEffect(() => {
    if(!club) return;
    setIsLoadingBookings(true);

    apiClient.getBookingsOfClub(club.id, selectedDate)
      .then(res => {
        if(!res.IsSuccess){
            alert(res.Error?.message ?? "errore nell ritrovamento delle prenotazioni")
        }
        setBookings(res.Data || []);
      })
      .catch(() => alert("errore nell ritrovamento delle prenotazioni"))
      .finally(() => setIsLoadingBookings(false))

  }, [club , selectedDate]);
 
  return (<>
    <div className="min-h-screen bg-background text-foreground p-2 md:p-4 lg:p-8">
      <HeaderClub club={club}/>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <CardClubInfo club={club}/>
        </aside>

        {/* Sezione Calendario e Slot Orari */}
        <TableBookingClub 
          club={club}
          dateState={[selectedDate, setSelectedDate]}
          slotState={[selectedSlot, setSelectedSlot]}
          bookingsState={[bookings, setBookings]}
          isLoadingBooking={isLoadingBookings}
          setSelectedCourt={setSelectedCourt}
        />

        {club && <SendBookingClub 
          selectedCourtState={[selectedCourt, setSelectedCourt]}
          bookingsState={[bookings, setBookings]}
          isLoadingBookingsState={[isLoadingBookings, setIsLoadingBookings]}
          slotState={[selectedSlot, setSelectedSlot]}
          clubId={club.id}
          selectedDate={selectedDate}
        />}
      </div>
    </div>
  </>
    
  );
}