import type { Route } from "./+types/home";
import { useContext, useState, type ButtonHTMLAttributes, type MouseEventHandler } from "react";
import { Link, useLoaderData } from "react-router";

import ListPadel from "../component/listEvent/listPadel";
import type { PadelDto, PadelDtoId } from "../models/padel.dto";
import {fetchApi} from "../services/api.service";
import { DynamicForm, DynamicInput, type formButton } from "../component/form/form";
import { AuthContext, PopUpContext } from "../store/context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "test" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const response = await fetchApi<object[]>("/clubs");

  if (!response) {
    throw new Error("Failed to fetch padel data");
  }
  return response;
}



export default function Test() {
  const padelData = useLoaderData<typeof loader>() as PadelDtoId[];

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [popup, setPopup] = useContext(PopUpContext);
  const [auth, setAuth] = useContext(AuthContext);
  

  async function handleSubmitAddEvent(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    let newEvent : PadelDto = {
      name: formData.get("name")?.toString() || "",
      startDate: formData.get("startDate") ? new Date(formData.get("startDate")!.toString()) : new Date(),
      location: formData.get("location")?.toString() || "",
      teams: formData.get("teams") ? formData.get("teams")!.toString().split(",").map(team => team.trim()) : [],
      gironiCount: formData.get("gironiCount") ? Number(formData.get("gironiCount")) : 0,
      round: [],
      recovery: [],
      gironi:[],
    }
    setIsSubmitting(true);


    try {
        let response = await fetchApi<PadelDtoId>(`/padel`, {
          method: 'POST',
          body: newEvent
        });
  
        setPopup({massage:null});
        //padelData.push(response); // Aggiorna lo stato locale
        // revalidator.revalidate(); // Ricarica i dati
      } catch (error) {
          alert("Errore nell'aggiornamento del Round");
      } finally {
          setIsSubmitting(false);
      }

  }

  function buildFormAddEvent(e: React.MouseEvent) : React.JSX.Element {
  e.preventDefault();

  let buttons : formButton[] = [
        {action: () => {}, label: "Invia", type: "submit", addClass: "submit"},
        {action: () => setPopup({massage:null}), label: "Annulla", type: "reset"}
      ];

  return <>
    <p>pagina di test</p>
    </>
}

async function getClub(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault()
   const response = await fetchApi<object[]>("/users/me")
   console.log(response);
}

  
  return (
    <div>
      {/* <ListPadel padels={padelData} /> */}
      {/* <button className="btn"
         onClick={(e) => setPopup({massage: buildFormAddEvent(e), stopPropagation:false, buttons: null})}>
        aggiungi evento
      </button> */}

      <button type="button" onClick={e => getClub(e)}>clicca per test</button>

      <button className="btn" onClick={async (e) => {
        e.preventDefault()
        try{
          await fetchApi(`/auth/logout`, {
            method: 'POST',
          });

          setAuth({auth: false});
        }catch{

        }
      }}>
      logout
    </button>
    <Link to={"../"}> torna alla home</Link>

    </div>
  );
}
