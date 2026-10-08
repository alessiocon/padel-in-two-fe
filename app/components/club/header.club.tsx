import { ShieldCheck, MapPin } from "lucide-react";
import type { ClubResDto } from "../../client/model/response/ClubResDto";
import { Skeleton } from "../ui/skeleton";
import { useContext } from "react";
import { AuthContext } from "../../store/context";
import { Link } from "react-router";

export function HeaderClub({club} :  {club :ClubResDto | null}) {
    const [auth, setAuth] = useContext(AuthContext);

   return <div className="mb-2 mt-2 flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
        {!club &&
            <div className="flex flex-col items-center md:items-start gap-2.5">
                <Skeleton className="h-7 md:h-9 w-64 md:w-80" />
                <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <Skeleton className="h-4 w-48 md:w-64" />
                </div>
            </div>
        }
        
        {club &&
          <div>
            <h1 className="text-xl text-center md:text-3xl md:text-start font-extrabold tracking-tight">{club.name}</h1>
            <div className="flex justify-center md:justify-start items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center md:text-left">{club.position}</p>
            </div>
          </div>
        }

        {club && auth.id === club.ownerId && (
          <Link
            to="./manager"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shrink-0"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Area Manager</span>
          </Link>
        )}
    </div>
}