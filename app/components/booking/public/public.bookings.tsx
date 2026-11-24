import { useEffect, useState, useContext } from "react";
import { apiClient } from "~/client/apiClient";
import type { PublicBookingResDto } from "~/client/model/response/booking.public.res.dto";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Link, useNavigate } from "react-router";
import { Globe, BicepsFlexed, Clock, Users, DoorOpen, DoorClosed, UserCheck, UserX } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { AuthContext } from "~/store/context";

interface PublicBookingsProps {
  clubId: string;
}

export function PublicBookings({ clubId }: PublicBookingsProps) {
  const [bookings, setBookings] = useState<PublicBookingResDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth] = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {

    setIsLoading(true);
    setError(null);
    try{
      apiClient.searchPublicBookings({ clubId })
        .then(async response => {
          if (!response.IsSuccess) {
            setError(response.Error?.message ?? "Errore nel caricamento delle partite pubbliche");
            setBookings([]);
            return;
          };
          
          if(response.Data) setBookings(response.Data);
        })
        .finally(() => setIsLoading(false));

    }catch(err){
      setError("Errore nel caricamento delle partite pubbliche");
      console.error(err);
      setBookings([]);
      setIsLoading(false);
    }
  }, [clubId]);

  const handlePartecipaClick = (booking: PublicBookingResDto) => {
    if (!auth?.auth) {
      window.alert("Devi effettuare l'accesso per partecipare");
      navigate("/auth");
      return;
    }

    // Naviga direttamente alla pagina di booking
    navigate(`/booking/${booking.id}`);
  };


  return (
    <>
      <div className="lg:col-span-3 space-y-4 bg-card p-2 ">
        <h2 className="text-xl font-bold gap-2 py-3 px-2 mb-0 text-center">
          <Globe className="w-5 h-5 inline mr-1 mb-1" />
          Partite Pubbliche
        </h2>


        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Caricamento in corso...
          </div>
        )}

        {!isLoading && bookings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nessuna partita pubblica disponibile al momento
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow bg-background gap-1 py-2">
              <CardHeader className="pb-1 px-2">
                <p className="flex items-start justify-between gap-2">
                  {booking.joinMode === "OPEN" ? "Accesso Diretto" : "Richiede Approvazione"}
                </p>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2 justify-between px-2 max-w-[260px]">
                {/* Data e Orario */}
                <div>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground inline mr-1 mb-1" />
                  <span>
                    {new Date(booking.startsAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit" })} -{" "}
                    {new Date(booking.startsAt).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>                  
                </div>

                <div>
                  {booking.isCourtIndoor 
                    ? <><DoorClosed className="w-3.5 h-3.5 text-muted-foreground inline mr-1 mb-1" /><span>Indoor</span></> 
                    : <><DoorOpen className="w-3.5 h-3.5 text-muted-foreground inline mr-1 mb-1" /><span>Outdoor</span></>
                  }
                </div>
      
                {/* Livello Consigliato */}
                <div className="text-sm">
                  <BicepsFlexed className="w-3.5 h-3.5 text-muted-foreground inline mr-1 mb-1" />
                  <span>
                    {booking.minPlayerLevel}{" "}
                    {booking.maxPlayerLevel && booking.minPlayerLevel !== booking.maxPlayerLevel
                      ? `- ${booking.maxPlayerLevel}`
                      : ""}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 px-2 block">
                <div className="grid grid-cols-2 w-full">
                  <span className="text-sm font-semibold">
                    {booking.price.toFixed(2)}€
                  </span>

                  <div className="flex items-center w-full justify-end gap-4">
                    {booking.teams.map((team, teamIdx) => (
                      <div key={`team-${teamIdx}`} className="flex items-cente">
                        {/* Giocatori del team */}
                        {Array.from({ length: team.occupiedSlots }).map((_, idx) => (
                          <UserCheck key={`team-${teamIdx}-occupied-${idx}`} className="w-4 h-4 text-primary" />
                        ))}
                        
                        {/* Slot vuoti del team */}
                        {Array.from({ length: team.availableSlots }).map((_, idx) => (
                          <UserX key={`team-${teamIdx}-empty-${idx}`} className="w-4 h-4 text-secondary" />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={() => handlePartecipaClick(booking)}
                  disabled={
                    booking.teams.reduce((acc, team) => acc + team.occupiedSlots, 0) >=
                    booking.teams.reduce((acc, team) => acc + team.occupiedSlots + team.availableSlots, 0)
                  }
                >
                  {booking.teams.reduce((acc, team) => acc + team.occupiedSlots, 0) >=
                  booking.teams.reduce((acc, team) => acc + team.occupiedSlots + team.availableSlots, 0)
                    ? "Posti Esauriti"
                    : "Partecipa"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
