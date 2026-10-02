# Modni Frizer VOJKAN

This repository contains a modern single-page website and booking system for the hair salon **Modni Frizer VOJKAN**.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS (with shadcn/ui components)
- Framer Motion animations
- Supabase (Backend: Authenthication, Database, Edge Functions)

## Hybrid Booking Model

The salon uses a hybrid booking system that balances online bookings with walk-in capacity:

- **Total capacity:** 7 simultaneous customers (4 chairs + 3 wash basins)
- **Online bookings:** at most `min(max_online_per_slot, floor(total_capacity × online_ratio))` per slot (4 with the defaults)
- **Walk-in reserved:** the rest of the capacity (3 with the defaults)

This ensures:
- Online customers can book reliably without overbooking the salon
- Walk-in customers always have a chance
- Maximum salon utilization

### Booking States
- **ONLINE_AVAILABLE**: Slot can be booked online
- **ONLINE_FULL_WALKIN_AVAILABLE**: Online booking full, but walk-ins welcome
- **FULL**: No capacity left

Capacity is counted per exact start time: 4 online bookings at 11:00 close 11:00 for online booking, but 11:30 still has its own 4 online seats. Service durations are not fixed, so the 60-minute `end_time` stored with each appointment is informational only.

Rules enforced by the database (not just the UI): online bookings must be in the future, at most 60 days ahead, not on Sundays or holidays; at most 3 active online bookings per phone number; walk-ins can only be created by admins. All bookings are serialised with an advisory lock so two simultaneous requests cannot take the same last seat.

### Configuration
Capacity and ratios can be adjusted in the `salon_settings` table (see Dashboard / SQL Editor):
```sql
UPDATE salon_settings
SET 
  total_capacity = 7,      -- Total simultaneous customers
  online_ratio = 0.6,      -- % reserved for online (0.0-1.0)
  max_online_per_slot = 4  -- Hard limit on online bookings
WHERE id = 1;
```

---

## Setup

Before running the application, you need to configure your Supabase project.

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   ```

2. **Frontend Environment:**
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

3. **Email Notifications (Edge Function):**
   The application uses Resend to send confirmation emails when appointments are booked online. Keep in mind that these secrets **do not** go into your `.env.local` file. They must be set directly in your Supabase project via the CLI:
   
   ```bash
   # Set up your Resend API key and salon details
   supabase secrets set RESEND_API_KEY=re_your_api_key
   supabase secrets set SALON_EMAIL=your_email@domain.com
   supabase secrets set SENDER_EMAIL=noreply@your_domain.com
   supabase secrets set SALON_ADDRESS="Uspenska 1, Novi Sad"
   supabase secrets set SALON_PHONE="+381 62 144 5958"
   ```

4. **Apply database migrations.** For a brand-new project, paste `supabase/setup_new_project.sql` into *SQL Editor → New query* and run it (it contains every migration, in one transaction). For an existing project, apply the files in `supabase/migrations/` that are not applied yet, in order, or use `supabase db push`. After adding a migration, regenerate the combined file with `supabase/build-setup.sh`.

5. **Register the admin.** Only users listed in `admin_users` can use the admin panel; being logged in is not enough. Create the owner's user in *Authentication → Users*, then run:
   ```sql
   INSERT INTO public.admin_users (user_id)
   SELECT id FROM auth.users WHERE email = 'owner@example.com';
   ```
   Also turn off public sign-ups: *Authentication → Sign In / Providers → Allow new users to sign up* = off.

6. **Deploy Edge Function:**
   ```bash
   supabase functions deploy send-booking-notification
   ```
   The function only takes an appointment id. It reads the booking from the database, sends the emails once per appointment and only within 10 minutes of the booking, so it cannot be abused to send arbitrary emails.

---

## Development

```bash
# Start dev server (Available at http://localhost:8080)
npm run dev

# Build for production (Output generated in dist/)
npm run build

# Lint, type checks and unit tests
npm run lint
npm run typecheck
npm test

# Database tests: applies every migration to a throwaway Postgres and
# checks RLS, capacity, limits and holidays. Never point it at production.
PGHOST=localhost PGUSER=postgres npm run test:db
```

CI (`.github/workflows/ci.yml`) runs all of the above on every pull request.

## Admin Panel

A secure admin interface for walk-in bookings is available at `/admin`. This allows owners to:
- Create walk-in/phone appointments manually
- View the real-time calendar and agenda
- Validate, confirm, or cancel appointments
- Bypass online booking limits for VIP walk-ins (but never the total capacity)
- Block days (holidays / time off)

## Deployment

The site is hosted on Netlify at https://frizervojkan.rs (configuration in `netlify.toml`).
Every push to `main` is deployed automatically, and every pull request gets a Deploy Preview link.

The build needs the Netlify environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (*Project configuration → Environment variables*). Without them the site still deploys, but online booking is disabled and visitors are shown the phone number instead.

The GitHub repository secrets with the same names are only used by the Supabase keep-alive workflow.
