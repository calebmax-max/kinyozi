export const SLOT_INTERVAL_MINUTES = 10;

export const SERVICE_DURATIONS: Record<string, number> = {
  shave: 5,
  haircut: 10,
  haircut_and_shave: 15,
};

export function getServiceDurationMinutes(service: string) {
  return SERVICE_DURATIONS[service] ?? 30;
}

export const SERVICE_OPTIONS = [
  { value: 'haircut', label: 'Haircut', duration: SERVICE_DURATIONS.haircut },
  { value: 'shave', label: 'Shave', duration: SERVICE_DURATIONS.shave },
  {
    value: 'haircut_and_shave',
    label: 'Haircut + Shave',
    duration: SERVICE_DURATIONS.haircut_and_shave,
  },
];
