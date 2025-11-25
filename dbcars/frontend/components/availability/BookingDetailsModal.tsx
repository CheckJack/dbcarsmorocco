'use client';

import { X, Calendar, User, Car, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAdminBookings } from '@/lib/api';

interface BookingDetailsModalProps {
  isOpen: boolean;
  date: Date;
  vehicleId?: string;
  onClose: () => void;
}

export default function BookingDetailsModal({
  isOpen,
  date,
  vehicleId,
  onClose,
}: BookingDetailsModalProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen, date, vehicleId]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const data = await getAdminBookings({
        date_from: dateStr,
        date_to: dateStr,
        vehicle_id: vehicleId,
      });
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Bookings for {date.toLocaleDateString()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found for this date</div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-800 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Car className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                        <span className="text-sm sm:text-base font-semibold text-white">
                          {booking.vehicle_make} {booking.vehicle_model}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        Booking #{booking.booking_number}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-800 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                      <span>
                        {new Date(booking.pickup_date).toLocaleDateString()} -{' '}
                        {new Date(booking.dropoff_date).toLocaleDateString()}
                      </span>
                    </div>
                    {booking.customer_name && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                        <span className="truncate">{booking.customer_name}</span>
                      </div>
                    )}
                    {booking.customer_email && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                        <span className="truncate">{booking.customer_email}</span>
                      </div>
                    )}
                    {booking.customer_phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                        <span>{booking.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

