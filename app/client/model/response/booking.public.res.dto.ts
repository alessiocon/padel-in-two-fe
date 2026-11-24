import type { BookingJoinMode } from "../common/Enum/booking.join.mode";
import type { BookingStatus } from "../common/Enum/booking.status.dto";
import type { PublicBookingTeamResDto } from "./booking.team.public.dto";

export class PublicBookingResDto {
  id: string;
  courtSize: number;
  isCourtIndoor: boolean;
  status: BookingStatus;
  startsAt: string;
  price: number;
  joinMode: BookingJoinMode;
  minPlayerLevel: number | null;
  maxPlayerLevel: number | null;
  teams: PublicBookingTeamResDto[];
}