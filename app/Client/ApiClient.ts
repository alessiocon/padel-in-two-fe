import type { CreateBookingDto } from "~/models/booking.dto";
import type {IApiResponse, IBaseApiResponse } from "./Interfaces/IApiResponse";
import type { AuthReqDto } from "./Model/Request/AuthReqDto";
import type { AuthUserResDto } from "./Model/Response/AuthResDto";
import type { BookingResDto } from "./Model/Response/BookingsResDto";
import type { ClubResDto } from "./Model/Response/ClubResDto";
import type { ClubsResDto } from "./Model/Response/ClubsResDto";
import type { UserResDto } from "./Model/Response/UserResDto";



export class ApiClient {
    
    private static getApiBaseUrl(): string {
    // Nel browser, usa la variabile d'ambiente Vite
        if (typeof window !== 'undefined') {
            return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';
        }
        // Nel server, usa la variabile d'ambiente o default backend
        return (process.env.API_BASE_URL || 'http://127.0.0.1:3000/api/') ;
    }

    private static config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
    };
    

    private static async GetFetchAsync(url: string) : Promise<IBaseApiResponse> {

        var baseUrl = this.getApiBaseUrl();
        var fullUrl = baseUrl+url;

        var output : IBaseApiResponse = { Error: null, IsSuccess: false}
        var config: RequestInit = {...this.config, method: "GET"}
        var response = await fetch(fullUrl, config);

        if(!response.ok){
            output.Error = {
                status: response.status,
                statusText: response.statusText,
                message: ""
            }
        }else{
            output.IsSuccess = true;
        }

        return output
    }

    private static async GetFetchOutputAsync<TOutput>(url: string) : Promise<IApiResponse<TOutput>> {

        var baseUrl = this.getApiBaseUrl();
        var fullUrl = baseUrl+url;

        var output : IApiResponse<TOutput> = { Error: null, IsSuccess: false, Data: null}
        var config: RequestInit = {...this.config, method: "GET"}
        var response = await fetch(fullUrl, config);

        if(!response.ok){
            output.Error = {
                status: response.status,
                statusText: response.statusText,
                message: ""
            }
        }else{
            output.IsSuccess = true;
            output.Data = await response.json()
        }

        return output
    }


    private static async PostFetchIOAsync<TInput, TOutput>(url: string, input: TInput) : Promise<IApiResponse<TOutput>> {

        var baseUrl = this.getApiBaseUrl();
        var fullUrl = baseUrl+url;

        var output : IApiResponse<TOutput> = { Error: null, IsSuccess: false, Data: null}
        var config: RequestInit = {...this.config, method: "POST", body: JSON.stringify(input)}

        var response = await fetch(fullUrl, config);

        if(!response.ok){
            output.Error = {
                status: response.status,
                statusText: response.statusText,
                message: ""
            }
        }else{
            output.IsSuccess = true;
            output.Data = await response.json()
        }

        return output
    }

    private static async PostFetchAsync(url: string) : Promise<IBaseApiResponse> {

        var baseUrl = this.getApiBaseUrl();
        var fullUrl = baseUrl+url;

        var output : IBaseApiResponse = { Error: null, IsSuccess: false}
        var config: RequestInit = {...this.config, method: "POST"}

        var response = await fetch(fullUrl, config);

        if(!response.ok){
            output.Error = {
                status: response.status,
                statusText: response.statusText,
                message: ""
            }
        }else{
            output.IsSuccess = true;
        }

        return output
    }




//#region Club
    static async GetClubs() : Promise<IApiResponse<ClubsResDto[]>> {

        return await this.GetFetchOutputAsync("clubs");
    }

    static async GetClub(idClub: string) : Promise<IApiResponse<ClubResDto>> {

        return await this.GetFetchOutputAsync(`clubs/${idClub}`);
    }
//#endregion


//#region Booking
    static async GetBookings(clubId: string, date: string) : Promise<IApiResponse<BookingResDto[]>> {

        return await this.GetFetchOutputAsync(`clubs/${clubId}/bookings?date=${date}`);
    }

    static async CreateBooking(clubId: string ,input: CreateBookingDto) : Promise<IApiResponse<BookingResDto>> {

        return await this.PostFetchIOAsync<CreateBookingDto, BookingResDto>(`clubs/${clubId}/bookings`, input);
    }
//#endregion


//#region User
    static async GetUser() : Promise<IApiResponse<UserResDto>> {

        return await this.GetFetchOutputAsync("users/me");
    }
//#endregion



//#region Auth
    static async Login(input: AuthReqDto) : Promise<IApiResponse<AuthUserResDto>> {

        return await this.PostFetchIOAsync<AuthReqDto, AuthUserResDto>("auth/login", input);
    }

    static async LogOut() : Promise<IBaseApiResponse> {

        return await this.PostFetchAsync("auth/logout");
    }
//#endregion 

}