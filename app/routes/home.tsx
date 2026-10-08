import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";


import { CardClubPreview } from "./../component/CardClubPreview";
import { apiClient } from "./../client/apiClient";
import type { ClubsResDto } from "../client/model/response/ClubsResDto";
import { CardUpcomingClubs } from "../component/CardUpcomingClubs";
import { CardTournamentPreview } from "../component/CardTournamentPreview";
import { useEffect, useState } from "react";
import { CardClubSkeleton } from "../component/CardClubPreviewSkeleton";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PadelInTwo" },
    { name: "description", content: "PadelInTwo, prenota il tuo campo" },
  ];
}

export default function Home() {
  const [clubs , setClubs] = useState<ClubsResDto[] | null>(null)

  useEffect(() => {
    apiClient.getClubs()
      .then(res => setClubs(res.Data ?? []))
      .catch(err => console.error("Errore nel recupero dei clubs", err))
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground my-2 px-2">
      <div className="my-4  m-auto">
        <h2 className="mb-2 text-center text-xl font-medium">Eventi</h2>
        <CardTournamentPreview/>
      </div>
      

    <div className="my-10  m-auto">
      <h2 className="mb-2 text-center text-xl font-medium" >CAMPI IN PROMOZIONE</h2>
        <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-3">
          <CardUpcomingClubs/>

          {clubs === null && <>
            <CardClubSkeleton />
            <CardClubSkeleton />
            <CardClubSkeleton />
          </>}

          {clubs !== null && clubs.length === 0 && (
              <div className="w-[350px] sm:w-auto p-4 py-28 bg-card text-center">
                <p className="text-lg font-semibold tracking-tight">
                  I club non sono al momento disponibili
                </p>
              </div>
          )}

          {clubs !== null && clubs.length > 0 &&
            clubs.map((club) => (
              <CardClubPreview key={`club-${club.id}`} club={club} />
          ))}

        </div>
      </div>
    </div>

  );
}
