import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./../components/ui/card";
import { Button } from "./../components/ui/button";
import { Sparkles, Building2 } from "lucide-react";

export function CardUpcomingClubs() {
  return (
    <Card className="w-[350px] h-[254px] bg-card/50 border-2 border-dashed border-primary/30 flex flex-col justify-between hover:border-primary/60 transition-colors">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          Prossimamente
        </CardTitle>
        <CardDescription className="text-xs pt-1 text-muted-foreground">
          Nuove strutture in arrivo su PadelInTwo
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center text-center space-y-2 my-auto">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Building2 className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground max-w-[220px]">
          Stiamo affiliando nuovi circoli nella tua zona.
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-2 pt-2 border-t border-border/40">
        <span className="text-xs text-muted-foreground italic">
          Gestisci un circolo?
        </span>
        <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
          Unisciti a noi
        </Button>
      </CardFooter>
    </Card>
  );
}