import { Navigate, Outlet, useLoaderData } from "react-router";
import { useContext, useEffect, useState} from "react";
import { AuthContext } from "../../store/context";
import { FullPageLoader } from "~/component/FullPageLoader";
import { ApiClient } from "~/Client/ApiClient";




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
        const res = await ApiClient.GetUser();
        isUserAuthenticated = Boolean(res.IsSuccess);

        if(res.Data === null) throw new Error("errore in fase di ricerca della sessione");

        setAuth({ auth: res.IsSuccess, email: res.Data.email, firstName: res.Data.firstName, lastName: res.Data.lastName, username:res.Data.username});
      } catch (err) {
        isUserAuthenticated = false;
      } finally {
        if (isMounted) {
          // 1. Aggiorniamo il Context globale
         

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
    return <FullPageLoader label="Verifica sessione in corso..." />;
  }

  // Passiamo il valore 'isAuth' aggiornato e sincrono al 100%
  return <Outlet />;
}
