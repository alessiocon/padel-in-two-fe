import type { ClubRole } from "../common/Enum/club.role";

export type ClubMemberResDto = {
  id: string;
  userId: string;
  clubId: string;
  role: ClubRole;
  permissions: string[];
};