import type { bookingStatus } from "../common/Enum/booking.status.dto";

export class SearchBookingQueryDto {
   from?: string;
   to?: string;
   clubId?: string;
   userId?: string;
   status?: bookingStatus
}