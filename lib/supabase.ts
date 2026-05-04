import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { calculateEndTime, timeToMinutes } from './time';
import { getServiceDurationMinutes } from './services';

export type Barber = {
  id: string;
  name: string;
  phone: string;
  shop_name: string;
  email: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  barber_id: string;
  requested_barber_id: string | null;
  customer_name: string;
  customer_phone: string;
  service: string;
  day: string;
  time_slot: string;
  end_time: string;
  duration_minutes: number;
  reassigned: boolean;
  status: string;
  created_at: string;
};

export type BookingWithBarberName = Booking & {
  barber_name: string | null;
  requested_barber_name: string | null;
};

export type BarberAuthRecord = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

export type AdminAuthRecord = {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
};

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

function isMissingDatabaseFieldError(message: string) {
  return (
    message.includes('does not exist') ||
    message.includes('Could not find a relationship') ||
    message.includes('schema cache')
  );
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getEnv(
  name:
    | 'NEXT_PUBLIC_SUPABASE_URL'
    | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    | 'SUPABASE_SERVICE_ROLE_KEY',
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(
      getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    );
  }

  return browserClient;
}

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return adminClient;
}

export async function getBarbers(): Promise<Barber[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const { data, error } = await getSupabaseAdmin()
    .from('barbers')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((item) => ({
    id: String(item.id),
    name: String(item.name),
    phone: String(item.phone),
    shop_name: String(item.shop_name),
    email: typeof item.email === 'string' ? item.email : null,
    created_at: String(item.created_at),
  }));
}

export async function createBarber(input: {
  name: string;
  phone: string;
  shop_name: string;
  email: string;
  password_hash: string;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from('barbers')
    .insert(input)
    .select('id,name,phone,shop_name,email,created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Barber;
}

export async function attachBarberLogin(input: {
  barber_id: string;
  email: string;
  password_hash: string;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from('barbers')
    .update({ email: input.email, password_hash: input.password_hash })
    .eq('id', input.barber_id)
    .select('id,name,phone,shop_name,email,created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Barber;
}

export async function createBooking(input: Omit<Booking, 'id' | 'created_at'>) {
  let { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .insert(input)
    .select('*')
    .single();

  if (error && isMissingDatabaseFieldError(error.message)) {
    const legacyInsert = {
      barber_id: input.barber_id,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      service: input.service,
      day: input.day,
      time_slot: input.time_slot,
      status: input.status,
    };

    const retry = await getSupabaseAdmin()
      .from('bookings')
      .insert(legacyInsert)
      .select('*')
      .single();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listBookings(barberId?: string): Promise<BookingWithBarberName[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  let query = getSupabaseAdmin()
    .from('bookings')
    .select('*, barbers!bookings_barber_id_fkey(name), requested_barber:barbers!bookings_requested_barber_id_fkey(name)')
    .order('created_at', { ascending: false });

  if (barberId) {
    query = query.eq('barber_id', barberId);
  }

  let { data, error } = await query;

  if (error && isMissingDatabaseFieldError(error.message)) {
    let fallbackQuery = getSupabaseAdmin()
      .from('bookings')
      .select('*, barbers(name)')
      .order('created_at', { ascending: false });

    if (barberId) {
      fallbackQuery = fallbackQuery.eq('barber_id', barberId);
    }

    const fallback = await fallbackQuery;
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((item) => {
    const service = String(item.service);
    const durationMinutes =
      typeof item.duration_minutes === 'number'
        ? item.duration_minutes
        : getServiceDurationMinutes(service);

    return {
      id: String(item.id),
      barber_id: String(item.barber_id),
      requested_barber_id:
        typeof item.requested_barber_id === 'string' ? item.requested_barber_id : null,
      customer_name: String(item.customer_name),
      customer_phone: String(item.customer_phone),
      service,
      day: String(item.day),
      time_slot: String(item.time_slot),
      end_time:
        typeof item.end_time === 'string'
          ? item.end_time
          : calculateEndTime(String(item.time_slot), durationMinutes),
      duration_minutes: durationMinutes,
      reassigned: Boolean(item.reassigned),
      status: String(item.status),
      created_at: String(item.created_at),
      barber_name:
        item.barbers && typeof item.barbers === 'object' && 'name' in item.barbers
          ? String((item.barbers as { name: string }).name)
          : null,
      requested_barber_name:
        item.requested_barber && typeof item.requested_barber === 'object' && 'name' in item.requested_barber
          ? String((item.requested_barber as { name: string }).name)
          : null,
    };
  });
}

export async function getBookingById(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Booking | null;
}

export async function updateBookingStatus(id: string, status: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function countAdmins() {
  const { count, error } = await getSupabaseAdmin()
    .from('admins')
    .select('id', { count: 'exact', head: true });

  if (error && isMissingDatabaseFieldError(error.message)) {
    return 0;
  }

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function createAdmin(input: {
  full_name: string;
  email: string;
  password_hash: string;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from('admins')
    .insert(input)
    .select('id,full_name,email,password_hash')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AdminAuthRecord;
}

export async function findAdminByEmail(email: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('admins')
    .select('id,full_name,email,password_hash')
    .ilike('email', email)
    .maybeSingle();

  if (error && isMissingDatabaseFieldError(error.message)) {
    return null;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data as AdminAuthRecord | null) ?? null;
}

export async function findBarberByEmail(email: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('barbers')
    .select('id,name,email,password_hash')
    .ilike('email', email)
    .not('password_hash', 'is', null)
    .maybeSingle();

  if (error && isMissingDatabaseFieldError(error.message)) {
    return null;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data as BarberAuthRecord | null) ?? null;
}

function bookingOverlaps(input: {
  startTime: string;
  endTime: string;
  existingStartTime: string;
  existingEndTime: string;
}) {
  const requestedStart = timeToMinutes(input.startTime);
  const requestedEnd = timeToMinutes(input.endTime);
  const existingStart = timeToMinutes(input.existingStartTime);
  const existingEnd = timeToMinutes(input.existingEndTime);

  return requestedStart < existingEnd && existingStart < requestedEnd;
}

export async function findAssignableBarber(input: {
  requested_barber_id: string;
  day: string;
  time_slot: string;
  service: string;
}) {
  const barbers = await getBarbers();
  const requestedBarber = barbers.find((barber) => barber.id === input.requested_barber_id);

  if (!requestedBarber) {
    throw new Error('Selected barber could not be found');
  }

  const sameShopBarbers = barbers.filter(
    (barber) => barber.shop_name === requestedBarber.shop_name,
  );
  const orderedBarbers = [
    requestedBarber,
    ...sameShopBarbers.filter((barber) => barber.id !== requestedBarber.id),
  ];
  const durationMinutes = getServiceDurationMinutes(input.service);
  const endTime = calculateEndTime(input.time_slot, durationMinutes);

  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('day', input.day)
    .in(
      'barber_id',
      orderedBarbers.map((barber) => barber.id),
    )
    .neq('status', 'cancelled');

  if (error) {
    throw new Error(error.message);
  }

  const bookings = (data ?? []) as Array<Record<string, unknown>>;

  for (const barber of orderedBarbers) {
    const isBusy = bookings.some((booking) => {
      if (String(booking.barber_id) !== barber.id) {
        return false;
      }

      const existingService = String(booking.service);
      const existingDuration =
        typeof booking.duration_minutes === 'number'
          ? booking.duration_minutes
          : getServiceDurationMinutes(existingService);
      const existingStartTime = String(booking.time_slot);
      const existingEndTime =
        typeof booking.end_time === 'string'
          ? booking.end_time
          : calculateEndTime(existingStartTime, existingDuration);

      return bookingOverlaps({
        startTime: input.time_slot,
        endTime,
        existingStartTime,
        existingEndTime,
      });
    });

    if (!isBusy) {
      return {
        barber,
        duration_minutes: durationMinutes,
        end_time: endTime,
        reassigned: barber.id !== requestedBarber.id,
      };
    }
  }

  return null;
}
