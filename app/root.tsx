import {
  Link ,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";



import type { Route } from "./+types/root";
import "./app.css";
import { useState } from "react";
import { AuthContext, PopUpContext, type I_AuthContext, type I_PopupContext } from "./store/context";
import Popup from "./component/popup/popup";
import { Header } from "./components/block/header";

import { Button } from "~/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { AlertCircle, RefreshCw , Home } from "lucide-react";


export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<I_PopupContext>({massage: null});
  const [auth, setAuth] = useState<I_AuthContext>({auth: false, firstName: "" , lastName: "", email:"", username:""});


  return (
    <html lang="it" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="backdrop-root"></div>
        <div id="overlay-root"></div>
        <AuthContext.Provider value={[auth,setAuth]}>
          <PopUpContext.Provider value={[popup, setPopup]}>
            {children}
          </PopUpContext.Provider>
        </AuthContext.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <>
    <Popup />
    <Header/>
    <Outlet />
  </>;
}


export function ErrorBoundary({ error }: any) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="min-h-[calc(100vh)] flex items-center justify-center p-4 bg-background ">
      <Card className="w-full max-w-md border-primary/20 shadow-lg text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {is404 ? "Pagina non trovata" : "Qualcosa è andato storto"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {is404
              ? "La pagina che stai cercando non esiste o è stata spostata."
              : "Si è verificato un errore imprevisto. Riprova tra qualche istante o torna alla pagina principale."}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            Ricarica pagina
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="default" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
