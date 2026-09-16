import type { Route } from "./+types/home";
import { useContext, useState } from "react";
import { useLoaderData } from "react-router";

import { AuthContext, PopUpContext } from "./../store/context";


import { CardClubPreview } from "~/component/CardClubPreview";
import { ApiClient } from "~/Client/ApiClient";
import type { ClubsResDto } from "~/Client/Model/Response/ClubsResDto";




export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const res = await ApiClient.GetClubs();

  if (!res.IsSuccess) { throw new Error("Failed to fetch padel data");}

  return res.Data;
}



export default function Home() {
  const clubs = useLoaderData<typeof loader>() as ClubsResDto[];

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [popup, setPopup] = useContext(PopUpContext);
  const [auth, setAuth] = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-3 p-4">
        {clubs.map((club) => (
          <CardClubPreview key={`club-${club.id}`} club={club} />
        ))}
      </div>
    </div>
  );
}
