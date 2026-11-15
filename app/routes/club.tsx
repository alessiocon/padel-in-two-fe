import type { Route } from "./+types/home";
import {useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import type { ClubResDto } from "../client/model/response/ClubResDto";
import { apiClient } from "../client/apiClient";
import { CardClubInfo } from "../components/club/card.club.info";
import { PriceList } from "../components/club/price.list";
import { BookingPrenotation } from "../components/booking/prenotation/booking.prenotation";
import type { BookingQuickResDto } from "~/client/model/response/booking.quick.res.dto";
import { buttonVariants } from "~/components/ui/button";
import { AuthContext } from "~/store/context";
import { ArrowLeft, ArrowRight } from "lucide-react";



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
  const [auth, setAuth] = useContext(AuthContext);

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

  let isMemberOfAClub : boolean = Boolean(club?.members.find(m => m.userId === auth?.sub));
  return (<>
    <div className="min-h-screen text-foreground px-2 md:px-4 lg:px-8">
      <div className="grid grid-cols-2 gap-2 my-5">
          <Link to={`/clubs`} 
              className={`${buttonVariants({ variant: "secondary", size: "sm" })} w-full md:w-auto max-w-[150px] text-center whitespace-nowrap`}>
              <ArrowLeft className="inline h-4 w-4" /> Indietro
          </Link>
          {club && isMemberOfAClub && <>
            <Link to={`/clubs/${club.id}/manage`} 
              className={`${buttonVariants({ variant: "default", size: "sm" })} w-full md:w-auto max-w-[150px] whitespace-nowrap ml-auto`}>
              Area manager <ArrowRight className="inline h-4 w-4" />
            </Link>
          </>}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <aside className="lg:col-span-1 lg:row-span-2 space-y-6">
          <CardClubInfo club={club}/>
        </aside>
        <aside className="lg:col-span-3 lg:row-span-1">
          <PriceList club={club} />
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