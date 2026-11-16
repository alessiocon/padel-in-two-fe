import { Link, Navigate } from "react-router";

import {
  ArrowRight,
  Gift,
  Star,
  Trophy,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import padelHero from "./../src/padel-hero.png"

export default function HomePage() {
  return (<>

    <div className="pb-6">
        <section className="relative min-h-[75vh] overflow-hidden">
        {/* Immagine di sfondo */}
            <div className="absolute inset-0">
                <img
                    src={padelHero}
                    alt="Padel"
                    className="h-full w-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-primary/75" />
            </div>

            {/* Contenuto */}
            <div className="relative z-10 flex min-h-[75vh] flex-col px-6 py-12">
                <div className="mt-auto mb-auto max-w-3xl">
                    <h2 className="text-4xl font-extrabold leading-none text-white md:text-6xl">
                        Gioca a padel e <span className="text-secondary">ricevi premi</span> divertendoti
                    </h2>

                    <p className="mt-8 mb-2 max-w-xl text-2xl font-extrabold text-white">
                        Prenota, accumula punti e ricevi premi esclusivi!
                    </p>
                    <Link className={`${buttonVariants({ variant: "secondary" })}`} to="/clubs">
                        Vai ai Club <ArrowRight className="ml-1 h-5 w-5 inline" />
                    </Link>
                </div>
            </div>
        </section>

        <div className="max-w-3xl mx-auto">
            <section className="container mx-auto px-5 py-13">
                <h2 className="my-6 text-3xl font-bold">
                    Padel<span className="text-primary">In</span>Two
                </h2>

                <p className="text-muted-foreground text-xl">
                    La piattaforma che ti permette di <span className="bg-secondary text-white font-bold">prenotare campi da padel</span>,
                    scoprire club e usufruire di <span className="bg-secondary text-white font-bold">vantaggi esclusivi</span>.
                    <br/>
                    Gioca dove preferisci, accumula benefici e approfitta delle <span className="bg-secondary text-white font-bold">promozioni</span> disponibili nei club aderenti.
                </p>
            </section>

            <section className="container mx-auto px-5 mb-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">
                            Promozioni attive
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 text-xl">
                            Scopri tutti i vantaggi disponibili nei club aderenti.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-0 py-2 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/20">
                            <CardContent className="p-4 py-2">
                                <h3 className="mb-3 text-xl font-semibold">
                                    <Star className="mb-3 h-10 w-10 text-yellow-500 inline mr-2" /> Club Fedeltà 
                                </h3>

                                <p>
                                    Prenota nei club contrassegnati con una stella <Star className="mb-1 h-4 w-4 text-yellow-500 inline" />, concludi la partita e accumula punti che ti permetteranno di ottenere premi.
                                </p>

                                <p className="mt-4 text-sm font-medium">
                                    10 punti = 1 tubo di palline in regalo
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 py-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20">
                            <CardContent className="p-4 py-2">
                                <h3 className="mb-3 text-xl font-semibold">
                                    <Gift className="mb-3 h-10 w-10 text-green-600 inline mr-2" /> Pale Gratis
                                </h3>

                                <p>
                                    Nei club segnalati con il simbolo regalo <Gift className="mb-1 h-4 w-4 text-green-600 inline" /> il noleggio delle pale
                                    è completamente gratuito.
                                </p>

                                <p className="mt-4 text-sm font-medium">
                                    Nessun costo aggiuntivo per giocare
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 py-2 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950/40 dark:to-sky-900/20">
                            <CardContent className="p-4 py-2">
                                <h3 className="mb-3 text-xl font-semibold">
                                    <Trophy className="mb-3 h-10 w-10 text-sky-600 inline mr-2" /> Nuove iniziative                                
                                </h3>

                                <p>
                                    Stiamo lavorando a nuove promozioni e vantaggi per rendere ogni
                                    partita ancora più conveniente. <Trophy className="mb-1 h-4 w-4 text-sky-600 inline" /> 
                                </p>

                                <p className="mt-4 text-sm font-medium">Resta aggiornato sulle novità </p>
                            </CardContent>
                        </Card>
                    </div>
            </section>
        </div>
    </div>

    <section className="bg-primary pb-20">
            <div className="px-6 text-left py-8 md:text-center text-primary-foreground">
                <h2 className="text-2xl font-bold">
                    Scendi in campo!
                </h2>

                <p className="mx-auto text-md mt-4 max-w-2xl text-primary-foreground/80">
                    Prenota la tua prossima partita <br/> e inizia a sfruttare tutti i
                    vantaggi disponibili su Padel<span className="text-secondary">In</span>Two.
                </p>

                <div className="block  text-end md:text-center mt-4">
                    <Link className={`${buttonVariants({ variant: "secondary" })}`} to="/clubs">
                        Vai ai Club <ArrowRight className="ml-1 h-5 w-5 inline" />
                    </Link>
                </div>
            </div>
    </section>
  </>

  );
}