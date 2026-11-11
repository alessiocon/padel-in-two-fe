import { formatPrice } from "~/lib/pricing";

export function PriceRow({ label, basePrice, finalPrice }: { label: string; basePrice?: number; finalPrice?: number }) {
  return (
    <li className="flex items-center justify-between py-1">
      <span>{label}</span>
      {finalPrice !== undefined && (
        <span className="flex items-center gap-1.5">
          {basePrice !== undefined && basePrice !== finalPrice && (
            <span className="text-muted-foreground line-through">{formatPrice(basePrice)}</span>
          )}
          <span className="font-bold text-primary">{formatPrice(finalPrice)}</span>
        </span>
      )}
    </li>
  );
}
