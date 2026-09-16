import { Loader2 } from "lucide-react";

interface FullPageLoaderProps {
  label?: string;
}

export function FullPageLoader({ label = "Caricamento in corso..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {label}
        </p>
      </div>
    </div>
  );
}