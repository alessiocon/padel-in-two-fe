import { Link } from "react-router";
import { 
  LogIn, 
  LogOut,
  Menu, 
  Calendar, 
  Building2, 
  User 
} from "lucide-react";

import { Button } from "./../../components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "./../../components/ui/sheet";

import Logo from "./../../src/logo192.png"
import { useContext} from "react";
import { AuthContext } from "./../../store/context";
import { apiClient } from "./../../client/apiClient";

export function Header() {
    const [auth, setAuth] = useContext(AuthContext);
    async function handleLogOut(e : React.MouseEvent){
        e.preventDefault();
        try{
          const res = await apiClient.logOut();
          if(res.IsSuccess){
            setAuth({auth: false, email:"",firstName:"", lastName:"", username:"",sub: "", playerId: ""});
            window.navigation.reload();
          }
        }catch{}
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-primary">
            <div className="flex h-16 items-center justify-between px-4 max-w-4xl m-auto ">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="h-10 w-10  rounded-lg bg-secondary text-secondary-foreground">
                        <img src={Logo} className="rounded-sm" />
                    </div>
                    <span className="inline font-bold text-xl tracking-tight text-foreground">
                        Padel<span className="text-secondary">In</span>Two
                    </span>
                </Link>

                {/* AZIONI DESTRA (DESKTOP) */}
                <div className="flex items-center gap-4">
                    <Link to={auth.auth ? "/user" : "/auth"}>
                        <Button variant="secondary" className="gap-2 px-4">
                            {auth.auth 
                            ?   <><User className="h-4 w-4" /><p className="hidden md:inline">Profilo</p></>
                            :   <><LogIn className="h-4 w-4" /> <p className="hidden md:inline">Accedi</p></>
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
                                <SheetClose>
                                    <Link to="/clubs" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                        <Building2 className="h-5 w-5 text-primary" /> Club
                                    </Link>
                                </SheetClose>
                                
                                <SheetClose>
                                    <Link to="/user" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                        <Calendar className="h-5 w-5 text-primary" /> Profilo
                                    </Link>
                                </SheetClose>
                                
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
 