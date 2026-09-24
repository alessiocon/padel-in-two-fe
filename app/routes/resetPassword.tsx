import type { Route } from "./+types/resetPassword";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Lock, ArrowRight } from "lucide-react";
import { apiClient } from "./../client/apiClient";
import { DynamicForm, DynamicInput } from "./../component/form/form";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Reimposta Password" },
    { name: "description", content: "Inserisci una nuova password per il tuo account" },
  ];
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("tokenId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    !token ? "Token di recupero non valido o mancante." : null
  );

  async function handleResetPassword(e: React.SubmitEvent) {
    e.preventDefault();
    if (isSubmitting || !token) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!password || !confirmPassword) {
      alert("Tutti i campi sono obbligatori");
      return;
    }

    if (password.length < 8) {
      alert("La password deve essere di almeno 8 caratteri");
      return;
    }

    if (password !== confirmPassword) {
      alert("Le password non coincidono");
      return;
    }

    setIsSubmitting(true);

    try {
      // Assicurati di esporre questo metodo nel tuo apiClient
      const res = await apiClient.resetPassword({ token, password });

      if (res.IsSuccess) {
        setIsSuccess(true);
      } else {
        setErrorMessage(
          res.Error?.message || "Impossibile reimpostare la password. Il link potrebbe essere scaduto."
        );
      }
    } catch (error) {
      setErrorMessage("Errore di rete durante il reset della password. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center bg-card p-6 rounded-lg border border-border shadow-sm animate-in fade-in zoom-in-95 duration-200">
        
        {/* STATO: TOKEN MANCANTE O ERRORE */}
        {errorMessage && !isSuccess && (
          <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight">Link Non Valido</h1>
              <p className="text-xs text-muted-foreground">
                {errorMessage}
              </p>
            </div>

            <Link
              to="/auth"
              className="w-full py-2 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-sm transition-colors shadow-sm block text-center"
            >
              Torna al Login
            </Link>
          </div>
        )}

        {/* STATO: SUCCESSO */}
        {!errorMessage && isSuccess && (
          <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Password Aggiornata!</h1>
              <p className="text-sm text-muted-foreground">
                La tua password è stata modificata con successo. Ora puoi effettuare l'accesso.
              </p>
            </div>

            <Link
              to="/auth"
              className="w-full py-2 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 group"
            >
              <span>Vai al Login</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* STATO: FORM INSERIMENTO NUOVA PASSWORD */}
        {!errorMessage && !isSuccess && token && (
          <div className="w-full flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1 mb-4 text-center">
              <h1 className="text-xl font-bold tracking-tight">Nuova Password</h1>
              <p className="text-xs text-muted-foreground">
                Inserisci e conferma la nuova password per il tuo account.
              </p>
            </div>

            <DynamicForm
              onSubmit={(e) => handleResetPassword(e)}
              addClass="w-full flex flex-col gap-4 text-left"
              buttons={[
                {
                  action: () => {},
                  label: isSubmitting ? "Aggiornamento in corso..." : "Reimposta Password",
                  type: "submit",
                  addClass: "submit w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-sm transition-colors mt-2 shadow-sm",
                  disabled: isSubmitting,
                },
              ]}
            >
              <DynamicInput
                name="password"
                labelText="Nuova Password"
                type="password"
                required
                addClass="w-full"
                placeholder="Min. 8 caratteri"
                value={["", () => {}]}
              />

              <DynamicInput
                name="confirmPassword"
                labelText="Conferma Password"
                type="password"
                required
                addClass="w-full"
                placeholder="Ripeti password"
                value={["", () => {}]}
              />
            </DynamicForm>
          </div>
        )}

      </div>
    </div>
  );
}