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
- **Online bookings:** 60% of capacity (max 4 slots per time)
- **Walk-in reserved:** 40% of capacity (3 slots per time)

This ensures:
- Online customers can book reliably without overbooking the salon
- Walk-in customers always have a chance
- Maximum salon utilization

### Booking States
- **ONLINE_AVAILABLE**: Slot can be booked online
- **ONLINE_FULL_WALKIN_AVAILABLE**: Online booking full, but walk-ins welcome
- **FULL**: No capacity left

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

4. **Deploy Edge Function:**
   ```bash
   supabase functions deploy send-booking-notification
   ```

---

## Development

```bash
# Start dev server (Available at http://localhost:8080)
npm run dev

# Build for production (Output generated in dist/)
npm run build

# Run type checks
npm run typecheck
```

## Admin Panel

A secure admin interface for walk-in bookings is available at `/admin`. This allows owners to:
- Create walk-in/phone appointments manually
- View the real-time calendar and agenda
- Validate, confirm, or cancel appointments
- Bypass online booking limits for VIP walk-ins

## Deployment

The site is configured for GitHub Pages deployment via GitHub Actions.
Pushing to the `main` branch will trigger an automatic deployment pipeline.
