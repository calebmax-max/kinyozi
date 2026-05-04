# Barber Booking MVP Starter

This starter gives you a professional MVP structure using **Next.js + Supabase + WhatsApp**.

## Included
- Customer booking page (`/`)
- Barber dashboard (`/dashboard`)
- API route skeletons:
  - `POST /api/book`
  - `GET|PATCH /api/bookings`
- Supabase SQL schema in `supabase/schema.sql`

## Quick start
1. Create a Next.js app in this repo (if not already initialized).
2. Copy `.env.example` to `.env.local` and fill values.
3. Run SQL from `supabase/schema.sql` in Supabase SQL editor.
4. Start app and test booking flow.

## Deploy on Render
1. Create a new `Web Service` on Render and point it at this repository.
2. Let Render use the included `render.yaml`, or set these manually:
   - Build command: `npm install && npm run build`
   - Start command: `npm run start -- --hostname 0.0.0.0`
3. Add these environment variables in Render:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Set `NEXT_PUBLIC_APP_URL` to your live Render URL, for example `https://kinyozi.onrender.com`.
5. Deploy after running the SQL schema in Supabase.

## MVP flow
1. Customer picks barber, service, date, time slot.
2. Customer enters name and phone.
3. Booking is saved in Supabase.
4. WhatsApp message link is generated for confirmation.
5. Barber sees booking in dashboard.
# kinyozi
