import type { BookingPlayerStatus } from "../common/Enum/booking.player.status";

export class PublicJoinResultDto {
  bookingId: string;
  teamId: string;
  status: BookingPlayerStatus;
}