import type { Route } from "./+types/auth";
import { useRevalidator } from "react-router";
import React, { useContext, useState } from "react";
import { DynamicForm, DynamicInput } from "./../component/form/form";
import { AuthContext } from "./../store/context";
import { apiClient } from "./../client/apiClient";
import type { AuthReqDto } from "./../client/model/request/AuthReqDto";
import type { CreateUserDto } from "./../client/model/request/CreateUserDto";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Autenticazione" },
    { name: "description", content: "Login, Registrazione e Recupero Password" },
  ];
}

type AuthMode = "login" | "register" | "forgot-password";

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

  const emailFormatRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const domain = email.split("@")[1]?.toLowerCase();
  
  if (!emailFormatRegex.test(email) || !domain || !ALLOWED_EMAIL_DOMAINS.includes(domain)) 
  {
    window.alert(
      "Inserisci un'indirizzo email valido. Sono accettati solo i provider principali (es. Gmail, iCloud, Outlook, Yahoo, Libero).")

    return false;
  }

  return true;
};

export default function Auth() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auth, setAuth] = useContext(AuthContext);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [confirmationEmailTime, setConfirmationEmailTime] = useState<Date>(new Date());

  // ==========================================
  // HANDLER LOGIN
  // ==========================================
  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email")?.toString().trim().toLocaleLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      alert("Inserisci email e password");
      return;
    }

    if(!isValidAllowedEmail(email)){ return }

    setIsSubmitting(true);

    try {
      const input: AuthReqDto = { email: email.toLocaleLowerCase(), password };
      const res = await apiClient.login(input);

      if (!res.IsSuccess || !res.Data) {
        if (!res.Error) { throw new Error(); }
        let [message, id] = res.Error.message.split(":");

        if (message === "Per effettuare l'accesso  devi confermare la tua email") {
          const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
          if (!confirmationEmailTime || confirmationEmailTime < oneMinuteAgo) {
            alert(message + " , controlla la posta");
            await apiClient.sendEmailConfirmation(id);
            setConfirmationEmailTime(new Date());
          } else {
            alert(message + " , controlla la posta.");
          }
          setConfirmationEmailTime(new Date());
        }else{
          throw new Error()
        }
        return;
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
      alert("Credenziali non corrette, riprova");
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
    const email = formData.get("email")?.toString().trim().toLocaleLowerCase();
    const password = formData.get("password")?.toString();
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const username = formData.get("username")?.toString();

    if (!email || !password || !firstName || !lastName || !username) {
      alert("Tutti i campi sono obbligatori");
      return;
    }

    if (!isValidAllowedEmail(email)) { return }

    setIsSubmitting(true);

    try {
      const input: CreateUserDto = {
        email: email,
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

      alert("Benvenuto, ti abbiamo inviato una mail per confermare la tua identità.");
      setAuthMode("login")
      
    } catch (error) {
      alert("Errore in fase di registrazione. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ==========================================
  // HANDLER RECUPERO PASSWORD
  // ==========================================
  async function handleForgotPassword(e: React.SubmitEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email")?.toString().trim().toLowerCase();

    if (!email) {
      alert("Inserisci l'indirizzo email associato all'account");
      return;
    }

    if (!isValidAllowedEmail(email)) { return }

    setIsSubmitting(true);

    try {
     
      const res = await apiClient.sendEmailForgotPassword(email);
      
      alert("Se l'email è associata a un account, riceverai le istruzioni per il reset della password.");
      setAuthMode("login");
    } catch (error) {
      alert("Errore durante la richiesta di recupero. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Selector Switch Tra Login e Registrazione (Visibile solo se non siamo in modalità recupero password) */}
        {authMode !== "forgot-password" && (
          <div className="flex w-full mb-6 bg-muted p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                authMode === "login"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                authMode === "register"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrati
            </button>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6 text-center">
          {authMode === "login" && "Bentornato"}
          {authMode === "register" && "Crea il tuo Account"}
          {authMode === "forgot-password" && "Recupera Password"}
        </h1>

        {/* FORM LOGIN */}
        {authMode === "login" && (
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
              value={["", () => {}]}
              placeholder="email@esempio.com"
            />

            <DynamicInput
              name="password"
              labelText="Password"
              type="password"
              required
              addClass="w-full"
              value={["", () => {}]}
              placeholder="••••••••"
            />

            {/* Link Password Dimenticata */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => setAuthMode("forgot-password")}
                className="text-xs text-primary hover:underline font-medium"
              >
                Password dimenticata?
              </button>
            </div>
          </DynamicForm>
        )}

        {/* FORM REGISTRAZIONE */}
        {authMode === "register" && (
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
                placeholder="email@esempio.com"
                value={["", () => {}]}
              />

              <DynamicInput
                name="password"
                labelText="Password"
                type="password"
                required
                addClass="w-full"
                placeholder="Min. 8 caratteri"
                value={["", () => {}]}
              />
            </DynamicForm>
          </div>
        )}

        {/* FORM RECUPERO PASSWORD */}
        {authMode === "forgot-password" && (
          <DynamicForm
            onSubmit={(e) => handleForgotPassword(e)}
            addClass="w-full flex flex-col gap-4"
            buttons={[
              {
                action: () => {},
                label: "Invia",
                type: "submit",
                addClass: "submit w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-sm transition-colors mt-2 shadow-sm",
                disabled: isSubmitting,
              },
            ]}
          >
            <p className="text-xs text-muted-foreground text-center mb-1">
              Inserisci la tua email e ti invieremo un link per reimpostare la password.
            </p>
            <DynamicInput
              name="email"
              labelText="Email"
              type="email"
              required
              addClass="w-full"
              value={["", () => {}]}
              placeholder="email@esempio.com"
            />
          </DynamicForm>
        )}

        {/* Footer switch */}
        <div className="mt-6 text-xs text-muted-foreground text-center">
          {authMode === "register" && (
            <p>
              Hai già un account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-primary font-medium hover:underline"
              >
                Accedi qui
              </button>
            </p>
          )}
          {authMode === "login" && (
            <p>
              Non hai un account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="text-primary font-medium hover:underline"
              >
                Registrati qui
              </button>
            </p>
          )}
          {authMode === "forgot-password" && (
            <p>
              Ricordi la password?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-primary font-medium hover:underline"
              >
                Torna al login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}