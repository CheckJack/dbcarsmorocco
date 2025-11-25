# Test Email Setup Guide

## Quick Setup for Testing Booking Emails

To send test emails, you need to configure Brevo (formerly Sendinblue) credentials in your `.env` file.

### Step 1: Get Your Brevo API Key

1. Go to https://app.brevo.com
2. Navigate to **Settings → SMTP & API**
3. Create a new API key (or use an existing one)
4. Copy the API key

### Step 2: Configure Your .env File

Add these lines to your `backend/.env` file:

```bash
# Brevo Email Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=booking@dbluxurycarsmorocco.com
BREVO_SENDER_NAME=DB Luxury Cars
BREVO_ADMIN_EMAIL=tiagolpc98@gmail.com  # Optional: for admin notifications
```

**Important:**
- `BREVO_SENDER_EMAIL` must be a verified sender email in your Brevo account
- The sender email needs to be verified in Brevo before you can send emails

### Step 3: Run the Test Script

Once configured, run:

```bash
cd backend
npx ts-node scripts/test-booking-email.ts
```

The test email will be sent to: **tiagolpc98@gmail.com**

## What the Test Email Includes

The test email simulates the **first booking stage (pending confirmation)** and includes:

- ✅ Booking confirmation message
- ✅ "Booking Pending Review" status badge
- ✅ Booking number
- ✅ Vehicle details (Mercedes-Benz C-Class 2024)
- ✅ Pickup and dropoff locations and dates
- ✅ Total price breakdown
- ✅ Professional email template with logo

## Troubleshooting

### "Missing required environment variables"
- Make sure your `.env` file is in the `backend/` directory
- Check that `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are set correctly
- Restart your terminal after adding the variables

### "Failed to send test email"
- Verify your Brevo API key is correct
- Make sure the sender email is verified in Brevo
- Check your Brevo account has available email credits
- Check the error message for specific details

### Email not received
- Check spam/junk folder
- Verify the recipient email address is correct
- Check Brevo dashboard for delivery status

