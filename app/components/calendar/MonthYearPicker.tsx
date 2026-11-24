import { Input } from "~/components/ui/input";

interface MonthYearPickerProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

export function MonthYearPicker({
  month,
  year,
  onMonthChange,
}: MonthYearPickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [selectedYear, selectedMonth] = e.target.value.split("-");
    if (selectedYear && selectedMonth) {
      onMonthChange(parseInt(selectedMonth) - 1, parseInt(selectedYear));
    }
  };

  const dateValue = `${year}-${String(month + 1).padStart(2, "0")}`;

  return (
      <input
        type="month"
        value={dateValue}
        onChange={handleChange}
        className="px-3 py-2 border border-foreground bg-background text-foreground justify-self-end"
      />
  );
}
