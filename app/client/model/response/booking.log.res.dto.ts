import type { BookingEventType } from "../common/Enum/booking.event.type";

export class BookingLogResDto{
  eventType: BookingEventType;
  message: string;
  username: string | null;
  createdAt: string;
}