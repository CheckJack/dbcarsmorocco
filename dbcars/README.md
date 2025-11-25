# DB Luxury Cars - Car Rental Website

A full-stack car rental website built with Next.js frontend and Node.js/Express backend, featuring comprehensive vehicle management, booking system, and admin panel.

## Features

### Frontend
- **Homepage** with hero section and featured vehicles
- **Vehicle Listing** with filters (category, location, dates, price)
- **Vehicle Detail Pages** with booking form
- **Multi-step Booking Flow** with date selection, extras, and customer information
- **Booking Confirmation** page
- **Admin Dashboard** with statistics and management tools
- **Responsive Design** matching luxury car rental aesthetic

### Backend API
- **Vehicle Management** - CRUD operations for vehicles and subunits
- **Booking System** - Create, view, and manage bookings
- **Availability Checking** - Real-time availability validation
- **Pricing Calculation** - Dynamic pricing with seasonal rates
- **Coupon System** - Discount code validation and application
- **Admin Authentication** - JWT-based admin login
- **Statistics & Reports** - Dashboard analytics

### Database
- PostgreSQL database (`dbcars_db`)
- Comprehensive schema with vehicles, bookings, customers, locations, extras, coupons
- Vehicle subunits for individual car tracking
- Damage logging system
- Availability notes

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+ (must be running)
- Git

### Database Setup

1. **Ensure PostgreSQL is running**:
   ```bash
   # macOS (Homebrew)
   brew services start postgresql
   
   # Linux (systemd)
   sudo systemctl start postgresql
   
   # Or check if running
   pg_isready
   ```

2. Create PostgreSQL database:
   ```bash
   createdb dbcars_db
   ```

3. Run migrations:
   ```bash
   cd database/migrations
   psql -d dbcars_db -f 001_initial_schema.sql
   ```

4. (Optional) Seed sample data:
   ```bash
   psql -d dbcars_db -f ../seed.sql
   ```

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd dbcars/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your database credentials:
   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dbcars_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   PORT=3001
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start backend development server**:
   ```bash
   npm run dev
   ```
   
   The backend will:
   - Test database connection before starting
   - Show clear error messages if database is unavailable
   - Run on `http://localhost:3001`
   - Auto-reload on file changes (nodemon)

   **Expected output**:
   ```
   🔍 Testing database connection...
   ✅ Database connection successful!
   🚀 Starting server on port 3001...
   ✅ Server is running on http://localhost:3001
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd dbcars/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Start frontend development server** (in a separate terminal):
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## Quick Start (Both Servers)

You can start both servers together using the combined script:

```bash
# From project root (DBLUXCARSWEB directory)
./start-dev.sh
```

Or use the backend startup script for backend only:

```bash
# From dbcars/backend directory
./scripts/start-dev.sh
```

**Important**: Both frontend (port 3000) and backend (port 3001) must be running for the application to work!

## Default Admin Credentials

After running the seed script, you can login with:
- Email: `admin@dbcars.com`
- Password: `admin123`

**Note**: Change the password in production! The seed script creates a user with a placeholder password hash.

## Project Structure

```
DBCars/
├── frontend/              # Next.js frontend application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── lib/              # API client and utilities
├── backend/              # Express backend API
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth middleware
│   │   └── config/      # Database config
│   └── package.json
└── database/             # Database files
    ├── migrations/       # SQL migration files
    └── seed.sql         # Sample data
```

## API Endpoints

### Public Endpoints
- `GET /api/vehicles` - List vehicles with filters
- `GET /api/vehicles/:id` - Get vehicle details
- `GET /api/vehicles/:id/availability` - Check availability
- `GET /api/locations` - List locations
- `GET /api/extras` - List extras
- `GET /api/coupons/:code` - Validate coupon
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:bookingNumber` - Get booking details

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/statistics` - Dashboard statistics
- `GET /api/admin/bookings` - List all bookings
- `PUT /api/admin/bookings/:id` - Update booking status
- `GET /api/admin/vehicles` - List all vehicles
- `POST /api/admin/vehicles` - Create vehicle
- `PUT /api/admin/vehicles/:id` - Update vehicle
- `DELETE /api/admin/vehicles/:id` - Delete vehicle
- `GET /api/admin/availability` - Availability overview
- `POST /api/admin/damage-logs` - Log vehicle damage

## Features Not Yet Implemented

- Email notifications (Phase 6)
- Damage logging UI in admin panel (backend endpoint exists)
- Image upload functionality
- Multi-language support
- Payment integration (intentionally excluded per requirements)

## Development Notes

- The frontend uses client-side data fetching for dynamic content
- Admin routes are protected by JWT authentication
- Booking system includes real-time availability checking
- Pricing supports daily, weekly, monthly, and hourly rates
- Seasonal pricing and location-based pricing can be configured via pricing_rules table

## Troubleshooting

### Backend Server Hangs or Won't Start

**Problem**: `npm run dev` appears to hang or shows no output

**Solutions**:

1. **Check PostgreSQL is running**:
   ```bash
   pg_isready
   # Should output: /tmp:5432 - accepting connections
   ```

2. **Verify database credentials** in `backend/.env`:
   ```bash
   cd dbcars/backend
   npm run dev:check
   ```
   This will show your current environment variables.

3. **Test database connection manually**:
   ```bash
   psql -h localhost -p 5432 -U postgres -d dbcars_db
   ```

4. **Check if database exists**:
   ```bash
   psql -U postgres -l | grep dbcars_db
   ```

5. **Check for port conflicts**:
   ```bash
   # Check if port 3001 is already in use
   lsof -i :3001
   ```

6. **View detailed error messages**:
   - Remove `| head -30` from your command to see full output
   - Check the console for database connection errors
   - The server now shows clear error messages before exiting

### Frontend Won't Load (localhost:3000)

**Problem**: `http://localhost:3000/` is not accessible

**Solutions**:

1. **Verify frontend server is running**:
   ```bash
   cd dbcars/frontend
   npm run dev
   ```
   You should see: `- Local: http://localhost:3000`

2. **Check if port 3000 is in use**:
   ```bash
   lsof -i :3000
   ```

3. **Ensure backend is running**:
   - Frontend requires backend API at `http://localhost:3001`
   - Verify backend is accessible: `curl http://localhost:3001/api/health`

4. **Check frontend environment variables**:
   ```bash
   cat dbcars/frontend/.env.local
   # Should contain: NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

### Database Connection Errors

**Error**: `Failed to connect to database!`

**Solutions**:

1. **Start PostgreSQL service**:
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Verify database exists**:
   ```bash
   createdb dbcars_db  # Create if doesn't exist
   ```

3. **Update `.env` file** with correct credentials:
   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dbcars_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   ```

4. **Check PostgreSQL authentication**:
   - Ensure `pg_hba.conf` allows local connections
   - Check if password authentication is required

### Backend Shows "Database connection test failed"

**Solutions**:

1. **Check PostgreSQL logs** for connection attempts
2. **Verify user has access** to the database:
   ```bash
   psql -U postgres -d dbcars_db -c "SELECT 1;"
   ```
3. **Check firewall settings** if using remote database
4. **Ensure database is not locked** by other connections

### Common Issues

**Issue**: "Cannot find module" errors
- **Solution**: Run `npm install` in both `backend/` and `frontend/` directories

**Issue**: TypeScript compilation errors
- **Solution**: Run `npm run build` to see full error messages

**Issue**: Port already in use
- **Solution**: Kill the process using the port:
  ```bash
  # For port 3000
  lsof -ti:3000 | xargs kill -9
  
  # For port 3001
  lsof -ti:3001 | xargs kill -9
  ```

**Issue**: Backend starts but shows "Unexpected error on idle client"
- **Solution**: This usually means database connection was lost. Restart both PostgreSQL and the backend server.

## Getting Help

If issues persist:
1. Check that all prerequisites are installed and running
2. Verify environment variables are set correctly
3. Review error messages carefully - they now provide specific guidance
4. Ensure both frontend and backend servers are running simultaneously
5. Check database migrations have been applied successfully

## License

This project is proprietary software for DB Luxury Cars.

