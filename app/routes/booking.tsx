import type { Route } from "./+types/booking";
import { useEffect, useState, type MouseEvent } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { apiClient } from "../client/apiClient";
import type { BookingDetailResDto } from "../client/model/response/booking.detail.res.dto";
import { CardUserPrenotationDetail } from "../components/booking/userPrenotation/card.user.prenotation.detali";
import { BookingStatus } from "../client/model/common/Enum/booking.status.dto";
import { buttonVariants } from "~/components/ui/button";
import { BookingStatusManagement } from "~/components/booking/userPrenotation/booking.status.management";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Dettaglio prenotazione - Padel" },
		{ name: "description", content: "Dettaglio della prenotazione" },
	];
}

export default function BookingPage() {
	const { id: bookingId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [bookings, setBooking] = useState<BookingDetailResDto[] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		let isCurrentRequest = true;

		const fetchBooking = async () => {
			if (!bookingId) {
				setBooking([]);
				setError("Prenotazione non trovata.");
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);
			try {
				const response = await apiClient.getBooking(bookingId);
				if (!isCurrentRequest) return;

				if (!response.IsSuccess || !response.Data) {
					setBooking([]);
					setError(response.Error?.message || "Impossibile caricare la prenotazione.");
					return;
				}

				setBooking([response.Data]);
			} catch {
				if (!isCurrentRequest) return;
				setBooking([]);
				setError("Impossibile caricare la prenotazione.");
			} finally {
				if (isCurrentRequest) setIsLoading(false);
			}
		};

		void fetchBooking();
		return () => {
			isCurrentRequest = false;
		};
	}, [bookingId]);

	const booking = bookings?.find((currentBooking) => currentBooking.id === bookingId) ?? null;

	const handleBackClick = (event: MouseEvent<HTMLAnchorElement>) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		event.preventDefault();
		const historyIndex = window.history.state?.idx;
		if (typeof historyIndex === "number" && historyIndex > 0) {
			navigate(-1);
		} else {
			navigate("/");
		}
	};

	const handleDeleteBooking = async (bookingToDelete: BookingDetailResDto) => {
		if (isDeleting || !window.confirm("Vuoi davvero eliminare questa prenotazione?")) return;

		setIsDeleting(true);
		try {
			const response = await apiClient.deleteBooking(bookingToDelete.id, { isStaff: false});
			if (!response.IsSuccess || !response.Data) {
				window.alert(response.Error?.message || "Impossibile eliminare la prenotazione.");
				return;
			}

			const updatedBooking = response.Data;
			if (updatedBooking.status === BookingStatus.PENDING) {
				setBooking((currentBookings) => currentBookings?.filter((currentBooking) => currentBooking.id !== bookingToDelete.id) ?? null);
			} else {
				setBooking((currentBookings) => currentBookings?.map((currentBooking) => (
					currentBooking.id === bookingToDelete.id
						? { ...currentBooking, status: BookingStatus.CANCELLED, description: updatedBooking.description || currentBooking.description }
						: currentBooking
				)) ?? null);
			}
		} catch {
			window.alert("Errore durante l'eliminazione della prenotazione.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<main className="px-2 text-foreground  md:px-4 lg:px-8 mb-10">
			<div className="mx-auto w-full max-w-4xl">
				{isLoading ? (
					<div className="flex items-center justify-center gap-2 py-16 text-muted-foreground" role="status">
						<LoaderCircle className="h-5 w-5 animate-spin" />
						Caricamento prenotazione...
					</div>
				) : booking ? (<>
				<div className="my-4">
					<Link to="/" onClick={handleBackClick}
						className={`${buttonVariants({ variant: "secondary", size: "sm" })}  w-full md:w-auto max-w-[150px]`}>
						<ArrowLeft className="inline h-4 w-4" /> Indietro
					</Link>
				</div>

				<BookingStatusManagement
					booking={booking}
					onBookingUpdated={(updatedBooking) => setBooking([updatedBooking])}
				/>
					
				<CardUserPrenotationDetail
					bookingState={[booking, setBooking]}
					onDelete={handleDeleteBooking}
				/>
				</>
				) : (
					<p className="py-16 text-center text-muted-foreground" role="status">
						{error || "Prenotazione non trovata."}
					</p>
				)}
			</div>
		</main>
	);
}
