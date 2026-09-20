import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";


import { CardClubPreview } from "./../component/CardClubPreview";
import { apiClient } from "./../client/apiClient";
import type { ClubsResDto } from "./../client/model/response/ClubsResDto";
import { CardUpcomingClubs } from "../component/CardUpcomingClubs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-3 p-4">
        {clubs.map((club) => (
          <CardClubPreview key={`club-${club.id}`} club={club} />
        ))}
        
        <CardUpcomingClubs/>
      </div>
    </div>
  );
}
