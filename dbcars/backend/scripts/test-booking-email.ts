import * as dotenv from 'dotenv';
import { sendBookingEmail } from '../src/services/email';
import pool from '../src/config/database';
import path from 'path';

// Load environment variables (same way as backend does)
// Try multiple locations
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // Also try default location (current working directory)

async function testBookingEmail() {
  try {
    console.log('📧 Testing booking email (pending confirmation stage)...\n');
    
    // Check required environment variables
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_DEFAULT_SENDER_EMAIL;
    
    if (!apiKey || !senderEmail) {
      console.error('❌ Missing required environment variables:');
      if (!apiKey) console.error('   - BREVO_API_KEY');
      if (!senderEmail) console.error('   - BREVO_SENDER_EMAIL or BREVO_DEFAULT_SENDER_EMAIL');
      console.error('\n📝 Please add these to your backend/.env file:');
      console.error('\n   BREVO_API_KEY=your_brevo_api_key_here');
      console.error('   BREVO_SENDER_EMAIL=booking@dbluxurycarsmorocco.com');
      console.error('   BREVO_SENDER_NAME=DB Luxury Cars');
      console.error('   BREVO_ADMIN_EMAIL=tiagolpc98@gmail.com  # Optional');
      console.error('\n💡 See TEST_EMAIL_SETUP.md for detailed instructions');
      console.error('   Get your API key from: https://app.brevo.com → Settings → SMTP & API\n');
      process.exit(1);
    }
    
    console.log('✅ Environment variables configured');
    console.log(`   Sender: ${senderEmail}`);
    console.log(`   Admin Email: ${process.env.BREVO_ADMIN_EMAIL || 'Not configured'}\n`);
    
    // Fetch a real vehicle from database to get its images
    console.log('🔍 Fetching vehicle image from database...');
    const vehicleResult = await pool.query(
      `SELECT images, make, model, year FROM vehicles 
       WHERE make = 'Range Rover' AND model = 'Sport' AND is_active = true 
       LIMIT 1`
    );
    
    let vehicleImages = null;
    let vehicleMake = 'Range Rover';
    let vehicleModel = 'Sport';
    let vehicleYear = 2025;
    
    if (vehicleResult.rows.length > 0) {
      const vehicle = vehicleResult.rows[0];
      vehicleMake = vehicle.make;
      vehicleModel = vehicle.model;
      vehicleYear = vehicle.year;
      
      // Parse images
      if (vehicle.images) {
        try {
          vehicleImages = typeof vehicle.images === 'string' ? JSON.parse(vehicle.images) : vehicle.images;
          if (!Array.isArray(vehicleImages)) {
            vehicleImages = vehicleImages ? [vehicleImages] : null;
          }
          console.log(`   ✅ Found vehicle: ${vehicleMake} ${vehicleModel} ${vehicleYear}`);
          console.log(`   📸 Images: ${vehicleImages && vehicleImages.length > 0 ? vehicleImages.length + ' image(s)' : 'No images'}`);
        } catch (e) {
          vehicleImages = vehicle.images ? [vehicle.images] : null;
        }
      }
    } else {
      console.log('   ⚠️  Vehicle not found in database, using default values');
    }
    
    console.log('');
    
    // Sample booking data for testing
    const testBooking = {
      booking_number: `DB-TEST-${Date.now()}`,
      pickup_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      dropoff_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      total_price: 450.00,
      base_price: 400.00,
      extras_price: 50.00,
      discount_amount: 0,
      first_name: 'John',
      last_name: 'Doe',
      email: process.env.TEST_EMAIL || 'tiagolpc98@gmail.com', // Use TEST_EMAIL env var or default
      phone: '+212 612 345 678',
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear,
      pickup_location_name: 'Casablanca Airport',
      dropoff_location_name: 'Marrakech City Center',
      vehicle_images: vehicleImages,
    };
    
    console.log('📋 Test booking data:');
    console.log(`   Booking Number: ${testBooking.booking_number}`);
    console.log(`   Customer: ${testBooking.first_name} ${testBooking.last_name}`);
    console.log(`   Email: ${testBooking.email}`);
    console.log(`   Vehicle: ${testBooking.make} ${testBooking.model} ${testBooking.year}`);
    console.log(`   Total Price: €${testBooking.total_price.toFixed(2)}\n`);
    
    console.log('📤 Sending email...\n');
    
    // Send the email
    await sendBookingEmail(testBooking);
    
    console.log('✅ Email sent successfully!');
    console.log(`\n📬 Please check the inbox for: ${testBooking.email}`);
    if (process.env.BREVO_ADMIN_EMAIL) {
      console.log(`📬 Admin notification sent to: ${process.env.BREVO_ADMIN_EMAIL}`);
    }
    console.log('\n💡 Note: This is a test email for the "pending" booking stage.');
    console.log('   The email should show "Booking Pending Review" status.');
    
    // Close database connection
    await pool.end();
    
  } catch (error: any) {
    console.error('\n❌ Failed to send test email:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.message) {
      console.error('   Error:', error.message);
    } else {
      console.error('   Error:', error);
    }
    process.exit(1);
  }
}

testBookingEmail();

