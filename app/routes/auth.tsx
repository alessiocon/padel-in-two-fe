import type { Route } from "./+types/auth";
import { useRevalidator } from "react-router";
import React, { useContext, useState } from "react";
import { DynamicForm, DynamicInput } from "./../component/form/form";
import { AuthContext } from "./../store/context";
import { apiClient } from "./../client/apiClient";
import type { AuthReqDto } from "./../client/model/request/AuthReqDto";
import type { CreateUserDto } from "./../client/model/request/CreateUserDto";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Autenticazione" },
    { name: "description", content: "Login e Registrazione" },
  ];
}


const isValidAllowedEmail = (email: string): boolean => {

  const ALLOWED_EMAIL_DOMAINS = [
    "gmail.com",
    "gmail.it",
    "icloud.com",
    "me.com",
    "outlook.com",
    "outlook.it",
    "hotmail.com",
    "hotmail.it",
    "yahoo.com",
    "yahoo.it",
    "libero.it"
  ];

  // 1. Regex standard per validare la struttura formale dell'email
  const emailFormatRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailFormatRegex.test(email)) {
    return false;
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  return ALLOWED_EMAIL_DOMAINS.includes(domain);
};

export default function Auth() {
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auth, setAuth] = useContext(AuthContext);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // ==========================================
  // HANDLER LOGIN
  // ==========================================
  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      alert("Inserisci email e password");
      return;
    }

    setIsSubmitting(true);

    try {
      const input: AuthReqDto = { email: email.toLocaleLowerCase(), password };
      const res = await apiClient.login(input);

      if (!res.IsSuccess || !res.Data) {
        throw new Error("Errore in fase di autenticazione");
      }

      setAuth({
        auth: true,
        email: res.Data.email.toLocaleLowerCase(),
        firstName: res.Data.firstName,
        lastName: res.Data.lastName,
        username: res.Data.username,
        id: res.Data.id
      });

    } catch (error) {
      alert("Errore in fase di login. Verificare le credenziali.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ==========================================
  // HANDLER REGISTRAZIONE
  // ==========================================
  async function handleRegister(e: React.SubmitEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const username = formData.get("username")?.toString();

    if (!email || !password || !firstName || !lastName || !username) {
      alert("Tutti i campi sono obbligatori");
      return;
    }


    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidAllowedEmail(trimmedEmail)) {
      window.alert(
        "Inserisci un'indirizzo email valido. Sono accettati solo i provider principali (es. Gmail, iCloud, Outlook, Yahoo, Libero)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateUserDto = {
        email: trimmedEmail,
        password,
        firstName,
        lastName,
        username,
      };

      const res = await apiClient.register(input);

      if (!res.IsSuccess && res.Error) {
          alert(res.Error?.message);
          return;
      }

      alert("Account creato con successo! Ora puoi effettuare il login.");
      
    } catch (error) {
      alert("Errore in fase di registrazione. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Selector Switch Tra Login e Registrazione */}
        <div className="flex w-full mb-6 bg-muted p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setIsRegisterMode(false)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              !isRegisterMode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterMode(true)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              isRegisterMode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrati
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">
          {isRegisterMode ? "Crea il tuo Account" : "Bentornato"}
        </h1>

        {/* FORM LOGIN */}
        {!isRegisterMode ? (
          <DynamicForm
            onSubmit={(e) => handleLogin(e)}
            addClass="w-full flex flex-col gap-4"
            buttons={[
              {
                action: () => {},
                label: "Accedi",
                type: "submit",
                addClass: "submit w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-sm transition-colors mt-2 shadow-sm",
                disabled: isSubmitting,
              },
            ]}
          >
            <DynamicInput
              name="email"
              labelText="Email"
              type="email"
              required
              addClass="w-full"
              //defaultValue="john.doe@example.com"//alessioConforto@gmail.com
              value={["", () => {}]}
              placeholder="email@esempio.com"
            />

            <DynamicInput
              name="password"
              labelText="Password"
              type="password"
              required
              addClass="w-full"
              //defaultValue="password123!"
              value={["", () => {}]}
              placeholder="••••••••"
            />
          </DynamicForm>
        ) : (
          /* FORM REGISTRAZIONE */
          <div className="w-full max-h-[75vh] overflow-y-auto pr-1">
            <DynamicForm
              onSubmit={(e) => handleRegister(e)}
              addClass="w-full flex flex-col gap-3"
              buttons={[
                {
                  action: () => {},
                  label: "Crea Account",
                  type: "submit",
                  addClass: "submit w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-sm transition-colors mt-2 shadow-sm",
                  disabled: isSubmitting,
                },
              ]}
            >
              <DynamicInput
                name="firstName"
                labelText="Nome"
                type="text"
                required
                addClass="w-full"
                placeholder="Nome"
                value={["", () => {}]}
              />

              <DynamicInput
                name="lastName"
                labelText="Cognome"
                type="text"
                required
                addClass="w-full"
                placeholder="Cognome"
                value={["", () => {}]}
              />

              <DynamicInput
                name="username"
                labelText="Username"
                type="text"
                required
                addClass="w-full"
                placeholder="Username"
                value={["", () => {}]}
              />

              <DynamicInput
                name="email"
                labelText="Email"
                type="email"
                required
                addClass="w-full"
                //defaultValue="alessioConforto@gmail.com"
                placeholder="email@esempio.com"
                value={["", () => {}]}
              />

              <DynamicInput
                name="password"
                labelText="Password"
                type="password"
                required
                addClass="w-full"
                //defaultValue="password123!"
                placeholder="Min. 8 caratteri"
                value={["", () => {}]}
              />
            </DynamicForm>
          </div>
        )}

        {/* Footer switch */}
        <div className="mt-6 text-xs text-muted-foreground text-center">
          {isRegisterMode ? (
            <p>
              Hai già un account?{" "}
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-primary font-medium hover:underline"
              >
                Accedi qui
              </button>
            </p>
          ) : (
            <p>
              Non hai un account?{" "}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-primary font-medium hover:underline"
              >
                Registrati qui
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}