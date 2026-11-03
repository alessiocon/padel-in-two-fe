import type { Route } from "./+types/home";
import {useEffect, useState } from "react";
import { useParams } from "react-router";

import type { ClubResDto } from "../client/model/response/ClubResDto";
import { apiClient } from "../client/apiClient";
import { CardClubInfo } from "../components/club/card.club.info";
import { BookingPrenotation } from "../components/booking/prenotation/booking.prenotation";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "Prenota Campo - Padel" },
    { name: "description", content: "Seleziona orario e campo per la tua partita" },
  ];
}


export default function ClubDetailPage() {
  const [club, setClub] = useState<ClubResDto | null>(null);
  const [bookings, setBookings] = useState<BookingQuickResDto[] | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const { id: clubId } = useParams<{ id: string }>();

  useEffect(() => {
    if(clubId == undefined){
      alert("Club non specificato")
      return;
    }

    apiClient.getClub(clubId)
      .then(res => {
        if(!res.IsSuccess){
          alert(res.Error?.message ?? "Errore nel recupero del club");
          return;
        }
        setClub(res.Data ?? null);
      })
      .catch(err => console.error("Errore nel recupero dei club", err))
  }, [])


  return (<>
    <div className="min-h-screen bg-background text-foreground p-2 md:p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <CardClubInfo club={club} isClubManagerPage={false}/>
        </aside>
        
        <BookingPrenotation 
          club={club}
          bookingsState={[bookings, setBookings]}
          isLoadingBookingsState={[isLoadingBookings, setIsLoadingBookings]}
        />
      </div>
    </div>
  </>
    
  );
}