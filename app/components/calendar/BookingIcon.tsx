import { Clock, CheckCircle, XCircle, Crown, BadgeX } from "lucide-react";
import type { BookingStatus } from "~/client/model/common/Enum/booking.status.dto";

interface BookingIconProps {
  status: BookingStatus;
  isWinner: boolean | null;
  className?: string;
  title?: string;
}

export function BookingIcon({ status, className = "w-4 h-4", title, isWinner }: BookingIconProps) {
  const baseClasses = `${className}`;

  switch (status) {
    case "END":
      if(isWinner === null) return <CheckCircle className={`${baseClasses} text-secondary`} />;
      
      return (
        isWinner
          ? <Crown className={`${baseClasses} text-primary`} />
          : <BadgeX className={`${baseClasses} text-destructive`} />
      );
    case "CANCELLED":
      return (
        <XCircle className={`${baseClasses} text-destructive`}/>
      );
    case "IN_PROGRESS":
    case "CONFIRMED":
    case "PENDING":
    case "RESERVED":
      return (
        <Clock className={`${baseClasses} text-secondary`} />
      );
    default:
      return (
        <Clock className={`${baseClasses} text-gray-400`}/>
      );
  }
}
