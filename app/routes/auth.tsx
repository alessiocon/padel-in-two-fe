import type { Route } from "./+types/padel";
import { useLoaderData, useRevalidator } from "react-router";
import { fetchApi } from "./../services/api.service";
import React, { useContext, useState, type FC } from "react";
import {DynamicForm, DynamicInput} from "./../component/form/form";
import { AuthContext } from "./../store/context";


export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.name || "Login" },
    { name: "description", content: `login` },
  ];
}

// export async function loader({ params }: Route.LoaderArgs) {
//   const { _id } = params;

//   // Fai fetch dall'API
//   const response = await fetchApi<PadelDtoId>(`/padel/${_id}`);
  
//   // Formatta le date sul server per evitare hydration mismatch
//   const formatDate = (date: Date) => {
//     return new Date(date).toLocaleDateString('it-IT', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       timeZone: 'Europe/Rome'
//     });
//   };

//   return {
//     ...response,
//     startDateFormatted: formatDate(response.startDate),
//     round: response.round.map(r => ({
//       ...r,
//       startFormatted: r.start ? formatDate(r.start) : null
//     }))
//   };
// }

export default function Auth() {
  // const padel = useLoaderData<typeof loader>() as PadelDtoId;
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auth, setAuth] = useContext(AuthContext);

    async function login(e: React.SubmitEvent){
      e.preventDefault();
            //dati del form
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email")?.toString();
      const password = formData.get("password")?.toString();
      
      if(isSubmitting) return;
      setIsSubmitting(true);
      
      try {
        const data = await fetchApi(`/auth/login`, {
          method: 'POST',
          body: {
            email: email,
            password: password
          }
        });
       
        setAuth({auth:true});
      } catch (error) {
        alert("Errore in fase di login");
      } finally {
        setIsSubmitting(false);
      }
    }

  return (<>
  <h1 className="t-center">Login</h1>
   <DynamicForm 
        onSubmit={(e) => login(e)}
        addClass="center"
        buttons={[
              {action: () => {}, label: "Invia", type: "submit", addClass: "submit"},
              {action: () => {}, label: "Annulla", type: "reset"}
            ]}
    >
        <DynamicInput 
            name="email" 
            labelText={`email`} 
            type="email" 
            required 
            addClass=""
            defaultValue={"john.doe@example.com"} 
            value={["", () => {}]}
            placeholder={`email`}
        />

        <DynamicInput 
            name="password" 
            labelText={`password`} 
            type="password" 
            required 
            addClass="" 
            defaultValue={"password123!"}
            value={["", () => {}]}
            placeholder={`password`}
        />
    </DynamicForm>
  </>
  );
}
