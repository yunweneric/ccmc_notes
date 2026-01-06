/**
 * Date utility functions for converting between Date objects and DateString format.
 * All dates are stored as ISO 8601 strings (DateString format) in Firestore.
 */

/**
 * Convert a Date object to an ISO 8601 date string (DateString format).
 * @param date - The Date object to convert
 * @returns ISO 8601 date string
 */
export function toDateString(date: Date): string {
  return date.toISOString();
}

/**
 * Convert an ISO 8601 date string (DateString format) to a Date object.
 * @param dateString - The ISO 8601 date string to convert
 * @returns Date object
 */
export function fromDateString(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get the current date as an ISO 8601 date string (DateString format).
 * @returns Current date as ISO 8601 string
 */
export function getCurrentDateString(): string {
  return toDateString(new Date());
}

