import type { BookingPlayerResDto } from "./booking.player.res.dto";

export class BookingTeamResDto{
  id: string;
  teamNumber: number;
  teamName: string;  
  players: BookingPlayerResDto[];
}