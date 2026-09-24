import type { Route } from "./+types/confirmationEmail";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { apiClient } from "./../client/apiClient";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Conferma Email" },
    { name: "description", content: "Conferma del tuo indirizzo email" },
  ];
}

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();

  // Estrae l'ID o Token dal path param (es. /confirm-email/:id) o query param (es. ?token=... / ?id=...)
  const token = searchParams.get("tokenId")

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setIsLoading(false);
        setErrorMessage("Link di conferma non valido o token mancante.");
        return;
      }

      try {
        const res = await apiClient.emailConfirmation(token);

        if (res.IsSuccess) {
          setIsSuccess(true);
        } else {
          setErrorMessage(
            res.Error?.message || "Impossibile confermare l'email. Il link potrebbe essere scaduto."
          );
        }
      } catch (error) {
        setErrorMessage("Errore di rete durante la verifica dell'email. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-background text-foreground w-full flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center bg-card p-6 rounded-lg border border-border shadow-sm animate-in fade-in zoom-in-95 duration-200">
        
        {/* STATO: CARICAMENTO */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 my-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">
              Verifica della mail in corso...
            </p>
          </div>
        )}

        {/* STATO: SUCCESSO */}
        {!isLoading && isSuccess && (
          <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Benvenuto!</h1>
              <p className="text-sm text-muted-foreground">
                Email confermata con successo. Il tuo account è ora attivo.
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

        {/* STATO: ERRORE */}
        {!isLoading && !isSuccess && (
          <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight">Verifica Fallita</h1>
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

      </div>
    </div>
  );
}