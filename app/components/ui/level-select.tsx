import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

export const PLAYER_LEVELS = [
  { value: 1, label: "Principiante" },
  { value: 2, label: "Intermedio Base" },
  { value: 3, label: "Intermedio" },
  { value: 4, label: "Intermedio Avanzato" },
  { value: 5, label: "Avanzato Base" },
  { value: 6, label: "Avanzato" },
  { value: 7, label: "Agonista" },
];

interface LevelSelectProps {
  id?: string;
  value?: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  reverse?: boolean;
  disabledValues?: number[];
}

export function LevelSelect({
  id,
  value,
  onChange,
  placeholder = "Seleziona livello",
  className,
  reverse = false,
  disabledValues = [],
}: LevelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id ?? `level-select-${generatedId}`;
  const listboxId = `${selectId}-listbox`;

  const selectedLevel = PLAYER_LEVELS.find(
    (level) => level.value === value
  );
  const levels = reverse ? [...PLAYER_LEVELS].reverse() : PLAYER_LEVELS;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className="min-w-0 truncate text-sm">
          {selectedLevel ? (
            <>
              <span className="font-medium">{selectedLevel.value}</span>
              <span className="text-muted-foreground">
                {" "}
                - {selectedLevel.label}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute top-full z-50 mt-1 max-h-64 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border border-input bg-background shadow-lg",
            reverse ? "right-0" : "left-0"
          )}
        >
          {levels.map((level) => {
            const isDisabled = disabledValues.includes(level.value);
            const isSelected = value === level.value;

            return (
              <button
                key={level.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;

                  onChange(level.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-accent",
                  isSelected && "bg-accent font-medium"
                )}
              >
                <span className="font-medium">{level.value}</span>
                <span className="text-muted-foreground">
                  - {level.label}
                </span>

                {isSelected && (
                  <span className="ml-auto text-primary" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}