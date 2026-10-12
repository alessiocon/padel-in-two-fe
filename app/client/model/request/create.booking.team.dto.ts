import type { CreateBookingPlayerDto } from "./create.booking.player.dto";

export class CreateBookingTeamDto {
  teamName: string;
  players: CreateBookingPlayerDto[];
}