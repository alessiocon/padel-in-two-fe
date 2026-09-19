import { Link } from "react-router";
import { Building2, Home, Calendar, MessageCircle } from "lucide-react";
import Logo from "./../../src/logo192.png";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-background text-foreground mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    
                    {/* SEZIONE 1: BRAND */}
                    <div className="flex flex-col gap-3">
                        <Link to="/" className="flex items-center gap-2.5 w-fit">
                            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                                <img src={Logo} alt="PadelInTwo Logo" className="rounded-sm h-full w-full object-cover" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                Padel<span className="text-primary">In</span>Two
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            La piattaforma dedicata agli appassionati di padel per trovare club, prenotare campi e organizzare partite in pochi click.
                        </p>
                    </div>

                    {/* SEZIONE 2: NAVIGAZIONE */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">
                            Esplora
                        </h3>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link 
                                    to="/" 
                                    className="inline-flex items-center gap-2 transition-colors hover:text-primary text-foreground/80 font-medium"
                                >
                                    <Home className="h-4 w-4 text-primary" />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/" 
                                    className="inline-flex items-center gap-2 transition-colors hover:text-primary text-foreground/80 font-medium"
                                >
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <span>Club Affiliati</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/user" 
                                    className="inline-flex items-center gap-2 transition-colors hover:text-primary text-foreground/80 font-medium"
                                >
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Le mie Prenotazioni</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* SEZIONE 3: DIVENTA UN NOSTRO PARTNER (INSTAGRAM) */}
                    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card/50">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base text-card-foreground">
                                Diventa un nostro partner
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Gestisci un club o dei campi da padel? Contattaci su Instagram per affiliarti e far crescere la tua struttura.
                        </p>
                        <div className="pt-1">
                            <a 
                                href="https://instagram.com/padelintwo" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>@padelintwo</span>
                            </a>
                        </div>
                    </div>

                </div>

                {/* BOTTOM BAR / COPYRIGHT */}
                <div className="border-t pt-6 text-center md:text-left text-xs text-muted-foreground">
                    <p>© {currentYear} PadelInTwo. Tutti i diritti riservati.</p>
                </div>
            </div>
        </footer>
    );
}