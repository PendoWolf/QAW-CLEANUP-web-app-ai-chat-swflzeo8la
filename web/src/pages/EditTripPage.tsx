import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { trackEvent, tripProperties } from "../analytics/pendo";
import { tripsApi, type NewTrip, type Trip } from "../api/trips";
import { TripForm } from "../components/TripForm";

/** Edits an existing trip's destination, dates and travelers, then goes back to the trip list. */
export function EditTripPage() {
  const { tripId = "" } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi
      .get(tripId)
      .then(setTrip)
      .catch((e: Error) => setError(e.message));
  }, [tripId]);

  const saveTrip = async (changes: NewTrip) => {
    try {
      setError(null);
      const updated = await tripsApi.update(tripId, changes);
      // The API saved the changes. Tracked before navigating back to the list.
      trackEvent("Trip updated", {
        trip_id: updated.id,
        ...tripProperties(changes),
        // The form only shows once the trip has loaded, so `trip` holds the values before the edit.
        destination_changed: trip?.destination !== changes.destination,
        dates_changed: trip?.startDate !== changes.startDate || trip?.endDate !== changes.endDate,
        travelers_changed: trip?.travelers !== changes.travelers,
      });
      navigate("/trips");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (error && !trip) {
    return (
      <p className="error">
        {error} <Link to="/trips">Back to your trips</Link>
      </p>
    );
  }
  if (!trip) {
    return <p>Loading trip…</p>;
  }
  return (
    <>
      <TripForm
        heading={`Edit ${trip.destination}`}
        submitLabel="Save changes"
        initialTrip={trip}
        onSubmit={saveTrip}
      />
      {error && <p className="error">{error}</p>}
    </>
  );
}
