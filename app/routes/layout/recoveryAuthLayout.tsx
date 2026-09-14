import { Navigate, Outlet, useLoaderData } from "react-router";
import { useContext, useEffect, useState} from "react";
import { AuthContext } from "../../store/context";
import { fetchApi } from "../../services/api.service";




export default function RecoveryAuthLayout() {
  const [auth, setAuth] = useContext(AuthContext);
  const [authState, setAuthState] = useState<{ isChecking: boolean; isAuth: boolean }>({
    isChecking: true,
    isAuth: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      let isUserAuthenticated = false;

      try {
        const res = await fetchApi<{ res: boolean }>("/users/me", { method: "GET" });
        // Sostituisci res.res con il controllo idoneo se la tua API restituisce direttamente l'utente
        isUserAuthenticated = Boolean(res?.res ?? res);
      } catch (err) {
        isUserAuthenticated = false;
      } finally {
        if (isMounted) {
          // 1. Aggiorniamo il Context globale
          setAuth({ auth: isUserAuthenticated });

          // 2. Aggiorniamo lo stato locale in un unico dispatch atomico
          setAuthState({
            isChecking: false,
            isAuth: isUserAuthenticated,
          });
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Array di dipendenze vuoto: NON si riattiva durante le navigazioni tra rotte

  // Mostra lo splash screen SOLO durante il primissimo controllo all'avvio dell'app
  if (authState.isChecking) {
    return <div className="loading">Caricamento in corso...</div>;
  }

  // Passiamo il valore 'isAuth' aggiornato e sincrono al 100%
  return <Outlet />;
}
