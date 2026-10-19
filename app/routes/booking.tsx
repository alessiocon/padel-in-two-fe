import type { Route } from "./+types/booking";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useParams } from "react-router";
import { apiClient } from "../client/apiClient";
import { bookingStatus } from "../client/model/common/Enum/booking.status.dto";
import type { BookingDetailResDto } from "../client/model/response/booking.detail.res.dto";
import { CardUserPrenotationDetail } from "../components/booking/userPrenotation/card.user.prenotation.detali";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Dettaglio prenotazione - Padel" },
		{ name: "description", content: "Dettaglio della prenotazione" },
	];
}

export default function BookingPage() {
	const { id: bookingId } = useParams<{ id: string }>();
	const [bookings, setBookings] = useState<BookingDetailResDto[] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		let isCurrentRequest = true;

		const fetchBooking = async () => {
			if (!bookingId) {
				setBookings([]);
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
					setBookings([]);
					setError(response.Error?.message || "Impossibile caricare la prenotazione.");
					return;
				}

				setBookings([response.Data]);
			} catch {
				if (!isCurrentRequest) return;
				setBookings([]);
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

	const handleDeleteBooking = async (bookingToDelete: BookingDetailResDto) => {
		if (isDeleting || !window.confirm("Vuoi davvero eliminare questa prenotazione?")) return;

		setIsDeleting(true);
		try {
			const response = await apiClient.deleteBooking(bookingToDelete.id, { isStaff: false });
			if (!response.IsSuccess || !response.Data) {
				window.alert(response.Error?.message || "Impossibile eliminare la prenotazione.");
				return;
			}

			const updatedBooking = response.Data;
			if (updatedBooking.status === bookingStatus.PENDING) {
				setBookings((currentBookings) => currentBookings?.filter((currentBooking) => currentBooking.id !== bookingToDelete.id) ?? null);
			} else {
				setBookings((currentBookings) => currentBookings?.map((currentBooking) => (
					currentBooking.id === bookingToDelete.id
						? { ...currentBooking, status: bookingStatus.CANCELLED, description: updatedBooking.description || currentBooking.description }
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
		<main className="min-h-screen bg-background p-4 text-foreground md:p-8">
			<div className="mx-auto w-full max-w-4xl">
				{isLoading ? (
					<div className="flex items-center justify-center gap-2 py-16 text-muted-foreground" role="status">
						<LoaderCircle className="h-5 w-5 animate-spin" />
						Caricamento prenotazione...
					</div>
				) : booking ? (
					<CardUserPrenotationDetail
						bookingState={[booking, setBookings]}
						onDelete={handleDeleteBooking}
					/>
				) : (
					<p className="py-16 text-center text-muted-foreground" role="status">
						{error || "Prenotazione non trovata."}
					</p>
				)}
			</div>
		</main>
	);
}
