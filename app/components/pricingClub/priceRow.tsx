import { formatPrice } from "~/lib/pricing";

export function PriceRow({ label, basePrice, finalPrice }: { label: string; basePrice?: number; finalPrice?: number }) {
  return (
    <li className="flex items-center justify-between py-1 gap-0.5">
      <span className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis">{label}</span>
      {finalPrice !== undefined && (
        <span className="flex items-center gap-1.5 min-w-[5rem]">
          {basePrice !== undefined && basePrice !== finalPrice && (
            <span className="text-muted-foreground line-through">{formatPrice(basePrice)}</span>
          )}
          <span className="font-bold text-primary-foreground">{formatPrice(finalPrice)}</span>
        </span>
      )}
    </li>
  );
}
