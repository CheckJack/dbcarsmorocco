# Environment Variables Setup Guide

This guide explains all environment variables required for the DB Luxury Cars application.

## Backend Environment Variables

Create a `.env` file in the `dbcars/backend/` directory with the following variables:

### Required Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dbcars_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Security (Critical for Production)

```bash
# JWT Configuration
# IMPORTANT: Change this to a strong random string (minimum 32 characters) in production!
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your_strong_random_jwt_secret_key_here_min_32_characters
JWT_EXPIRES_IN=7d
```

**⚠️ SECURITY WARNING:** The default `JWT_SECRET` value of "secret" is insecure and will cause the server to fail in production mode. You MUST set a strong random string.

### Email Configuration (Optional but Recommended)

```bash
# Brevo (formerly Sendinblue) Email Service
# Get your API key from: https://app.brevo.com/settings/keys/api
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=DB Luxury Cars
BREVO_ADMIN_EMAIL=admin@yourdomain.com
```

**Note:** Email functionality will be disabled if `BREVO_API_KEY` is not set. You'll see a warning on startup.

### Public URLs (for email links)

```bash
# Public URLs (for email links)
PUBLIC_API_URL=http://localhost:3001
PUBLIC_FRONTEND_URL=http://localhost:3000
EMAIL_LOGO_URL=
```

### CORS Configuration

```bash
# Frontend URL for CORS (production only)
FRONTEND_URL=http://localhost:3000
```

### Optional Fallbacks

```bash
# Optional: API Base URL (fallback if PUBLIC_API_URL not set)
API_BASE_URL=http://localhost:3001
```

---

## Frontend Environment Variables

Create a `.env.local` file in the `dbcars/frontend/` directory:

### Required Variables

```bash
# API Configuration
# Backend API URL - must include /api suffix
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not put sensitive data here.

---

## Quick Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd dbcars/backend
   ```

2. Copy the example file (if it exists):
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and fill in your values:
   ```bash
   nano .env  # or use your preferred editor
   ```

4. **IMPORTANT:** Generate a secure JWT_SECRET:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as your `JWT_SECRET` value.

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd dbcars/frontend
   ```

2. Create `.env.local`:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
   ```

---

## Production Checklist

Before deploying to production, ensure:

- [ ] `JWT_SECRET` is set to a strong random string (32+ characters)
- [ ] `NODE_ENV` is set to `production`
- [ ] `DB_PASSWORD` is set and secure
- [ ] `BREVO_API_KEY` is configured (if using email)
- [ ] `FRONTEND_URL` points to your production domain
- [ ] `PUBLIC_API_URL` and `PUBLIC_FRONTEND_URL` use HTTPS
- [ ] All sensitive values are NOT committed to git (check `.gitignore`)

---

## Validation

The backend server will validate environment variables on startup:

- **Errors** (server will exit): Missing required variables, insecure JWT_SECRET in production
- **Warnings** (server will start): Missing optional variables like BREVO_API_KEY

Check the server logs on startup to see any warnings or errors.

---

## Troubleshooting

### "JWT_SECRET must be set to a strong random string"

This error appears in production mode. Generate a secure secret:
```bash
openssl rand -base64 32
```

### Email not working

Check that `BREVO_API_KEY` is set correctly. You'll see a warning on startup if it's missing.

### Database connection errors

Verify:
- PostgreSQL is running
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` are correct
- `DB_PASSWORD` matches your PostgreSQL user password
- Database exists: `createdb dbcars_db` (if needed)

---

## Security Notes

1. **Never commit `.env` files to git** - they contain sensitive information
2. **Use different secrets for development and production**
3. **Rotate JWT_SECRET periodically** if compromised
4. **Use environment variable management** in production (AWS Secrets Manager, etc.)
5. **Restrict file permissions** on `.env` files: `chmod 600 .env`

---

**Last Updated:** January 2025

