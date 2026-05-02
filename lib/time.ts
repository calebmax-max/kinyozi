import { SLOT_INTERVAL_MINUTES } from './services';

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number(part));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error('Invalid time format. Use HH:MM.');
  }

  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function buildTimeRange(startTime: string, durationMinutes: number) {
  const startMinutes = timeToMinutes(startTime);
  const slotsNeeded = Math.max(1, Math.ceil(durationMinutes / SLOT_INTERVAL_MINUTES));

  return Array.from({ length: slotsNeeded }, (_, index) =>
    minutesToTime(startMinutes + index * SLOT_INTERVAL_MINUTES),
  );
}

export function calculateEndTime(startTime: string, durationMinutes: number) {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}
