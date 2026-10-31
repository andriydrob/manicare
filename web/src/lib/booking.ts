import type { ServiceId } from '../data/content';

export interface BookingIntent { serviceId?: ServiceId; masterId?: string; serviceIds?: ServiceId[] }
export const BOOKING_EVENT = 'manicare:book';

export function openBooking(detail: BookingIntent = {}) {
  window.dispatchEvent(new CustomEvent<BookingIntent>(BOOKING_EVENT, { detail }));
}