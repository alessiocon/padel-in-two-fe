
export enum ClubStatus { ACTIVE = "active", INACTIVE = "inactive" }
export enum CourtStatus { AVAILABLE = "available", RESERVED = "reserved", MAINTENANCE = "maintenance", INACTIVE = "inactive" }

export interface CourtDto {
  id: string;
  clubId: string;
  name: string;
  isIndoor: boolean;
  price: number;
  isOccupied: boolean;
  status: CourtStatus;
}

export interface ClubDto {
    id: string;
    name: string;
    email: string;
    ownerId: string;
    openingTime: string; // "08:00"
    closingTime: string; // "23:00"
    racketPrice: number;
    slotDurationMinutes: number; // 90
    courtCount: number;
    status: ClubStatus; // "active"
    timezone: string; // "Europe/Rome"
    position: string;
    courts: CourtDto[];
}

export interface ClubDetailDto {
  id: string;
  name: string;
  email: string;
  openingTime: string;
  closingTime: string;
  racketPrice: number;
  slotDurationMinutes: number;
  timezone: string;
  position: string;
  courts: CourtDto[];
}