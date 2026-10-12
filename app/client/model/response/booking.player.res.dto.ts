import type { BookingPlayerStatus } from "../common/Enum/booking.player.status";

export class BookingPlayerResDto{
  id: string;
  username?: string;
  userId?: string;
  status: BookingPlayerStatus;
  type: 'GUEST' | 'REGISTERED';
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}