import type { Route } from "./+types/clubs";


import { CardClubPreview } from "../component/CardClubPreview";
import { apiClient } from "../client/apiClient";
import type { ClubsResDto } from "../client/model/response/ClubsResDto";
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
    <div className="min-h-screen bg-background text-foreground mt-5">
      {/* <div className="my-4  m-auto">
        <h2 className="mb-2 text-center text-xl font-medium">Eventi</h2>
        <CardTournamentPreview/>
      </div> */}
      

      <div className="m-auto">
        <div className="mb-4 text-center bg-primary py-4 px-10 text-primary-foreground font-bold">
          <p>Hai un club e vuoi <span className="text-secondary-foreground bg-secondary">unirti</span> a noi <a href="https://www.instagram.com/padelintwo/" className="underline">contattaci!</a></p>
        </div>
          
        {/*TODO: DA IMPLEMENTARE QUANDO CI SARANNO PIù club */}
        {/* <form className="my-5 max-w-md m-auto px-4" >
          <Input
            className="w-full px-5 rounded-xl bg-gray-300"
            type="search"
            placeholder="Cerca un club..."
          />
        </form> */}

          <div className="flex flex-row flex-wrap items-center justify-center  gap-3 px-4">
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
