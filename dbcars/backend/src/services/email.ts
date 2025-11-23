import axios from 'axios';

interface BookingEmailData {
  booking_number: string;
  pickup_date: string;
  dropoff_date: string;
  total_price: number;
  base_price: number;
  extras_price: number;
  discount_amount: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year?: number;
  pickup_location_name: string;
  dropoff_location_name: string;
  vehicle_images?: string | string[] | null;
}

interface BookingStatusEmailData extends BookingEmailData {
  status: string;
  payment_link?: string | null;
  notes?: string | null;
  pickup_location_city?: string;
  dropoff_location_city?: string;
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Helper function to get full image URL
function getFullImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Construct full URL from relative path - must be publicly accessible!
  // Make sure this URL is accessible from the internet, not localhost
  const baseUrl = process.env.PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:3001';
  const fullUrl = `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  
  console.log('[Email] Image URL generated:', fullUrl);
  return fullUrl;
}

// Helper function to get first vehicle image
function getVehicleImageUrl(images: string | string[] | null | undefined): string {
  if (!images) {
    return '';
  }
  
  let imageArray: string[] = [];
  
  if (typeof images === 'string') {
    try {
      imageArray = JSON.parse(images);
    } catch {
      imageArray = [images];
    }
  } else if (Array.isArray(images)) {
    imageArray = images;
  }
  
  const firstImage = imageArray.length > 0 ? imageArray[0] : null;
  return firstImage ? getFullImageUrl(firstImage) : '';
}

// Status-specific email content
function getStatusEmailContent(status: string): { subject: string; heading: string; message: string; statusColor: string } {
  const statusMap: Record<string, { subject: string; heading: string; message: string; statusColor: string }> = {
    pending: {
      subject: 'Booking Received',
      heading: 'Booking Pending Review',
      message: 'Your booking has been received and is being reviewed by our team. We will send you payment instructions shortly.',
      statusColor: '#f59e0b',
    },
    waiting_payment: {
      subject: 'Payment Required',
      heading: 'Payment Link Available',
      message: 'Your booking has been approved! Please complete the payment using the link below to confirm your reservation.',
      statusColor: '#3b82f6',
    },
    confirmed: {
      subject: 'Booking Confirmed',
      heading: 'Booking Confirmed',
      message: 'Great news! Your booking has been confirmed. We look forward to serving you.',
      statusColor: '#10b981',
    },
    cancelled: {
      subject: 'Booking Cancelled',
      heading: 'Booking Cancelled',
      message: 'Your booking has been cancelled. If you have any questions, please contact us.',
      statusColor: '#ef4444',
    },
    completed: {
      subject: 'Booking Completed',
      heading: 'Booking Completed',
      message: 'Thank you for choosing DB Luxury Cars! We hope you enjoyed your experience. We would love to hear your feedback.',
      statusColor: '#6366f1',
    },
  };

  return statusMap[status] || {
    subject: 'Booking Status Update',
    heading: 'Booking Status Updated',
    message: `Your booking status has been updated to: ${status}`,
    statusColor: '#6b7280',
  };
}

export async function sendBookingEmail(booking: BookingEmailData) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || process.env.BREVO_DEFAULT_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'DB Luxury Cars';
  const adminEmail = process.env.BREVO_ADMIN_EMAIL;

  if (!apiKey || !senderEmail) {
    console.warn(
      '[Brevo] Missing BREVO_API_KEY or BREVO_SENDER_EMAIL. Skipping email send.'
    );
    return;
  }

  const pickupDate = new Date(booking.pickup_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
    year: 'numeric'
  });
  const pickupTime = new Date(booking.pickup_date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
  });
  const dropoffDate = new Date(booking.dropoff_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
    year: 'numeric'
  });
  const dropoffTime = new Date(booking.dropoff_date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
  });

  // Get the logo and vehicle image URLs - MUST be publicly accessible URLs!
  // Option 1: Use EMAIL_LOGO_URL for a direct publicly hosted logo
  // Option 2: Use PUBLIC_FRONTEND_URL + '/logodb.png' for frontend-hosted logo
  // The URL MUST be accessible from the internet (not localhost)
  const logoUrl = process.env.EMAIL_LOGO_URL || 
                  (process.env.PUBLIC_FRONTEND_URL ? `${process.env.PUBLIC_FRONTEND_URL}/logodb.png` : 
                   process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/logodb.png` : '');
  
  const vehicleImageUrl = getVehicleImageUrl(booking.vehicle_images);
  
  console.log('[Email] Sending booking email with logo:', logoUrl);
  console.log('[Email] Vehicle image:', vehicleImageUrl || 'No vehicle image');

  const customerHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 0; margin: 0;">
          <tr>
            <td align="center" style="padding: 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000000; margin: 0; max-width: 600px;">
                
                <!-- Header with Logo - Centered at Top -->
                <tr>
                  <td style="background-color: #000000; padding: 40px 20px 30px 20px; text-align: center;">
                    ${logoUrl ? 
                      `<img src="${logoUrl}" alt="DB Luxury Cars" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />` :
                      `<div style="text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 48px; font-weight: bold; letter-spacing: 2px;">DB</h1>
                        <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px; letter-spacing: 3px; text-transform: uppercase;">LUXURY CARS</p>
                        <div style="width: 100px; height: 2px; background-color: #dc2626; margin: 10px auto 0;"></div>
                      </div>`
                    }
                  </td>
                </tr>

                <!-- Hero Image - Full Width Vehicle Image -->
                ${vehicleImageUrl ? `
                <tr>
                  <td style="padding: 0; line-height: 0;">
                    <img src="${vehicleImageUrl}" alt="${booking.make} ${booking.model}" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0; padding: 0;" />
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 60px 20px; text-align: center; background-color: #1a1a1a;">
                    <h3 style="color: #ffffff; margin: 0; font-size: 24px;">${booking.make} ${booking.model}${booking.year ? ' ' + booking.year : ''}</h3>
                  </td>
                </tr>
                `}

                <!-- Status Badge Button -->
                <tr>
                  <td style="background-color: #000000; padding: 30px 20px 20px 20px; text-align: center;">
                    <div style="display: inline-block; background-color: #d97706; padding: 12px 30px; border-radius: 8px;">
                      <span style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">BOOKING PENDING REVIEW</span>
                    </div>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 0 20px 40px 20px;">
                    <p style="font-size: 16px; color: #ffffff; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">Dear ${booking.first_name} ${booking.last_name},</p>
                    
                    <p style="font-size: 16px; color: #d1d5db; line-height: 1.6; margin-bottom: 30px;">Your booking has been received and is being reviewed by our team. We will send you payment instructions shortly.</p>

                    <!-- Booking Details Card (Dark Grey) -->
                    <div style="background-color: #1a1a1a; border-radius: 8px; padding: 30px; margin: 30px 0;">
                      <h3 style="margin-top: 0; margin-bottom: 25px; color: #ffffff; font-size: 20px; font-weight: bold;">Booking Details</h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Booking Number:</span>
                          </td>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0; text-align: right;">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${booking.booking_number}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Status:</span>
                          </td>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0; text-align: right;">
                            <span style="color: #f59e0b; font-size: 14px; font-weight: 600; text-transform: capitalize;">Pending</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Vehicle:</span>
                          </td>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0; text-align: right;">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${booking.make} ${booking.model}${booking.year ? ' ' + booking.year : ''}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Pickup Location:</span>
                          </td>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0; text-align: right;">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${booking.pickup_location_name}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Pickup Date:</span>
                          </td>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0; text-align: right;">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${pickupDate} ${pickupTime}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Dropoff Location:</span>
                          </td>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0; text-align: right;">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${booking.dropoff_location_name}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Dropoff Date:</span>
                          </td>
                          <td style="border-bottom: 1px solid #374151; padding: 15px 0; text-align: right;">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${dropoffDate} ${dropoffTime}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 15px 0 0 0;">
                            <span style="color: #d1d5db; font-size: 14px;">Total Price:</span>
                          </td>
                          <td style="padding: 15px 0 0 0; text-align: right;">
                            <span style="color: #f59e0b; font-size: 24px; font-weight: bold;">€${booking.total_price.toFixed(2)}</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size: 16px; color: #d1d5db; line-height: 1.6; margin: 30px 0;">If you have any questions, please don't hesitate to contact us.</p>
                    
                    <p style="font-size: 16px; color: #ffffff; line-height: 1.6; margin: 20px 0 0 0;">Best regards,<br><strong style="color: #ffffff;">DB Luxury Cars Team</strong></p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #000000; padding: 40px; text-align: center; border-top: 1px solid #374151;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">© 2025 DB Luxury Cars. All rights reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const adminHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 0; margin: 0;">
          <tr>
            <td align="center" style="padding: 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 40px 20px 40px; text-align: center;">
                    ${logoUrl ? 
                      `<img src="${logoUrl}" alt="DB Luxury Cars" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />` :
                      `<h1 style="color: #ffffff; margin: 0; font-size: 32px;">DB Luxury Cars</h1>`
                    }
                  </td>
                </tr>

                <tr>
                  <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 0 40px 30px 40px; text-align: center;">
                    <div style="display: inline-block; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); padding: 8px 20px; border-radius: 20px;">
                      <span style="color: #f97316; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">● New Booking</span>
                    </div>
                  </td>
                </tr>

                ${vehicleImageUrl ? `
                <tr>
                  <td style="padding: 0;">
                    <img src="${vehicleImageUrl}" alt="${booking.make} ${booking.model}" style="width: 100%; max-width: 600px; height: auto; display: block;" />
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 40px; text-align: center; background-color: #1a1a1a;">
                    <h3 style="color: #ffffff; margin: 0;">${booking.make} ${booking.model}</h3>
                  </td>
                </tr>
                `}

                <tr>
                  <td style="padding: 40px;">
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">A new booking has been created and requires your attention.</p>
                    
                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin: 20px 0;">
                      <tr>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Booking Number:</strong></td>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.booking_number}</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Customer:</strong></td>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.first_name} ${booking.last_name}</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Email:</strong></td>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;"><a href="mailto:${booking.email}" style="color: #f97316;">${booking.email}</a></td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Phone:</strong></td>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.phone}</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Vehicle:</strong></td>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.make} ${booking.model}${booking.year ? ' (' + booking.year + ')' : ''}</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Pickup:</strong></td>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.pickup_location_name} - ${pickupDate} ${pickupTime}</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Dropoff:</strong></td>
                        <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.dropoff_location_name} - ${dropoffDate} ${dropoffTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;"><strong>Total Price:</strong></td>
                        <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: bold; color: #f97316;">€${booking.total_price.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
                    <p style="color: #999; font-size: 14px; margin: 0;">DB Luxury Cars Admin Notification</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const customerPayload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: booking.email, name: `${booking.first_name} ${booking.last_name}` }],
    subject: `Your Booking Confirmation - ${booking.booking_number}`,
    htmlContent: customerHtml,
  };

  const adminPayload = adminEmail
    ? {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: adminEmail, name: 'DB Luxury Cars Admin' }],
        subject: `New Booking Received - ${booking.booking_number}`,
        htmlContent: adminHtml,
      }
    : null;

  try {
    await axios.post(BREVO_API_URL, customerPayload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });

    if (adminPayload) {
      await axios.post(BREVO_API_URL, adminPayload, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      });
    }

    console.log(
      '[Brevo] Booking confirmation email sent for booking:',
      booking.booking_number
    );
  } catch (error: any) {
    console.error('[Brevo] Failed to send booking email:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
}

export async function sendBookingStatusEmail(booking: BookingStatusEmailData) {
  console.log('[Brevo] sendBookingStatusEmail called with booking:', {
    booking_number: booking.booking_number,
    status: booking.status,
    email: booking.email,
    payment_link: booking.payment_link,
  });

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || process.env.BREVO_DEFAULT_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'DB Luxury Cars';
  const adminEmail = process.env.BREVO_ADMIN_EMAIL;

  console.log('[Brevo] Email config:', {
    hasApiKey: !!apiKey,
    hasSenderEmail: !!senderEmail,
    senderName,
    hasAdminEmail: !!adminEmail,
  });

  if (!apiKey || !senderEmail) {
    const error = new Error(
      `Missing BREVO configuration: ${!apiKey ? 'BREVO_API_KEY' : ''} ${!senderEmail ? 'BREVO_SENDER_EMAIL' : ''}`
    );
    console.error('[Brevo] Missing BREVO_API_KEY or BREVO_SENDER_EMAIL. Cannot send status email.');
    console.error('[Brevo] Please configure BREVO_API_KEY and BREVO_SENDER_EMAIL in your .env file');
    throw error; // Throw error so it's caught by the caller
  }

  const statusContent = getStatusEmailContent(booking.status);

  // If payment link is present, customize the message to emphasize payment request
  let emailMessage = statusContent.message;
  let emailSubject = statusContent.subject;
  if (booking.payment_link) {
    if (booking.status === 'waiting_payment') {
      emailMessage = 'Your booking has been approved! Please complete the payment using the link below to confirm your reservation.';
      emailSubject = 'Payment Required - Action Needed';
    } else if (booking.status === 'pending') {
      emailMessage = 'Your booking has been reviewed and approved! Please complete the payment using the link below to proceed with your reservation.';
      emailSubject = 'Payment Required - Complete Your Booking';
    } else if (booking.status === 'confirmed') {
      // Even if confirmed, if payment link is present, it might be for additional payment
      emailMessage = 'Your booking is confirmed. Please complete the payment using the link below if payment is still pending.';
      emailSubject = 'Payment Link - Complete Your Booking';
    } else {
      emailMessage = 'Please complete the payment using the link below.';
      emailSubject = 'Payment Required';
    }
  }

  const pickupDate = new Date(booking.pickup_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const pickupTime = new Date(booking.pickup_date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const dropoffDate = new Date(booking.dropoff_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const dropoffTime = new Date(booking.dropoff_date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get the logo and vehicle image URLs - MUST be publicly accessible URLs!
  const logoUrl = process.env.EMAIL_LOGO_URL || 
                  (process.env.PUBLIC_FRONTEND_URL ? `${process.env.PUBLIC_FRONTEND_URL}/logodb.png` : 
                   process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/logodb.png` : '');
  
  const vehicleImageUrl = getVehicleImageUrl(booking.vehicle_images);
  
  console.log('[Email] Sending status email with logo:', logoUrl);
  console.log('[Email] Vehicle image:', vehicleImageUrl || 'No vehicle image');
  console.log('[Email] Status:', booking.status);

  // Build payment link section if available - make it more prominent
  const paymentLinkHtml = booking.payment_link
    ? `
      <tr>
        <td style="padding: 0 40px 20px 40px;">
          <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 25px; text-align: center;">
            <h3 style="margin-top: 0; color: #10b981; font-size: 22px;">💰 Payment Required</h3>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Please complete your payment to secure your booking. Click the button below to proceed:</p>
        <a href="${booking.payment_link}" 
               style="display: inline-block; background-color: #10b981; color: white; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 10px 0;">
          💳 Complete Payment Now
        </a>
            <p style="margin-top: 15px; font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 13px;"><a href="${booking.payment_link}" style="color: #10b981;">${booking.payment_link}</a></p>
            <p style="margin-top: 15px; font-size: 13px; color: #888; font-style: italic;">Please complete payment as soon as possible to confirm your reservation.</p>
      </div>
        </td>
      </tr>
    `
    : '';

  // Build notes section if available
  const notesHtml = booking.notes
    ? `
      <tr>
        <td style="padding: 0 40px 20px 40px;">
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #f59e0b; font-size: 18px;">Additional Notes</h3>
            <p style="margin: 0; color: #333; line-height: 1.6;">${booking.notes}</p>
      </div>
        </td>
      </tr>
    `
    : '';

  const customerHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 0; margin: 0;">
          <tr>
            <td align="center" style="padding: 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 40px 20px 40px; text-align: center;">
                    ${logoUrl ? 
                      `<img src="${logoUrl}" alt="DB Luxury Cars" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />` :
                      `<h1 style="color: #ffffff; margin: 0; font-size: 32px;">DB Luxury Cars</h1>`
                    }
                  </td>
                </tr>

                <!-- Status Badge (Subtle) -->
                <tr>
                  <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 0 40px 30px 40px; text-align: center;">
                    <div style="display: inline-block; background-color: ${statusContent.statusColor}15; border: 1px solid ${statusContent.statusColor}30; padding: 8px 20px; border-radius: 20px;">
                      <span style="color: ${statusContent.statusColor}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">● ${statusContent.heading}</span>
                    </div>
                  </td>
                </tr>

                <!-- Vehicle Image -->
                ${vehicleImageUrl ? `
                <tr>
                  <td style="padding: 0;">
                    <img src="${vehicleImageUrl}" alt="${booking.make} ${booking.model}" style="width: 100%; max-width: 600px; height: auto; display: block;" />
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 40px; text-align: center; background-color: #1a1a1a;">
                    <h3 style="color: #ffffff; margin: 0;">${booking.make} ${booking.model}</h3>
                  </td>
                </tr>
                `}

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 0;">Dear ${booking.first_name} ${booking.last_name},</p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">${emailMessage}</p>
                  </td>
                </tr>

                <!-- Payment Link Section -->
        ${paymentLinkHtml}

                <!-- Notes Section -->
        ${notesHtml}
        
                <!-- Booking Details -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <div style="background-color: #f9fafb; border-left: 4px solid ${statusContent.statusColor}; padding: 20px;">
                      <h3 style="margin-top: 0; color: ${statusContent.statusColor}; font-size: 18px;">Booking Details</h3>
                      
                      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong style="color: #666;">Booking Number:</strong></td>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right; color: #333;">${booking.booking_number}</td>
          </tr>
          <tr>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong style="color: #666;">Status:</strong></td>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right; color: ${statusContent.statusColor}; font-weight: bold; text-transform: capitalize;">${booking.status.replace('_', ' ')}</td>
          </tr>
          <tr>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong style="color: #666;">Vehicle:</strong></td>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right; color: #333;">${booking.make} ${booking.model}${booking.year ? ' (' + booking.year + ')' : ''}</td>
          </tr>
          <tr>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong style="color: #666;">Pickup Location:</strong></td>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right; color: #333;">${booking.pickup_location_name}${booking.pickup_location_city ? ', ' + booking.pickup_location_city : ''}</td>
          </tr>
          <tr>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong style="color: #666;">Pickup Date:</strong></td>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right; color: #333;">${pickupDate} ${pickupTime}</td>
          </tr>
          <tr>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong style="color: #666;">Dropoff Location:</strong></td>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right; color: #333;">${booking.dropoff_location_name}${booking.dropoff_location_city ? ', ' + booking.dropoff_location_city : ''}</td>
          </tr>
          <tr>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong style="color: #666;">Dropoff Date:</strong></td>
                          <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right; color: #333;">${dropoffDate} ${dropoffTime}</td>
          </tr>
          <tr>
                          <td style="padding: 12px 0;"><strong style="color: #666;">Total Price:</strong></td>
                          <td style="padding: 12px 0; text-align: right; color: ${statusContent.statusColor}; font-size: 20px; font-weight: bold;">€${booking.total_price.toFixed(2)}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 25px;">If you have any questions, please don't hesitate to contact us.</p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 0;">Best regards,<br><strong>DB Luxury Cars Team</strong></p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
                    <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">DB Luxury Cars - Premium Car Rental Service</p>
                    <p style="color: #666; font-size: 12px; margin: 0;">This email was sent to ${booking.email}</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const customerPayload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: booking.email, name: `${booking.first_name} ${booking.last_name}` }],
    subject: `${emailSubject} - ${booking.booking_number}`,
    htmlContent: customerHtml,
  };

  const adminPayload = adminEmail
    ? {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: adminEmail, name: 'DB Luxury Cars Admin' }],
        subject: `Booking Status Changed - ${booking.booking_number} (${booking.status})`,
        htmlContent: `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 0; margin: 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 40px 20px 40px; text-align: center;">
                          ${logoUrl ? 
                            `<img src="${logoUrl}" alt="DB Luxury Cars" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />` :
                            `<h1 style="color: #ffffff; margin: 0; font-size: 32px;">DB Luxury Cars</h1>`
                          }
                        </td>
                      </tr>

                      <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 0 40px 30px 40px; text-align: center;">
                          <div style="display: inline-block; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); padding: 8px 20px; border-radius: 20px;">
                            <span style="color: #f97316; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">● Status Updated</span>
                          </div>
                        </td>
                      </tr>

                      ${vehicleImageUrl ? `
                      <tr>
                        <td style="padding: 0;">
                          <img src="${vehicleImageUrl}" alt="${booking.make} ${booking.model}" style="width: 100%; max-width: 600px; height: auto; display: block;" />
                        </td>
                      </tr>
                      ` : `
                      <tr>
                        <td style="padding: 40px; text-align: center; background-color: #1a1a1a;">
                          <h3 style="color: #ffffff; margin: 0;">${booking.make} ${booking.model}</h3>
                        </td>
                      </tr>
                      `}

                      <tr>
                        <td style="padding: 40px;">
                          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 0;">Booking <strong>${booking.booking_number}</strong> status has been updated to:</p>
                          <p style="font-size: 22px; color: ${statusContent.statusColor}; font-weight: bold; text-transform: capitalize; margin: 15px 0;">${booking.status.replace('_', ' ')}</p>
                        </td>
                      </tr>

                      ${booking.payment_link ? `
                      <tr>
                        <td style="padding: 0 40px 20px 40px;">
                          <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px;">
                            <h3 style="margin-top: 0; color: #10b981;">Payment Link Sent</h3>
                            <p style="margin: 0; word-break: break-all;"><a href="${booking.payment_link}" style="color: #10b981;">${booking.payment_link}</a></p>
                          </div>
                        </td>
                      </tr>
                      ` : ''}

                      ${booking.notes ? `
                      <tr>
                        <td style="padding: 0 40px 20px 40px;">
                          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px;">
                            <h3 style="margin-top: 0; color: #f59e0b;">Notes</h3>
                            <p style="margin: 0;">${booking.notes}</p>
                          </div>
                        </td>
                      </tr>
                      ` : ''}

                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <h3 style="color: #f97316; font-size: 18px; margin-top: 0;">Booking Details</h3>
                          <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                            <tr>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Booking Number:</strong></td>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.booking_number}</td>
                            </tr>
                            <tr>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Customer:</strong></td>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.first_name} ${booking.last_name}</td>
                            </tr>
                            <tr>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Email:</strong></td>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;"><a href="mailto:${booking.email}" style="color: #f97316;">${booking.email}</a></td>
                </tr>
                <tr>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Phone:</strong></td>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.phone}</td>
                </tr>
                <tr>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Vehicle:</strong></td>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.make} ${booking.model}${booking.year ? ' (' + booking.year + ')' : ''}</td>
                </tr>
                <tr>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Pickup:</strong></td>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.pickup_location_name} - ${pickupDate} ${pickupTime}</td>
                </tr>
                <tr>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0;"><strong>Dropoff:</strong></td>
                              <td style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: right;">${booking.dropoff_location_name} - ${dropoffDate} ${dropoffTime}</td>
                </tr>
                <tr>
                              <td style="padding: 12px 0;"><strong>Total Price:</strong></td>
                              <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: bold; color: #f97316;">€${booking.total_price.toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
                          <p style="color: #999; font-size: 14px; margin: 0;">DB Luxury Cars Admin Notification</p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }
    : null;

  try {
    console.log('[Brevo] Sending customer email to:', booking.email);
    console.log('[Brevo] Email subject:', customerPayload.subject);
    console.log('[Brevo] Has payment link:', !!booking.payment_link);
    
    const customerResponse = await axios.post(BREVO_API_URL, customerPayload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });
    console.log('[Brevo] Customer email sent successfully. Response status:', customerResponse.status);

    if (adminPayload) {
      console.log('[Brevo] Sending admin email to:', adminEmail);
      const adminResponse = await axios.post(BREVO_API_URL, adminPayload, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      });
      console.log('[Brevo] Admin email sent successfully. Response status:', adminResponse.status);
    }

    console.log(
      '[Brevo] ✅ Booking status email sent successfully for booking:',
      booking.booking_number,
      'status:',
      booking.status,
      'to:',
      booking.email
    );
  } catch (error: any) {
    console.error('[Brevo] ❌ Failed to send booking status email:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      booking_number: booking.booking_number,
      customer_email: booking.email,
    });
    
    // Re-throw the error so caller knows it failed
    throw error;
  }
}

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail(contact: ContactEmailData) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || process.env.BREVO_DEFAULT_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'DB Luxury Cars';
  const adminEmail = process.env.BREVO_ADMIN_EMAIL;

  if (!apiKey || !senderEmail) {
    console.warn(
      '[Brevo] Missing BREVO_API_KEY or BREVO_SENDER_EMAIL. Skipping contact email send.'
    );
    return;
  }

  const adminHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #f97316;">New Contact Form Submission</h2>
        <p>A new message has been received through the contact form:</p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #f97316; padding: 20px; margin: 20px 0;">
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">${contact.message}</p>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="mailto:${contact.email}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reply to ${contact.name}
          </a>
        </p>
        
        <p style="margin-top: 20px; color: #666; font-size: 0.9em;">
          This is an automated notification from the DB Luxury Cars contact form.
        </p>
      </body>
    </html>
  `;

  const customerHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #10b981;">Thank You for Contacting Us</h2>
        <p>Dear ${contact.name},</p>
        <p>Thank you for reaching out to DB Luxury Cars. We have received your message and will get back to you as soon as possible.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">${contact.message}</p>
        </div>
        
        <p>Our team typically responds within 24 hours. If your inquiry is urgent, please call us at <strong>+212 524 123456</strong>.</p>
        
        <p>Best regards,<br>DB Luxury Cars Team</p>
      </body>
    </html>
  `;

  const adminPayload = adminEmail
    ? {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: adminEmail, name: 'DB Luxury Cars Admin' }],
        subject: `New Contact Form Submission from ${contact.name}`,
        htmlContent: adminHtml,
      }
    : null;

  const customerPayload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: contact.email, name: contact.name }],
    subject: 'Thank You for Contacting DB Luxury Cars',
    htmlContent: customerHtml,
  };

  try {
    // Send to admin
    if (adminPayload) {
      await axios.post(BREVO_API_URL, adminPayload, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      });
      console.log('[Brevo] Contact form notification sent to admin');
    }

    // Send confirmation to customer
    await axios.post(BREVO_API_URL, customerPayload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });
    console.log('[Brevo] Contact form confirmation sent to customer:', contact.email);
  } catch (error: any) {
    console.error('[Brevo] Failed to send contact email:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

