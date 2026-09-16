import type { Route } from "./+types/auth";
import { useRevalidator } from "react-router";
import React, { useContext, useState, type FC } from "react";
import {DynamicForm, DynamicInput} from "./../component/form/form";
import { AuthContext } from "./../store/context";
import { ApiClient } from "~/Client/ApiClient";
import type { AuthReqDto } from "~/Client/Model/Request/AuthReqDto";


export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: `login` },
  ];
}

export default function Auth() {
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auth, setAuth] = useContext(AuthContext);

    async function login(e: React.SubmitEvent){
      e.preventDefault();

      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email")?.toString();
      const password = formData.get("password")?.toString();
      
      if(isSubmitting) return;
      setIsSubmitting(true);
      
      if(!email || !password){
        throw new Error("email o password non presente");
      }

      try {
        var input: AuthReqDto = {email:email, password: password } 
        const res =  await ApiClient.Login(input)

        if(!res.IsSuccess || res.Data === null){
          throw new Error("errore in fase di autenticazione");
        } 

        setAuth({auth:true, 
          email: res.Data.email ,
          firstName:res.Data.firstName , 
          lastName:res.Data.lastName, 

          username: res.Data.username
        });

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
              {action: () => {}, label: "Accedi", type: "submit", addClass: "submit", disabled: isSubmitting},
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




/*
import type { Route } from "./+types/padel";
import { useRevalidator } from "react-router";
import { fetchApi } from "./../services/api.service";
import React, { useContext, useState } from "react";
import { AuthContext } from "./../store/context";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, LogIn } from "lucide-react";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "Accedi - PadelInTwo" },
    { name: "description", content: "Effettua il login per accedere alle tue prenotazioni." },
  ];
}

export default function Auth() {
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auth, setAuth] = useContext(AuthContext);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    setIsSubmitting(true);

    try {
      await fetchApi(`/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      setAuth({ auth: true });
    } catch (error) {
      console.error("Errore durante il login:", error);
      alert("Credenziali non valide o errore di connessione.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2">
            <Dumbbell className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Accedi a Padel<span className="text-primary">In</span>Two
          </CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per gestire i campi e le prenotazioni
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@esempio.it"
                defaultValue="john.doe@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                defaultValue="password123!"
                required
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Accedi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
*/