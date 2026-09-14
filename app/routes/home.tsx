import type { Route } from "./+types/home";
import { useContext, useState, type ButtonHTMLAttributes, type MouseEventHandler } from "react";
import { Link, useLoaderData } from "react-router";

import type { PadelDto, PadelDtoId } from "./../models/padel.dto";
import {fetchApi} from "./../services/api.service";
import { DynamicForm, DynamicInput, type formButton } from "./../component/form/form";
import { AuthContext, PopUpContext } from "./../store/context";
import type { ClubDto } from "~/models/club.dto";
import { DoorClosed, DoorOpen, CalendarClock, Timer, MapPin} from 'lucide-react';


import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const response = await fetchApi<ClubDto[]>("/clubs");
  if (!response) {
    throw new Error("Failed to fetch padel data");
  }
  return response;
}



export default function Home() {
  const clubs = useLoaderData<typeof loader>() as ClubDto[];

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [popup, setPopup] = useContext(PopUpContext);
  const [auth, setAuth] = useContext(AuthContext);
  

  // async function handleSubmitAddEvent(e: React.SubmitEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   if(clubs) return 
  //   const formData = new FormData(e.target as HTMLFormElement);

  //   let newEvent : PadelDto = {
  //     name: formData.get("name")?.toString() || "",
  //     startDate: formData.get("startDate") ? new Date(formData.get("startDate")!.toString()) : new Date(),
  //     location: formData.get("location")?.toString() || "",
  //     teams: formData.get("teams") ? formData.get("teams")!.toString().split(",").map(team => team.trim()) : [],
  //     gironiCount: formData.get("gironiCount") ? Number(formData.get("gironiCount")) : 0,
  //     round: [],
  //     recovery: [],
  //     gironi:[],
  //   }
  //   setIsSubmitting(true);


  //   try {
  //       let response = await fetchApi<PadelDtoId>(`/padel`, {
  //         method: 'POST',
  //         body: newEvent
  //       });
  
  //       setPopup({massage:null});
  //       //padelData.push(response); // Aggiorna lo stato locale
  //       // revalidator.revalidate(); // Ricarica i dati
  //     } catch (error) {
  //         alert("Errore nell'aggiornamento del Round");
  //     } finally {
  //         setIsSubmitting(false);
  //     }

  // }

//   function buildFormAddEvent(e: React.MouseEvent) : React.JSX.Element {
//   e.preventDefault();

//   let buttons : formButton[] = [
//         {action: () => {}, label: "Invia", type: "submit", addClass: "submit"},
//         {action: () => setPopup({massage:null}), label: "Annulla", type: "reset"}
//       ];

//   return <>
//     <h3>Aggiungi un nuovo evento</h3>
//     <DynamicForm 
//         onSubmit={(e) => handleSubmitAddEvent(e)} className=""
//         buttons={buttons}
//       >
//         <DynamicInput 
//           name="name" 
//           labelText={`Nome Evento`} 
//           type="text" 
//           required 
//           addClass=""
//           value={["", () => {}]} 
//           placeholder={`inserisci il nome dell'evento`}
//         /> 

//         <DynamicInput 
//           name="startDate" 
//           labelText={`Data Inizio`} 
//           type="date" 
//           required 
//           addClass=""
//           value={["", () => {}]} 
//           placeholder={`inserisci la data di inizio dell'evento`}
//         />
        
//         <DynamicInput
//           name="location"
//           labelText={`Location`}
//           type="text"
//           required
//           addClass=""
//           value={["", () => {}]}
//           placeholder={`inserisci la location dell'evento`}
//         />

//         <div>
//           <label htmlFor="teams">Scegli il tipo di evento</label>
//           <textarea
//             name="teams"
//             placeholder="Inserisci le squadre partecipanti, separate da virgola"
//             required
//           />
//         </div>
        

//         <DynamicInput
//           name="gironiCount"
//           labelText={`Numero Gironi`}
//           type="number"
//           min="8"
//           max="64"
//           step={8}
//           required
//           addClass=""
//           value={["", () => {}]}
//           placeholder={`inserisci il numero di gironi dell'evento`}
//         />
//       </DynamicForm>
//   </>
// }

// async function getClub(e: React.MouseEvent<HTMLButtonElement>) {
//   e.preventDefault()
//    const response = await fetchApi<object[]>("/users/me")
// }

  
  return (
    <div>
      {/* <ListPadel padels={padelData} /> */}
      {/* <button className="btn"
         onClick={(e) => setPopup({massage: buildFormAddEvent(e), stopPropagation:false, buttons: null})}>
        aggiungi evento
      </button> */}
      
      <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-3 p-4">
        {clubs.map((x, index) => {
          const totalSum = x.courts.reduce((acc, court) => acc + court.price, 0);
          const averagePrice = (x.courts.length > 0 ? totalSum / x.courts.length : 0).toFixed(2);

          const indoorCount = x.courts?.filter((c) => c.isIndoor).length ?? 0;
          const outdoorCount = x.courts?.filter((c) => !c.isIndoor).length ?? 0;
          return <Card className="w-[350px] bg-card border-primary/20" key={`clubs-${x.id}`}>
            <CardHeader >
              <CardTitle className="text-primary">{x.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs pt-1">
                <span className="flex items-top gap-1 font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {x.position}
                </span>
              </CardDescription>
                         
            </CardHeader>

            <CardContent>
              <CardDescription className="flex items-center gap-2 text-xm">
                <span className="flex items-center gap-1 font-medium ">
                  <CalendarClock className="h-3.5 w-3.5 text-primary" />{x.openingTime} - {x.closingTime}  
                </span>
                /
                <span className="flex items-center gap-1 font-medium">
                  <Timer className="h-3.5 w-3.5 text-primary " /> {x.slotDurationMinutes}m
                </span>
              </CardDescription>
              <CardDescription className="flex items-center gap-2 text-xm">
                <span className="font-medium text-muted-foreground pt-1">Campi:</span>
              {indoorCount > 0 && (
                <span className="flex items-center gap-1 font-medium ">
                  <DoorClosed className="h-3.5 w-3.5 text-primary" />
                  {indoorCount}
                </span>
              )}
              {outdoorCount > 0 && (
                <span className="flex items-center gap-1 font-medium">
                  <DoorOpen className="h-3.5 w-3.5 text-primary" />
                  {outdoorCount}
                </span>
              )}
            </CardDescription>  
              
            </CardContent>
           <CardFooter className="flex justify-between items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Campo</span>
                <span className="font-bold text-base">€ {averagePrice}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Pala</span>
                <span className="font-bold text-base">€ {x.racketPrice}</span>
              </div>

              <Link to={`/clubs/${x.id}`}>
                <Button variant="default"> Prenota Ora </Button>
              </Link>   
            </CardFooter>
          </Card>
        })}
      </div>

      <button className="btn" onClick={async (e) => {
        e.preventDefault()
        try{
          await fetchApi(`/auth/logout`, {
            method: 'POST',
          });

          setAuth({auth: false});
        }catch{}
      }}>
      logout
    </button>
    <Link to={"test"}> vai alla prova</Link>
    </div>
  );
}
