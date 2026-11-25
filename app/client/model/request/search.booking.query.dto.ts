import type { BookingStatus } from "../common/Enum/booking.status.dto";

export class SearchBookingQueryDto {
   from?: string;
   to?: string;
   clubId?: string;
   createdById?: string;
   playerId?: string;
   member?: string; 
   status?: BookingStatus[];
   skip?: number;
   take?: number;
}