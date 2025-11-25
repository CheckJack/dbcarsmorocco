export interface HelpSection {
  title: string;
  content: string[];
}

export interface HelpContent {
  title: string;
  description: string;
  sections: HelpSection[];
}

export type HelpContentMap = {
  [key: string]: HelpContent;
};

export const helpContent: HelpContentMap = {
  '/admin/dashboard': {
    title: 'Dashboard Overview',
    description: 'Your main control center for monitoring business metrics, pending bookings, and key activities.',
    sections: [
      {
        title: 'Understanding the Dashboard',
        content: [
          'The dashboard provides a real-time overview of your business performance.',
          'Key metrics include: pending bookings count, active rentals, revenue statistics, and recent activities.',
          'Data automatically refreshes every 60 seconds to keep information current.',
        ],
      },
      {
        title: 'Key Metrics',
        content: [
          'Pending Bookings: Shows the number of bookings waiting for confirmation.',
          'Active Rentals: Displays currently active rental periods.',
          'Revenue Statistics: View total revenue, average booking value, and trends.',
          'Upcoming Pickups/Returns: See scheduled vehicle collections and returns.',
        ],
      },
      {
        title: 'Quick Actions',
        content: [
          'Click on any metric card to view detailed information.',
          'Use the refresh button to manually update statistics.',
          'Navigate to specific sections using the sidebar menu.',
        ],
      },
      {
        title: 'Tips',
        content: [
          'Check pending bookings regularly to ensure timely confirmations.',
          'Monitor active rentals to track vehicle availability.',
          'Review revenue trends to understand business patterns.',
        ],
      },
    ],
  },
  '/admin/bookings': {
    title: 'Managing Bookings',
    description: 'View, filter, and manage all customer bookings. Update statuses, view details, and handle confirmations.',
    sections: [
      {
        title: 'Viewing Bookings',
        content: [
          'All bookings are displayed in a table format with key information visible.',
          'Use the search bar to find bookings by booking number or customer name.',
          'Apply filters to narrow down results by status, date range, or vehicle.',
        ],
      },
      {
        title: 'Booking Statuses',
        content: [
          'Pending: Bookings awaiting confirmation or payment.',
          'Confirmed: Bookings that have been confirmed and are scheduled.',
          'Active: Currently ongoing rentals.',
          'Completed: Finished rentals.',
          'Cancelled: Cancelled bookings with optional notes.',
        ],
      },
      {
        title: 'Common Tasks',
        content: [
          'To confirm a booking: Click the booking, review details, and update status to "Confirmed".',
          'To view full details: Click the eye icon or booking number to see complete information.',
          'To cancel a booking: Update status to "Cancelled" and add cancellation notes.',
          'To create a new booking: Click the "New Booking" button in the top right.',
          'To filter bookings: Use the filter panel to select status, dates, or vehicle.',
        ],
      },
      {
        title: 'Bulk Actions',
        content: [
          'Select multiple bookings using checkboxes to perform bulk operations.',
          'Use bulk actions for confirming or updating multiple bookings at once.',
        ],
      },
      {
        title: 'Tips',
        content: [
          'Check pending bookings regularly to avoid delays.',
          'Always review booking details before confirming.',
          'Add cancellation notes when cancelling bookings for record-keeping.',
        ],
      },
    ],
  },
  '/admin/vehicles': {
    title: 'Vehicle Management',
    description: 'Add, edit, and manage your vehicle fleet. Update pricing, availability, images, and specifications.',
    sections: [
      {
        title: 'Vehicle List',
        content: [
          'View all vehicles in your fleet with key details at a glance.',
          'Search vehicles by name, model, or category.',
          'Filter by category or status (active/inactive).',
        ],
      },
      {
        title: 'Adding a New Vehicle',
        content: [
          'Click the "Add Vehicle" button in the top right corner.',
          'Fill in all required fields: name, category, pricing, and specifications.',
          'Upload high-quality images (main image and gallery images).',
          'Set availability and pricing (per day, per week).',
          'Save the vehicle to make it available for booking.',
        ],
      },
      {
        title: 'Editing Vehicles',
        content: [
          'Click the edit icon on any vehicle card or use the actions menu.',
          'Update any field including pricing, images, or specifications.',
          'Changes are saved immediately when you click "Save".',
        ],
      },
      {
        title: 'Vehicle Status',
        content: [
          'Active: Vehicle is available for booking.',
          'Inactive: Vehicle is hidden from the website but remains in the system.',
          'Toggle status to temporarily remove vehicles from public view.',
        ],
      },
      {
        title: 'Important Notes',
        content: [
          'Always upload clear, high-quality images for better customer appeal.',
          'Keep pricing information up to date.',
          'Regularly update vehicle specifications to ensure accuracy.',
        ],
      },
    ],
  },
  '/admin/extras': {
    title: 'Extras Management',
    description: 'Manage additional services and products that customers can add to their bookings (GPS, insurance, etc.).',
    sections: [
      {
        title: 'What are Extras?',
        content: [
          'Extras are additional services or products customers can add to bookings.',
          'Examples: GPS navigation, insurance, child seats, additional drivers.',
        ],
      },
      {
        title: 'Adding an Extra',
        content: [
          'Click the "Add Extra" button to create a new extra.',
          'Enter a descriptive name and detailed description.',
          'Set the price and price type (per rental, per day, or per week).',
          'Upload a cover image to showcase the extra.',
          'Mark as active to make it available for selection.',
        ],
      },
      {
        title: 'Editing Extras',
        content: [
          'Click the edit icon on any extra card.',
          'Update name, description, pricing, or images.',
          'Save changes to apply updates.',
        ],
      },
      {
        title: 'Pricing Types',
        content: [
          'Per Rental: One-time charge regardless of rental duration.',
          'Per Day: Charge multiplied by number of rental days.',
          'Per Week: Charge multiplied by number of weeks.',
        ],
      },
      {
        title: 'Tips',
        content: [
          'Use clear, descriptive names and images for extras.',
          'Set competitive pricing that reflects the value of the service.',
          'Keep extras active only when available to avoid customer confusion.',
        ],
      },
    ],
  },
  '/admin/coupons': {
    title: 'Coupon Management',
    description: 'Create and manage discount coupons and promotional codes for customers.',
    sections: [
      {
        title: 'Creating Coupons',
        content: [
          'Click "Add Coupon" to create a new discount code.',
          'Enter a unique coupon code that customers will use.',
          'Set discount type: percentage or fixed amount.',
          'Define validity period (start and end dates).',
          'Set usage limits (maximum uses, uses per customer).',
        ],
      },
      {
        title: 'Coupon Types',
        content: [
          'Percentage Discount: Applies a percentage off the total.',
          'Fixed Amount: Applies a fixed currency amount discount.',
        ],
      },
      {
        title: 'Managing Coupons',
        content: [
          'View all active and expired coupons in the list.',
          'Edit existing coupons to update terms or extend validity.',
          'Deactivate coupons to stop accepting them without deleting.',
        ],
      },
      {
        title: 'Best Practices',
        content: [
          'Use clear, memorable coupon codes.',
          'Set appropriate expiry dates for promotions.',
          'Monitor usage to track campaign effectiveness.',
        ],
      },
    ],
  },
  '/admin/locations': {
    title: 'Location Management',
    description: 'Manage pickup and drop-off locations for vehicle rentals.',
    sections: [
      {
        title: 'Adding Locations',
        content: [
          'Click "Add Location" to create a new pickup/drop-off point.',
          'Enter location name and full address.',
          'Add contact information if needed.',
          'Set location status as active or inactive.',
        ],
      },
      {
        title: 'Managing Locations',
        content: [
          'Edit location details at any time.',
          'Deactivate locations that are temporarily unavailable.',
          'Keep address and contact information current.',
        ],
      },
      {
        title: 'Tips',
        content: [
          'Ensure addresses are complete and accurate.',
          'Update locations immediately if details change.',
        ],
      },
    ],
  },
  '/admin/customers': {
    title: 'Customer Management',
    description: 'View and manage customer information, booking history, and contact details.',
    sections: [
      {
        title: 'Viewing Customers',
        content: [
          'Browse all customers in a searchable list.',
          'Search by name, email, or phone number.',
          'Click on a customer to view full details and booking history.',
        ],
      },
      {
        title: 'Customer Details',
        content: [
          'View complete customer profile including contact information.',
          'See all bookings associated with the customer.',
          'Access booking history and rental patterns.',
        ],
      },
      {
        title: 'Important Notes',
        content: [
          'Customer information is automatically created when bookings are made.',
          'Use this section to look up customer details when needed.',
          'Keep customer data private and secure.',
        ],
      },
    ],
  },
  '/admin/users': {
    title: 'User Management',
    description: 'Manage admin users who have access to the admin panel.',
    sections: [
      {
        title: 'Admin Users',
        content: [
          'View all users with admin panel access.',
          'Each user has a role that determines their permissions.',
        ],
      },
      {
        title: 'Adding Users',
        content: [
          'Click "Add User" to create a new admin account.',
          'Provide name, email, and set appropriate permissions.',
          'New users will receive login credentials.',
        ],
      },
      {
        title: 'Managing Users',
        content: [
          'Edit user information and permissions.',
          'Deactivate users who no longer need access.',
          'Reset passwords when requested.',
        ],
      },
      {
        title: 'Security Tips',
        content: [
          'Only grant admin access to trusted team members.',
          'Use strong passwords and encourage regular updates.',
          'Review user access regularly and remove inactive accounts.',
        ],
      },
    ],
  },
  '/admin/availability': {
    title: 'Availability Management',
    description: 'Manage vehicle availability, block dates, and set availability calendars.',
    sections: [
      {
        title: 'Setting Availability',
        content: [
          'View and manage vehicle availability calendars.',
          'Block specific dates when vehicles are unavailable.',
          'Set recurring availability patterns.',
        ],
      },
      {
        title: 'Blocking Dates',
        content: [
          'Select a vehicle and date range to block.',
          'Add a reason for the block (maintenance, special event, etc.).',
          'Blocked dates prevent bookings during that period.',
        ],
      },
      {
        title: 'Calendar View',
        content: [
          'Use calendar view to see availability at a glance.',
          'Different colors indicate available, booked, or blocked dates.',
        ],
      },
      {
        title: 'Tips',
        content: [
          'Block dates well in advance for maintenance schedules.',
          'Review availability regularly to ensure accuracy.',
          'Coordinate with bookings to avoid conflicts.',
        ],
      },
    ],
  },
  '/admin/blog': {
    title: 'Blog Management',
    description: 'Create, edit, and publish blog posts to engage customers and improve SEO.',
    sections: [
      {
        title: 'Creating Blog Posts',
        content: [
          'Click "New Post" to create a blog article.',
          'Enter a compelling title and write your content using the rich text editor.',
          'Add an excerpt (short summary) for the blog listing page.',
          'Upload a featured image for visual appeal.',
          'Use formatting tools to structure your content with headings, lists, and links.',
        ],
      },
      {
        title: 'Rich Text Editor',
        content: [
          'Use the editor toolbar to format text (bold, italic, headings).',
          'Insert links, lists, and images within your content.',
          'Preview your content before publishing.',
        ],
      },
      {
        title: 'Publishing Posts',
        content: [
          'Save drafts to work on posts over time.',
          'Toggle the "Published" status to make posts live on the website.',
          'Unpublished posts remain as drafts and are not visible to customers.',
        ],
      },
      {
        title: 'Managing Posts',
        content: [
          'Edit any published or draft post at any time.',
          'Delete posts that are no longer needed.',
          'View published date and last updated timestamp.',
        ],
      },
      {
        title: 'Tips',
        content: [
          'Write engaging, SEO-friendly content to attract customers.',
          'Use high-quality featured images for better visual impact.',
          'Keep content updated and relevant to your business.',
        ],
      },
    ],
  },
  '/admin/statistics': {
    title: 'Statistics & Reports',
    description: 'View detailed statistics, reports, and analytics about your business performance.',
    sections: [
      {
        title: 'Available Reports',
        content: [
          'Revenue reports: Track income over time periods.',
          'Booking statistics: Analyze booking patterns and trends.',
          'Vehicle performance: See which vehicles are most popular.',
          'Customer analytics: Understand customer behavior.',
        ],
      },
      {
        title: 'Using Statistics',
        content: [
          'Select date ranges to filter report data.',
          'Export reports for external analysis if needed.',
          'Compare periods to identify trends.',
        ],
      },
      {
        title: 'Key Metrics',
        content: [
          'Monitor revenue growth and booking volumes.',
          'Identify peak seasons and popular vehicles.',
          'Track customer acquisition and retention.',
        ],
      },
      {
        title: 'Tips',
        content: [
          'Review statistics regularly to make informed business decisions.',
          'Use data to optimize pricing and availability.',
          'Identify trends to improve marketing strategies.',
        ],
      },
    ],
  },
  '/admin': {
    title: 'Admin Panel Overview',
    description: 'Welcome to the admin panel. Use the sidebar navigation to access different sections.',
    sections: [
      {
        title: 'Navigation',
        content: [
          'Use the sidebar menu to navigate between different sections.',
          'Each section handles a specific aspect of your business.',
          'The active page is highlighted in the sidebar.',
        ],
      },
      {
        title: 'Getting Help',
        content: [
          'Click the help icon (?) in the top right corner for contextual help.',
          'Help content changes based on which page you are viewing.',
          'Each section has specific instructions for common tasks.',
        ],
      },
      {
        title: 'Quick Access',
        content: [
          'Dashboard: Overview of your business metrics.',
          'Bookings: Manage all customer reservations.',
          'Vehicles: Manage your vehicle fleet.',
          'Extras: Configure additional services.',
          'Settings: Adjust system configurations.',
        ],
      },
    ],
  },
};

// Helper function to get help content for a route
export function getHelpContent(pathname: string): HelpContent | null {
  // Try exact match first
  if (helpContent[pathname]) {
    return helpContent[pathname];
  }

  // Try matching parent routes for nested paths
  const pathParts = pathname.split('/').filter(Boolean);
  for (let i = pathParts.length; i > 0; i--) {
    const testPath = '/' + pathParts.slice(0, i).join('/');
    if (helpContent[testPath]) {
      return helpContent[testPath];
    }
  }

  // Fallback to main admin page
  return helpContent['/admin'] || null;
}

