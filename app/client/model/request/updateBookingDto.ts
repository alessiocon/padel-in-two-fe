import type { bookingStatus } from "./../common/Enum/bookingStatusDto";

export class updateBookingDto {
  clubId: string;
  status: bookingStatus;
}