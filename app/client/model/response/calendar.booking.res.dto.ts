import type { BookingStatus } from "../common/Enum/booking.status.dto";

export class CalendarBookingResDto {
  id: string;
  clubId: string;
  clubName: string;
  isCourtIndoor: boolean;

  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  price: number;
  isPlayer: boolean;
  win: boolean;
  team1?: string;
  team2?: string;
  setTeam1?: number;
  setTeam2?: number;
}
