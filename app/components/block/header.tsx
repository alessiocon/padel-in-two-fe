import { Link } from "react-router";
import { 
  LogIn, 
  LogOut,
  Menu, 
  Calendar, 
  Building2, 
  User 
} from "lucide-react";

import { Button } from "~/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "~/components/ui/sheet";

import Logo from "./../../src/logo192.png"
import { useContext, type ReactElement } from "react";
import { AuthContext } from "~/store/context";
import { ApiClient } from "~/Client/ApiClient";

export function Header() {
    const [auth, setAuth] = useContext(AuthContext);
    async function handleLogOut(e : React.MouseEvent){
        e.preventDefault();
        try{
          const res = await ApiClient.LogOut();
          if(res.IsSuccess){
            setAuth({auth: false, email:"",firstName:"", lastName:"", username:""});
            window.navigation.reload();
          }
        }catch{}
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4  ">
            
            <Link to="/" className="flex items-center gap-2.5">
                <div className="h-10 w-10  rounded-lg bg-primary text-primary-foreground">
                    <img src={Logo} className="rounded-sm" />
                </div>
                <span className="hidden md:inline font-bold text-xl tracking-tight text-foreground">
                    Padel<span className="text-primary">In</span>Two
                </span>
            </Link>

            {/* AZIONI DESTRA (DESKTOP) */}
            <div className="flex items-center gap-4">
                <Link to={auth.auth ? "/profile" : "/auth"}>
                        <Button variant="default" className="gap-2">
                            {auth.auth 
                            ?   <><User className="h-4 w-4" />  <>Profilo</></>
                            :   <><LogIn className="h-4 w-4" />  <>Accedi</></>
                            }
                        </Button>
                    </Link>

                <Sheet>
                    <SheetTrigger> 
                        <Menu aria-label="Menu" className="h-6 w-6" />
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle className="text-left"> Padel<span className="text-primary">In</span>Two </SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-6 py-6 px-3">
                            <Link to="/clubs" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                <Building2 className="h-5 w-5 text-primary" /> Club
                            </Link>

                            <Link to="/bookings" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                <Calendar className="h-5 w-5 text-primary" /> Prenotazioni
                            </Link>
                            {auth.auth ? (
                                <button
                                    onClick={handleLogOut}
                                    className="flex items-center gap-2 text-sm font-medium text-destructive transition-colors hover:opacity-80 text-left w-full cursor-pointer"
                                >
                                    <LogOut className="h-5 w-5" /> Esci
                                </button>
                            ) : (
                                <SheetClose>
                                    <Link to="/auth" 
                                        className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                                    >
                                        <LogIn className="h-5 w-5 text-primary" /> Accedi
                                    </Link>
                                </SheetClose>
                                
                            )}
                        </div>
                        </SheetContent>
                </Sheet>
            </div>
        </div>
        </header>
    );
}
 