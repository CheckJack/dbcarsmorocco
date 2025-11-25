import dotenv from 'dotenv';
import { sendBookingStatusEmail } from '../src/services/email';

// Load environment variables
dotenv.config();

/**
 * Test Email Script for Confirmed Booking (Invoice Email)
 * Sends a test booking confirmation email with invoice
 */

async function testConfirmedEmail() {
  try {
    console.log('\n📧 Sending Test Confirmed Booking Email (Invoice)...\n');
    console.log('='.repeat(60));

    // Test booking data for confirmed status (with invoice)
    const testBooking = {
      booking_number: `DB-${Date.now()}-TEST`,
      pickup_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      dropoff_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      total_price: 450.00,
      base_price: 400.00,
      extras_price: 50.00,
      discount_amount: 0,
      first_name: 'Tiago',
      last_name: 'Test',
      email: 'tiagolpc98@gmail.com',
      phone: '+212 600 000000',
      make: 'Range Rover',
      model: 'Evoque',
      year: 2024,
      pickup_location_name: 'Marrakech Airport',
      dropoff_location_name: 'Marrakech Airport',
      pickup_location_city: 'Marrakech',
      dropoff_location_city: 'Marrakech',
      status: 'confirmed', // Confirmed status with invoice
      payment_link: null, // No payment link needed for confirmed
      notes: null,
      vehicle_image: 'https://i.ibb.co/8LJNbHrF/A-highly-detailed-realistic-photograph-of-a-sleek-dark-Range-Rover-Sport-parked-in-a-dimly-lit-studi.jpg', // Vehicle image URL
    };

    console.log('To:', testBooking.email);
    console.log('Booking Number:', testBooking.booking_number);
    console.log('Status:', testBooking.status);
    console.log('Vehicle:', testBooking.make, testBooking.model);
    console.log('='.repeat(60));
    console.log('');

    // Send the status email
    await sendBookingStatusEmail(testBooking);

    console.log('\n✅ Test email sent successfully!');
    console.log('\n📬 Check your inbox at: tiagolpc98@gmail.com');
    console.log('   (Check spam folder if you don\'t see it)\n');
    console.log('🔍 What to look for in the email:');
    console.log('   ✓ "Booking Confirmed" heading');
    console.log('   ✓ Thank you message');
    console.log('   ✓ Invoice section with price breakdown');
    console.log('   ✓ Payment status: Paid');
    console.log('   ✓ Booking details table');
    console.log('   ✓ Professional email layout\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Failed to send test email!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\n💡 Common issues:');
    console.error('   • Check BREVO_API_KEY is correct in .env');
    console.error('   • Verify BREVO_SENDER_EMAIL is verified in Brevo');
    console.error('   • Make sure backend dependencies are installed');
    console.error('   • Check that .env file exists in backend directory\n');
    process.exit(1);
  }
}

testConfirmedEmail();

