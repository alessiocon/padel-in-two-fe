import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";


import { CardClubPreview } from "./../component/CardClubPreview";
import { apiClient } from "./../client/apiClient";
import type { ClubsResDto } from "../client/model/response/ClubsResDto";
import { CardUpcomingClubs } from "../component/CardUpcomingClubs";
import { CardTournamentPreview } from "../component/CardTournamentPreview";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PadelInTwo" },
    { name: "description", content: "PadelInTwo, prenota il tuo campo" },
  ];
}

export async function loader() {
  const res = await apiClient.getClubs();

  if (!res.IsSuccess) { throw new Error("Failed to fetch padel data");}

  return res.Data;
}



export default function Home() {
  const clubs = useLoaderData<typeof loader>() as ClubsResDto[];

  return (
    <div className="min-h-screen bg-background text-foreground my-2 px-2">
      <div className="my-4  m-auto">
        <h2 className="mb-2 text-center text-xl font-medium">Eventi</h2>
        <CardTournamentPreview/>
      </div>
      

    <div className="my-10  m-auto">
      <h2 className="mb-2 text-center text-xl font-medium" >CAMPI IN PROMOZIONE</h2>
        <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-3">
          {clubs.map((club) => (
            <CardClubPreview key={`club-${club.id}`} club={club} />
          ))}
          
          <CardUpcomingClubs/>
        </div>
      </div>
    </div>

  );
}
