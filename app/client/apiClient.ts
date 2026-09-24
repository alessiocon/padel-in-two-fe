import type { IApiResponse, IBaseApiResponse } from "./interfaces/IApiResponse";
import type { AuthReqDto } from "./model/request/AuthReqDto";
import type { AuthUserResDto } from "./model/response/AuthResDto";
import type { BookingResDto } from "./model/response/BookingsResDto";
import type { ClubResDto } from "./model/response/ClubResDto";
import type { ClubsResDto } from "./model/response/ClubsResDto";
import type { UserResDto } from "./model/response/UserResDto";
import type { CreateUserDto } from "./model/request/CreateUserDto";
import type { BookingUserResDto } from "./model/response/BookingUserResDto";
import type { updateBookingDto } from "./model/request/updateBookingDto";
import type { CreateBookingDto } from "./model/request/CreateBookingDto";
import type { resetPasswordReqDto } from "./model/request/resetPasswordReqDto";

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

  static async getClubManager(idClub: string): Promise<IApiResponse<ClubResDto>> {
    return this.request<ClubResDto>(`/clubs/${idClub}/manager`, { method: "GET" });
  }

  // ==========================================
  // API Endpoints - Booking
  // ==========================================
  static async getBookingsOfClub(clubId: string, date: string): Promise<IApiResponse<BookingResDto[]>> {
    return this.request<BookingResDto[]>(`/bookings/clubs/${clubId}?date=${date}`, { method: "GET" });
  }

  static async getBookingsOfUser(): Promise<IApiResponse<BookingUserResDto[]>> {
    return this.request<BookingUserResDto[]>("/bookings/user", { method: "GET" });
  }

  static async createBooking(clubId: string, input: CreateBookingDto): Promise<IApiResponse<BookingResDto>> {
    return this.request<BookingResDto>(`/bookings/clubs/${clubId}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async updateBooking(bookingId: string, input: updateBookingDto): Promise<IApiResponse<BookingResDto>> {
    return this.request<BookingResDto>(`/bookings/${bookingId}`, { 
      method: "PATCH", 
      body: JSON.stringify(input)
    });
  }

  static async deleteBooking(bookingId: string): Promise<IApiResponse<BookingResDto>> {
    return this.request<BookingResDto>(`/bookings/${bookingId}`, { method: "DELETE" });
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

  // ==========================================
  // API Endpoints - Auth
  // ==========================================
  static async login(input: AuthReqDto): Promise<IApiResponse<AuthUserResDto>> {
    return this.request<AuthUserResDto>("/auth/login", {
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


  static async logOut(): Promise<IBaseApiResponse> {
    return this.request<void>("/auth/logout", { method: "POST" });
  }
}