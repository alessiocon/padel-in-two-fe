import { useEffect, useState, type RefObject } from "react";

export interface ILineTournamentBracket {
  fromMatchId: string;
  toMatchId: string;
}

interface LineTournamentBracketProps {
  fromRef: RefObject<HTMLDivElement | null>;
  toRef: RefObject<HTMLDivElement | null>;
}

export const LineTournamentBracket: React.FC<LineTournamentBracketProps> = ({ fromRef, toRef }) => {
  const [coords, setCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  useEffect(() => {
    const updateCoords = () => {
      if (fromRef.current && toRef.current) {
        const fromRect = fromRef.current.getBoundingClientRect();
        const toRect = toRef.current.getBoundingClientRect();
        const parentElement = fromRef.current.closest('.bracket-container');

        if (!parentElement) return;
        const parentRect = parentElement.getBoundingClientRect();

        const x1 = fromRect.right - parentRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - parentRect.top;

        const x2 = toRect.left - parentRect.left;
        const y2 = toRect.top + toRect.height / 2 - parentRect.top;

        setCoords({ x1, y1, x2, y2 });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    const observer = new ResizeObserver(updateCoords);
    
    if (fromRef.current) observer.observe(fromRef.current);
    if (toRef.current) observer.observe(toRef.current);

    return () => {
      window.removeEventListener('resize', updateCoords);
      observer.disconnect();
    };
  }, [fromRef, toRef]);

  if (!coords) return null;

  const { x1, y1, x2, y2 } = coords;
  const midX = x1 + (x2 - x1) / 2;

  const pathData = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;

  return (
    <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full text-muted-foreground">
        <path
            d={pathData}
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="1"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="bevel"
        />
    </svg>
  );
};