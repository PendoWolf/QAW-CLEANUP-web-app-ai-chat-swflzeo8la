import { ApiError } from "../api/client";
import type { NewTrip } from "../api/trips";

// Pendo Track Events. The Pendo agent (window.pendo) attaches the visitor and account
// to every event, so the properties here never include them.
type TrackPropertyValue = string | number | boolean;
export type TrackProperties = Record<string, TrackPropertyValue>;

interface PendoAgent {
  track: (event: string, properties?: TrackProperties) => void;
}

declare global {
  interface Window {
    pendo?: PendoAgent;
  }
}

/** Sends a Pendo Track Event. Does nothing when the Pendo agent isn't loaded, and never throws. */
export function trackEvent(event: string, properties: TrackProperties = {}): void {
  try {
    window.pendo?.track(event, properties);
  } catch {
    // Tracking must never break the app.
  }
}

/** The HTTP status of a failed API call, or 0 when the request never got an answer (network error). */
export function errorStatus(e: unknown): number {
  return e instanceof ApiError ? e.status : 0;
}

/** A short, non-sensitive description of an error, for the error_message property. */
export function errorMessage(e: unknown): string {
  return (e instanceof Error ? e.message : String(e)).slice(0, 100);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The properties every trip event shares. */
export function tripProperties(trip: NewTrip): TrackProperties {
  const days = Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / DAY_MS) + 1;
  return {
    destination: String(trip.destination).slice(0, 60),
    travelers: trip.travelers,
    start_date: trip.startDate,
    end_date: trip.endDate,
    trip_length_days: Number.isFinite(days) ? days : 0,
  };
}
