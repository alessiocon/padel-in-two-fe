import type { CourtStatusDto } from "./Enum/CourtStatusDto";

export type ClubCourtDto = {
  id: string;
  clubId: string;
  name: string;
  isIndoor: boolean;
  price: number;
  status: CourtStatusDto;
  offsetMinutes: number;
};