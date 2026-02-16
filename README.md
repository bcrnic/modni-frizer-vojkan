# Modni Frizer VOJKAN

This repository contains a single-page website for the hair salon **Modni Frizer VOJKAN**.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Framer Motion animations
- Supabase (booking system)

## Hybrid Booking Model

The salon uses a hybrid booking system that balances online bookings with walk-in capacity:

- Total capacity: 7 simultaneous customers (4 chairs + 3 wash basins)
- Online bookings: 60% of capacity (max 4 slots per time)
- Walk-in reserved: 40% of capacity (3 slots per time)

This ensures:
- Online customers can book reliably
- Walk-in customers always have a chance
- Maximum salon utilization

### Booking States

- **ONLINE_AVAILABLE**: Slot can be booked online
- **ONLINE_FULL_WALKIN_AVAILABLE**: Online booking full, but walk-ins welcome
- **FULL**: No capacity left

### Configuration

Capacity and ratios can be adjusted in the `salon_settings` table:
```sql
UPDATE salon_settings
SET 
  total_capacity = 7,      -- Total simultaneous customers
  online_ratio = 0.6,      -- % reserved for online (0.0-1.0)
  max_online_per_slot = 4  -- Hard limit on online bookings
WHERE id = 1;
```

## Running locally

Requirements:

- Node.js 18+

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The app will be available at:

- http://localhost:8080

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run type checks
npm run typecheck
```

## Admin Panel

A simple admin interface for walk-in bookings is available at `/admin`. This allows:
- Creating walk-in appointments
- Viewing real-time capacity
- Bypassing online booking limits

## Deployment

The site is configured for GitHub Pages deployment via GitHub Actions.
Push to `main` branch to trigger automatic deployment.

### Environment Variables

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Build

```bash
npm run build
```

Production output is generated in `dist/`.
