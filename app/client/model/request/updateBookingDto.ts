import type { bookingStatus } from "../common/Enum/booking.status.dto";

export class updateBookingDto {
  clubId: string;
  status: bookingStatus;
}