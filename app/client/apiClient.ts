import type { IApiResponse, IBaseApiResponse } from "./interfaces/IApiResponse";
import type { AuthReqDto } from "./model/request/AuthReqDto";
import type { AuthUserResDto } from "./model/response/AuthResDto";
import type { ClubResDto } from "./model/response/ClubResDto";
import type { ClubsResDto } from "./model/response/ClubsResDto";
import type { UserResDto } from "./model/response/UserResDto";
import type { CreateUserDto } from "./model/request/create.user.dto";
import type { BookingDetailResDto } from "./model/response/booking.detail.res.dto";
import type { CreateBookingDto } from "./model/request/create.booking.dto";
import type { resetPasswordReqDto } from "./model/request/resetPasswordReqDto";
import type { DeleteBookingReqDto } from "./model/request/delete.booking.req.dto";
import type { RestoreBookingStatusReqDto } from "./model/request/restoreBookingStatus.req.dto";
import type { TournamentsResDto } from "./model/response/tournaments.res.dto";
import type { TournamentResDto } from "./model/response/tournament.res.dto";
import type { UpdateMatchReqDto } from "./model/request/update.match.req.dto";
import type { SetPointsMatchReqDto } from "./model/request/set.points.match.res.dto";
import type { TournamentMatchResDto } from "./model/response/tournament.match.res.dto";
import type { UserSearchListReqDto } from "./model/request/user.search.list.dto";
import type { UserSearchListResDto } from "./model/response/user.search.list.res.dto";
import type { UpdateBookingPlayerDto } from "./model/request/update.booking.player.dto";
import type { CreateBookingPlayerDto } from "./model/request/create.booking.player.dto";
import type { RemovePlayerInBookingTeamReqDto } from "./model/request/remove.player.in.bookig.team";
import type { SearchBookingQueryDto } from "./model/request/search.booking.query.dto";
import type { BookingQuickResDto } from "./model/response/booking.quick.res.dto";
import type { BookingMatchResDto } from "./model/response/booking.match.res.dto";
import type { BookingResultProposeDto } from "./model/request/booking.result.dto";
import type { BookingIsAcceptedMatchProposeDto } from "./model/request/booking.accepted.match.propose.dto";
import type { BookingRemoveMatchProposeDto } from "./model/request/match.propose.remove.dto";
import type { PromotionAccountResDto } from "./model/response/promotion.account.res.dto";
import type { CalendarBookingResDto } from "./model/response/calendar.booking.res.dto";

export class apiClient {
  private static getApiBaseUrl(): string {
  let url = "http://localhost:3000/api";
  if (typeof window !== "undefined") {
    url = import.meta.env.VITE_API_BASE_URL || url;
  } else {
    url = process.env.API_BASE_URL || url;
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

private static readonly defaultConfig: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
};

  /**
   * Metodo helper centrale per eseguire tutte le chiamate HTTP.
   * Elimina le duplicazioni di GetFetchAsync, PostFetchIOAsync, ecc.
   */
private static async request<T = void>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<IApiResponse<T>> {
    const baseUrl = this.getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullUrl = `${baseUrl}${cleanEndpoint}`;

    const config: RequestInit = {
      ...this.defaultConfig,
      ...options,
      headers: {
        ...this.defaultConfig.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(fullUrl, config);
      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Nel caso in cui il body di errore non sia un JSON valido
        }

        return {
          IsSuccess: false,
          Data: null as unknown as T,
          Error: {
            status: response.status,
            statusText: response.statusText,
            message: errorMessage,
          },
        };
      }

      // Gestione dei casi 204 No Content o risposte senza body
      if (response.status === 204) {
        return { IsSuccess: true, Data: null as unknown as T, Error: null };
      }
      const data = await response.json();

      return { IsSuccess: true, Data: data as T, Error: null };
    } catch (err: any) {
      // Gestione di errori di rete (offline, CORS, abort)
      return {
        IsSuccess: false,
        Data: null as unknown as T,
        Error: {
          status: 0,
          statusText: "Network Error",
          message: err?.message || "Impossibile contattare il server",
        },
      };
    }
  }

  // ==========================================
  // API Endpoints - Club
  // ==========================================
  static async getClubs(): Promise<IApiResponse<ClubsResDto[]>> {
    return this.request<ClubsResDto[]>("/clubs", { method: "GET" });
  }

  static async getClub(idClub: string): Promise<IApiResponse<ClubResDto>> {
    return this.request<ClubResDto>(`/clubs/${idClub}`, { method: "GET" });
  }

  // ==========================================
  // API Endpoints - Booking
  // ==========================================
  static async getBooking(bookingId: string): Promise<IApiResponse<BookingDetailResDto>> {
    return this.request<BookingDetailResDto>(`/bookings/${bookingId}`, { 
      method: "GET", 
    });
  }

  static async searchBookings(search: SearchBookingQueryDto): Promise<IApiResponse<BookingQuickResDto[]>> {
    const params = new URLSearchParams();
    if (search.from) params.append("from", search.from);
    if (search.to) params.append("to", search.to);
    if (search.clubId) params.append("clubId", search.clubId);
    if (search.status && search.status.length > 0) {
      search.status.forEach(s => params.append("status", s));
    }

    return this.request<BookingQuickResDto[]>(`/bookings/?${params.toString()}`, { method: "GET" });
  }

  static async searchBookingForManager(clubId: string, search: SearchBookingQueryDto): Promise<IApiResponse<BookingQuickResDto[]>> {
    const params = new URLSearchParams();
    if (search.clubId) params.append("clubId", search.clubId);
    if (search.from) params.append("from", search.from);
    if (search.to) params.append("to", search.to);
    if (search.playerId) params.append("userId", search.playerId);
    if (search.status && search.status.length > 0) {
      search.status.forEach(s => params.append("status", s));
    }

    return this.request<BookingQuickResDto[]>(`/bookings/clubs/${clubId}/manager?${params.toString()}`, { method: "GET" });
  }

  static async searchBookingOfUser(search: SearchBookingQueryDto): Promise<IApiResponse<BookingQuickResDto[]>> {
    const params = new URLSearchParams();
    if (search.from) params.append("from", search.from);
    if (search.to) params.append("to", search.to);
    if (search.clubId) params.append("clubId", search.clubId);
    if (search.status && search.status.length > 0) {
      search.status.forEach(s => params.append("status", s));
    }

    return this.request<BookingQuickResDto[]>(`/bookings/user?${params.toString()}`, { method: "GET" });
  }

  static async getCalendarBookings(search: SearchBookingQueryDto): Promise<IApiResponse<CalendarBookingResDto[]>> {
    const params = new URLSearchParams();
    if (search.from) params.append("from", search.from);
    if (search.to) params.append("to", search.to);
    if (search.clubId) params.append("clubId", search.clubId);
    if (search.status && search.status.length > 0) {
      search.status.forEach(s => params.append("status", s));
    }

    return this.request<CalendarBookingResDto[]>(`/bookings/user/calendar?${params.toString()}`, { method: "GET" });
  }

  static async createBooking(input: CreateBookingDto): Promise<IApiResponse<BookingQuickResDto>> {
    return this.request<BookingQuickResDto>(`/bookings`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async createBookingByStaff(input: CreateBookingDto): Promise<IApiResponse<BookingQuickResDto>> {
    return this.request<BookingQuickResDto>(`/bookings/staff`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  // static async updateBooking(bookingId: string, input: updateBookingDto): Promise<IApiResponse<BookingUserResDto>> {
  //   return this.request<BookingUserResDto>(`/bookings/${bookingId}`, { 
  //     method: "PATCH", 
  //     body: JSON.stringify(input)
  //   });
  // }

  static async acceptBooking(bookingId: string): Promise<IApiResponse<BookingQuickResDto>> {
    return this.request<BookingQuickResDto>(`/bookings/${bookingId}/accept`, { 
      method: "PATCH", 
    });
  }

  static async startBooking(bookingId: string): Promise<IApiResponse<BookingQuickResDto>> {
    return this.request<BookingQuickResDto>(`/bookings/${bookingId}/start`, { 
      method: "PATCH", 
    });
  }

  static async deleteBooking(bookingId: string, input: DeleteBookingReqDto): Promise<IApiResponse<BookingDetailResDto>> {
    return this.request<BookingDetailResDto>(`/bookings/${bookingId}`, { 
      method: "DELETE", 
      body: JSON.stringify(input)
    });
  }

  static async restoreBookigStatus(bookingId: string, input: RestoreBookingStatusReqDto ): Promise<IApiResponse<BookingDetailResDto>> {
    return this.request<BookingDetailResDto>(`/bookings/${bookingId}/restore`, { 
      method: "PATCH", 
      body: JSON.stringify(input)
    });
  }

  static async updateBookingPlayer(bookingId: string, input: UpdateBookingPlayerDto): Promise<IApiResponse<BookingDetailResDto>> {
    return this.request<BookingDetailResDto>(`/bookings/${bookingId}/user/isAccepted`, {
     method: "PATCH",
      body: JSON.stringify(input)
    });
  }

  static async inviteBookingPlayer(bookingId: string, input: CreateBookingPlayerDto & { teamId: string }): Promise<IApiResponse<BookingDetailResDto>> {
    return this.request<BookingDetailResDto>(`/bookings/${bookingId}/user/invited`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async removeBookingPlayer(bookingId: string, input: RemovePlayerInBookingTeamReqDto): Promise<IApiResponse<BookingDetailResDto>> {
    return this.request<BookingDetailResDto>(`/bookings/${bookingId}/user/remove`, {
      method: "DELETE",
      body: JSON.stringify(input),
    });
  }


  // ==========================================
  // API Endpoints - Match
  // ==========================================

  static async getMatchOfBooking(bookingId: string): Promise<IApiResponse<BookingMatchResDto>> {
    return this.request<BookingMatchResDto>(`/bookings/${bookingId}/match`, {
      method: "GET",
    });
  }

  static async addMatchPropose(bookingId: string, input: BookingResultProposeDto ): Promise<IApiResponse<BookingMatchResDto>> {
    return this.request<BookingMatchResDto>(`/bookings/${bookingId}/match/propose`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async acceptMatchPropose(bookingId: string, input: BookingIsAcceptedMatchProposeDto ): Promise<IApiResponse<BookingMatchResDto>> {
    return this.request<BookingMatchResDto>(`/bookings/${bookingId}/match/propose`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

    static async deleteMatchPropose(bookingId: string, input: BookingRemoveMatchProposeDto ): Promise<IBaseApiResponse> {
    return this.request(`/bookings/${bookingId}/match/propose`, {
      method: "DELETE",
      body: JSON.stringify(input),
    });
  }


  // ==========================================
  // API Endpoints - User
  // ==========================================
  static async getUser(): Promise<IApiResponse<UserResDto>> {
    return this.request<UserResDto>("/users/me", { method: "GET" });
  }

  static async register(input: CreateUserDto): Promise<IApiResponse<UserResDto>> {
    return this.request<UserResDto>("/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async searchList(input: UserSearchListReqDto ) : Promise<IApiResponse<UserSearchListResDto[]>>{
    return this.request<UserSearchListResDto[]>(`/users/list/?username=${encodeURIComponent(input.username ?? "") }`, {
      method: "GET",
    });
  }

  static async getUserPromotions(): Promise<IApiResponse<PromotionAccountResDto[]>> {
    return this.request<PromotionAccountResDto[]>(`users/me/promotions`, {
      method: "GET",
    });
  }

  // ==========================================
  // API Endpoints - Auth
  // ==========================================
  static async login(input: AuthReqDto): Promise<IApiResponse<UserResDto>> {
    return this.request<UserResDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async sendEmailConfirmation(idUser: string): Promise<IBaseApiResponse> {
    return this.request(`/auth/sendemailconfirmation?tokenId=${idUser}`, {
      method: "GET",
    });
  }

  static async emailConfirmation(idUser: string): Promise<IBaseApiResponse> {
    return this.request(`/auth/emailconfirmation?tokenId=${idUser}`, {
      method: "POST",
    });
  }

  static async sendEmailForgotPassword(email: string): Promise<IBaseApiResponse> {
    return this.request(`/auth/sendemailForgotPassword?email=${email}`, {
      method: "GET",
    });
  }

  static async resetPassword(input: resetPasswordReqDto): Promise<IBaseApiResponse> {
    return this.request(`/auth/resetpassword`, {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  // ==========================================
  // API Endpoints - TOURNAMENT
  // ==========================================
  static async getTournaments(): Promise<IApiResponse<TournamentsResDto[]>> {
    return this.request(`/tournament`, {
      method: "GET",
    });
  }

  static async getTournament(idTournament: string): Promise<IApiResponse<TournamentResDto>> {
    return this.request(`/tournament/${idTournament}`, {
      method: "GET",
    });
  }

  static async getMatches(idTournament: string): Promise<IApiResponse<TournamentMatchResDto[]>> {
    return this.request(`/tournament/${idTournament}/match`, {
      method: "GET",
    });
  }


  static async updateMatch(idTournament: string, idMatch:string, input: UpdateMatchReqDto): Promise<IApiResponse<TournamentMatchResDto>>{
    return this.request(`/tournament/${idTournament}/match/${idMatch}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }

  static async assignPointsMatch(idTournament: string, idMatch:string, input: SetPointsMatchReqDto  ) : Promise<IApiResponse<TournamentMatchResDto>> {
    return this.request(`/tournament/${idTournament}/match/${idMatch}/points`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }

  static async nextMatch(idTournament: string, idMatch:string) : Promise<IApiResponse<TournamentMatchResDto>> {
    return this.request(`/tournament/${idTournament}/match/${idMatch}/next`, {
      method: "PATCH",
    });
  }


  static async logOut(): Promise<IBaseApiResponse> {
    return this.request<void>("/auth/logout", { method: "POST" });
  }
}