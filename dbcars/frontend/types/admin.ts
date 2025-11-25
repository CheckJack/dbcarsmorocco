/**
 * Admin-related TypeScript interfaces
 */

export interface AdminStatistics {
  // Bookings data
  today_pickups: number;
  today_returns: number;
  monthly_revenue: number;
  monthly_bookings: number;
  upcoming_reservations: number;
  pending_bookings: number;
  active_rentals: number;
  total_revenue: number;
  status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  recent_bookings: AdminBooking[];
  upcoming_pickups: AdminBooking[];
  upcoming_returns: AdminBooking[];
  revenue_change: string;
  
  // Vehicle statistics
  total_vehicles: number;
  vehicles_by_category: Array<{
    category: string;
    count: number;
  }>;
  popular_vehicles: Array<{
    id: string;
    make: string;
    model: string;
    bookings_count: number;
  }>;
  vehicle_utilization: Array<{
    id: string;
    make: string;
    model: string;
    total_subunits: number;
    rented_subunits: number;
    available_subunits: number;
  }>;
  
  // Customer statistics
  total_customers: number;
  new_customers_this_month: number;
  top_customers: Array<{
    customer_id: string;
    first_name: string;
    last_name: string;
    total_bookings: number;
    total_spent: number;
  }>;
  repeat_customer_rate: number;
  
  // Revenue analytics
  revenue_by_category: Array<{
    category: string;
    revenue: number;
  }>;
  revenue_by_location: Array<{
    location_name: string;
    revenue: number;
  }>;
  
  // Extras statistics
  total_extras: number;
  popular_extras: Array<{
    extra_id: string;
    name: string;
    times_booked: number;
  }>;
  
  // Blog statistics
  total_blog_posts: number;
}

export interface AdminBooking {
  id: string;
  booking_number: string;
  status: BookingStatus;
  pickup_date: string;
  dropoff_date: string;
  total_price: number;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: number;
  };
  pickup_location?: {
    id: string;
    name: string;
    city: string;
  };
  dropoff_location?: {
    id: string;
    name: string;
    city: string;
  };
  created_at: string;
  updated_at: string;
  notes?: string | null;
  payment_link?: string | null;
}

export type BookingStatus = 
  | 'pending'
  | 'waiting_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface AdminCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  is_blacklisted?: boolean;
  blacklist_reason?: string | null;
  bookings_count?: number;
}

export interface AdminVehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  category: string;
  price_per_day: number;
  is_active: boolean;
  images?: string | string[];
  created_at: string;
  updated_at: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  vehicle_id?: string;
  date_from?: string;
  date_to?: string;
  booking_number?: string;
  customer_name?: string;
  vehicle_search?: string;
  page?: number;
  per_page?: number;
}

