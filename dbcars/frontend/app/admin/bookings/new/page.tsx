'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomerSearch from '@/components/CustomerSearch';
import { 
  getVehicles, 
  getLocations, 
  getExtras, 
  createBooking,
  checkAvailability,
  getDraft,
  saveDraft,
  deleteDraft,
  getVehicle,
  updateBookingStatus 
} from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  base_price_daily: number;
  images: string[];
  features: string[];
  seats: number;
  transmission: string;
  fuel_type: string;
  subunits: any[];
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country?: string;
}

interface Extra {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_type: 'per_rental' | 'per_day' | 'per_week';
  cover_image?: string;
}

interface SelectedExtra {
  id: string;
  quantity: number;
}

export default function AdminCreateBookingPage() {
  const router = useRouter();
  
  // Date selection
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [rentalDays, setRentalDays] = useState(0);
  
  // Date picker visibility
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showDropoffDatePicker, setShowDropoffDatePicker] = useState(false);
  
  // Refs for click outside detection
  const pickupDateRef = useRef<HTMLDivElement>(null);
  const dropoffDateRef = useRef<HTMLDivElement>(null);
  
  // Refs for step sections (for auto-scrolling)
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);

  // Available data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [allExtras, setAllExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingVehicles, setSearchingVehicles] = useState(false);

  // Selected data
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [pickupLocationId, setPickupLocationId] = useState('');
  const [dropoffLocationId, setDropoffLocationId] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);

  // Customer data
  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    license_number: '',
    license_country: '',
    license_expiry: '',
    address: '',
    city: '',
    country: '',
  });

  // Pricing
  const [basePrice, setBasePrice] = useState(0);
  const [extrasPrice, setExtrasPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Notes
  const [notes, setNotes] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Manual price adjustments
  const [showManualAdjustments, setShowManualAdjustments] = useState(false);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [manualFee, setManualFee] = useState(0);
  const [priceAdjustmentReason, setPriceAdjustmentReason] = useState('');

  // Draft management
  const searchParams = useSearchParams();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Error modal
  const [errorModal, setErrorModal] = useState<{
    title: string;
    message: string;
    actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>;
  } | null>(null);

  // Booking summary minimize state
  const [isSummaryMinimized, setIsSummaryMinimized] = useState(false);

  // Payment link modal
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [locationsData, extrasData] = await Promise.all([
        getLocations(),
        getExtras(),
      ]);
      setAllLocations(locationsData);
      setAllExtras(extrasData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  // Validate coupon code
  const validateCouponCode = async () => {
    if (!couponCode) return;
    
    setCouponError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(
        `${apiUrl}/coupons/${couponCode}?total_amount=${totalPrice}&rental_days=${rentalDays}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        setCouponError(error.error || 'Invalid coupon');
        setAppliedCoupon(null);
        return;
      }
      
      const coupon = await response.json();
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied: ${coupon.code}`);
    } catch (error: any) {
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    }
  };

  // Save draft to backend
  const saveDraftToBackend = async () => {
    if (!pickupDate && !selectedVehicle && !customerData.first_name) {
      return; // Nothing to save
    }
    
    setIsSavingDraft(true);
    try {
      const draftData = {
        id: draftId || undefined,
        draft_data: {
          pickupDate: pickupDate?.toISOString(),
          pickupTime,
          dropoffDate: dropoffDate?.toISOString(),
          dropoffTime,
          selectedVehicle,
          pickupLocationId,
          dropoffLocationId,
          selectedExtras,
          customerData,
          notes,
          couponCode,
          appliedCoupon,
          manualDiscount,
          manualFee,
          priceAdjustmentReason
        },
        customer_name: customerData.first_name ? 
          `${customerData.first_name} ${customerData.last_name}`.trim() : null,
        vehicle_name: selectedVehicle ? 
          `${selectedVehicle.make} ${selectedVehicle.model}` : null,
        total_price: totalPrice || null
      };
      
      const saved = await saveDraft(draftData);
      setDraftId(saved.id);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Load draft from URL param
  useEffect(() => {
    const draftParam = searchParams.get('draft');
    if (draftParam) {
      loadDraft(draftParam);
    }
  }, [searchParams]);

  const loadDraft = async (id: string) => {
    try {
      const draft = await getDraft(id);
      const data = draft.draft_data;
      
      // Restore all state
      if (data.pickupDate) setPickupDate(new Date(data.pickupDate));
      if (data.pickupTime) setPickupTime(data.pickupTime);
      if (data.dropoffDate) setDropoffDate(new Date(data.dropoffDate));
      if (data.dropoffTime) setDropoffTime(data.dropoffTime);
      if (data.selectedVehicle) setSelectedVehicle(data.selectedVehicle);
      if (data.pickupLocationId) setPickupLocationId(data.pickupLocationId);
      if (data.dropoffLocationId) setDropoffLocationId(data.dropoffLocationId);
      if (data.selectedExtras) setSelectedExtras(data.selectedExtras);
      if (data.customerData) setCustomerData(data.customerData);
      if (data.notes) setNotes(data.notes);
      if (data.couponCode) setCouponCode(data.couponCode);
      if (data.appliedCoupon) setAppliedCoupon(data.appliedCoupon);
      if (data.manualDiscount) setManualDiscount(data.manualDiscount);
      if (data.manualFee) setManualFee(data.manualFee);
      if (data.priceAdjustmentReason) setPriceAdjustmentReason(data.priceAdjustmentReason);
      
      setDraftId(id);
      toast.success('Draft loaded successfully');
    } catch (error) {
      console.error('Failed to load draft:', error);
      toast.error('Failed to load draft');
    }
  };

  // Auto-save draft every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraftToBackend();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [
    pickupDate, pickupTime, dropoffDate, dropoffTime,
    selectedVehicle, pickupLocationId, dropoffLocationId,
    selectedExtras, customerData, notes, couponCode,
    appliedCoupon, manualDiscount, manualFee, priceAdjustmentReason,
    draftId, totalPrice
  ]);

  // Auto-scroll to next step when current step is completed
  useEffect(() => {
    if (pickupDate && dropoffDate && rentalDays > 0) {
      // Step 1 complete (Dates)
      // If locations are already selected, scroll to cars, otherwise scroll to locations
      const timer = setTimeout(() => {
        if (pickupLocationId && dropoffLocationId) {
          // Locations already selected, scroll to cars
          if (step3Ref.current) {
            step3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          // No locations selected yet, scroll to locations section
          if (step2Ref.current) {
            step2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pickupDate, dropoffDate, rentalDays, pickupLocationId, dropoffLocationId]);

  useEffect(() => {
    if (pickupLocationId && dropoffLocationId && vehicles.length > 0) {
      // Step 2 complete (Locations), and vehicles are loaded - scroll to Step 3 (Vehicle Selection)
      // Wait for vehicles to be rendered in DOM
      const timer = setTimeout(() => {
        if (step3Ref.current) {
          step3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300); // Small delay to ensure DOM is updated with vehicles
      return () => clearTimeout(timer);
    }
  }, [pickupLocationId, dropoffLocationId, vehicles.length]);

  useEffect(() => {
    if (selectedVehicle && allExtras.length > 0) {
      // Step 3 complete (Vehicle selected), scroll to Extras section
      const timer = setTimeout(() => {
        if (extrasRef.current) {
          extrasRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedVehicle, allExtras.length]);

  const handleSaveDraftAndExit = async () => {
    await saveDraftToBackend();
    toast.success('Draft saved!');
    router.push('/admin/bookings/drafts');
  };

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupDateRef.current && !pickupDateRef.current.contains(event.target as Node)) {
        setShowPickupDatePicker(false);
      }
      if (dropoffDateRef.current && !dropoffDateRef.current.contains(event.target as Node)) {
        setShowDropoffDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate rental days when dates change
  useEffect(() => {
    if (pickupDate && dropoffDate) {
      const pickup = new Date(pickupDate);
      const dropoff = new Date(dropoffDate);
      const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
      const [dropoffHour, dropoffMinute] = dropoffTime.split(':').map(Number);
      
      pickup.setHours(pickupHour, pickupMinute, 0, 0);
      dropoff.setHours(dropoffHour, dropoffMinute, 0, 0);
      
      const diffTime = dropoff.getTime() - pickup.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(diffDays > 0 ? diffDays : 0);
    } else {
      setRentalDays(0);
    }
  }, [pickupDate, pickupTime, dropoffDate, dropoffTime]);

  // Auto-search vehicles when dates/times AND locations change
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (pickupDate && dropoffDate && rentalDays > 0 && pickupLocationId && dropoffLocationId) {
      setSearchingVehicles(true);
      
      timer = setTimeout(() => {
        searchAvailableVehicles();
      }, 800);
    } else {
      // Clear vehicles if dates or locations are incomplete
      if (!pickupLocationId || !dropoffLocationId) {
        setVehicles([]);
        setSelectedVehicle(null);
        setSearchingVehicles(false);
      }
    }
    
    return () => clearTimeout(timer);
  }, [pickupDate, pickupTime, dropoffDate, dropoffTime, rentalDays, pickupLocationId, dropoffLocationId]);

  // Search for available vehicles
  const searchAvailableVehicles = async () => {
    if (!pickupDate || !dropoffDate) {
      toast.error('Please select pickup and dropoff dates');
      return;
    }

    if (!pickupLocationId || !dropoffLocationId) {
      toast.error('Please select pickup and dropoff locations');
      return;
    }

    if (rentalDays <= 0) {
      toast.error('Dropoff date must be after pickup date');
      return;
    }

    setSearchingVehicles(true);
    try {
      const pickup = new Date(pickupDate);
      const dropoff = new Date(dropoffDate);
      const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
      const [dropoffHour, dropoffMinute] = dropoffTime.split(':').map(Number);
      
      pickup.setHours(pickupHour, pickupMinute, 0, 0);
      dropoff.setHours(dropoffHour, dropoffMinute, 0, 0);
      
      const vehiclesData = await getVehicles({
        available_from: pickup.toISOString(),
        available_to: dropoff.toISOString(),
      });
      
      setVehicles(vehiclesData);
      
      if (vehiclesData.length === 0) {
        toast.error('No vehicles available for selected dates');
      } else {
        toast.success(`Found ${vehiclesData.length} available vehicle(s)`);
      }
    } catch (error) {
      console.error('Error searching vehicles:', error);
      toast.error('Failed to search for available vehicles');
    } finally {
      setSearchingVehicles(false);
    }
  };

  // Calculate pricing when vehicle or extras change
  useEffect(() => {
    if (selectedVehicle && rentalDays > 0) {
      const base = selectedVehicle.base_price_daily * rentalDays;
      setBasePrice(base);
      
      let extras = 0;
      selectedExtras.forEach((selectedExtra) => {
        const extra = allExtras.find((e) => e.id === selectedExtra.id);
        if (extra) {
          if (extra.price_type === 'per_day') {
            extras += extra.price * rentalDays * selectedExtra.quantity;
          } else {
            extras += extra.price * selectedExtra.quantity;
          }
        }
      });
      setExtrasPrice(extras);
      
      // Calculate coupon discount
      let discount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
          discount = (base + extras) * (appliedCoupon.discount_value / 100);
        } else {
          discount = appliedCoupon.discount_value;
        }
      }
      
      // Apply manual adjustments
      const total = base + extras - discount - manualDiscount + manualFee;
      setTotalPrice(total);
    } else {
      setBasePrice(0);
      setExtrasPrice(0);
      setTotalPrice(0);
    }
  }, [selectedVehicle, rentalDays, selectedExtras, allExtras, appliedCoupon, manualDiscount, manualFee]);

  const handleExtraToggle = (extraId: string) => {
    const existing = selectedExtras.find((e) => e.id === extraId);
    if (existing) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extraId));
    } else {
      setSelectedExtras([...selectedExtras, { id: extraId, quantity: 1 }]);
    }
  };

  const handleExtraQuantityChange = (extraId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extraId));
    } else {
      setSelectedExtras(
        selectedExtras.map((e) => (e.id === extraId ? { ...e, quantity } : e))
      );
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!pickupDate || !dropoffDate) {
      toast.error('Please select pickup and dropoff dates');
      return;
    }

    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    if (!pickupLocationId || !dropoffLocationId) {
      toast.error('Please select pickup and dropoff locations');
      return;
    }

    if (!customerData.first_name || !customerData.last_name || !customerData.email || !customerData.phone) {
      toast.error('Please fill in required customer information (name, email, phone)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Validate manual adjustments
    if ((manualDiscount > 0 || manualFee > 0) && !priceAdjustmentReason.trim()) {
      toast.error('Please provide a reason for price adjustment');
      return;
    }

    setLoading(true);
    try {
      const pickup = new Date(pickupDate!);
      const dropoff = new Date(dropoffDate!);
      const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
      const [dropoffHour, dropoffMinute] = dropoffTime.split(':').map(Number);
      
      pickup.setHours(pickupHour, pickupMinute, 0, 0);
      dropoff.setHours(dropoffHour, dropoffMinute, 0, 0);

      // Prepare notes with manual adjustments
      let finalNotes = notes || '';
      if (manualDiscount > 0 || manualFee > 0) {
        const adjustmentNote = `\n\nPrice Adjustments:\n${
          manualDiscount > 0 ? `- Manual Discount: €${manualDiscount.toFixed(2)}\n` : ''
        }${
          manualFee > 0 ? `- Additional Fee: €${manualFee.toFixed(2)}\n` : ''
        }Reason: ${priceAdjustmentReason}`;
        finalNotes += adjustmentNote;
      }
      
      const bookingData: any = {
        customer: customerData,
        vehicle_id: selectedVehicle.id,
        pickup_location_id: pickupLocationId,
        dropoff_location_id: dropoffLocationId,
        pickup_date: pickup.toISOString(),
        dropoff_date: dropoff.toISOString(),
        extras: selectedExtras,
        notes: finalNotes || undefined,
      };
      
      // Add coupon code if applied
      if (appliedCoupon) {
        bookingData.coupon_code = appliedCoupon.code;
      }

      const result = await createBooking(bookingData);
      
      // Delete draft if exists
      if (draftId) {
        try {
          await deleteDraft(draftId);
        } catch (error) {
          console.error('Failed to delete draft:', error);
        }
      }
      
      toast.success('Booking created successfully!');
      
      // Show payment link modal
      setCreatedBookingId(result.id);
      setShowPaymentLinkModal(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      if (error.response?.status === 409) {
        setErrorModal({
          title: 'Vehicle No Longer Available',
          message: 'This vehicle was just booked by someone else for the selected dates.',
          actions: [
            {
              label: 'Choose Different Dates',
              onClick: () => {
                setErrorModal(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
              variant: 'primary'
            },
            {
              label: 'Choose Different Vehicle',
              onClick: () => {
                setErrorModal(null);
                setSelectedVehicle(null);
                searchAvailableVehicles();
              },
              variant: 'secondary'
            }
          ]
        });
      } else if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors || [];
        setErrorModal({
          title: 'Invalid Booking Information',
          message: validationErrors.length > 0
            ? validationErrors.map((e: any) => `• ${e.param}: ${e.msg}`).join('\n')
            : error.response.data.error || 'Please check your information and try again.',
          actions: [{ label: 'OK', onClick: () => setErrorModal(null), variant: 'primary' }]
        });
      } else {
        setErrorModal({
          title: 'Booking Failed',
          message: error.response?.data?.error || error.message || 'An unexpected error occurred.',
          actions: [
            {
              label: 'Retry',
              onClick: () => {
                setErrorModal(null);
                handleSubmit();
              },
              variant: 'primary'
            },
            { label: 'Cancel', onClick: () => setErrorModal(null), variant: 'secondary' }
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPaymentLink = async () => {
    if (!paymentLink.trim()) {
      toast.error('Please enter a payment link');
      return;
    }

    if (!createdBookingId) {
      toast.error('Booking ID not found');
      return;
    }

    setSendingPaymentLink(true);
    try {
      await updateBookingStatus(createdBookingId, 'waiting_payment', undefined, paymentLink);
      toast.success('Payment link sent successfully!');
      setShowPaymentLinkModal(false);
      router.push('/admin/bookings');
    } catch (error: any) {
      console.error('Error sending payment link:', error);
      toast.error(error.response?.data?.error || 'Failed to send payment link');
    } finally {
      setSendingPaymentLink(false);
    }
  };

  const handleSkipPaymentLink = () => {
    setShowPaymentLinkModal(false);
    router.push('/admin/bookings');
  };

  if (loading && !vehicles.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Compact Mobile-First Header */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex-1 min-w-0">Create New Booking</h1>
          <button
            onClick={() => router.push('/admin/bookings')}
            className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base px-2 sm:px-0 flex-shrink-0"
          >
            ← Back
          </button>
        </div>
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
          <button
            onClick={handleSaveDraftAndExit}
            className="w-full xs:w-auto px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
          >
            Save Draft & Exit
          </button>
          {lastSaved && (
            <p className="text-xs text-gray-400">
              {isSavingDraft ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                `Saved: ${lastSaved.toLocaleTimeString()}`
              )}
            </p>
          )}
        </div>
      </div>

      {/* Progress Indicator - Integrated */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <div className="sticky top-0 z-30 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-md py-2.5 sm:py-3 px-3 sm:px-4">
          <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-max pr-2 sm:pr-4">
              {[
                { num: 1, name: 'Dates', done: pickupDate && dropoffDate && rentalDays > 0 },
                { num: 2, name: 'Locations', done: pickupLocationId && dropoffLocationId },
                { num: 3, name: 'Vehicle', done: !!selectedVehicle },
                { num: 4, name: 'Customer', done: customerData.first_name && customerData.email },
                { num: 5, name: 'Review', done: false }
              ].map((step, idx) => (
                <div key={step.num} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 text-xs sm:text-sm font-bold transition-all ${
                    step.done 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30' 
                      : 'bg-gray-900 border-gray-600 text-gray-400'
                  }`}>
                    {step.done ? '✓' : step.num}
                  </div>
                  <span className={`ml-2 sm:ml-2.5 text-xs sm:text-sm font-medium whitespace-nowrap hidden sm:inline ${
                    step.done ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                  {idx < 4 && (
                    <div className={`w-5 sm:w-7 md:w-10 h-0.5 mx-1.5 sm:mx-2 transition-colors ${
                      step.done ? 'bg-orange-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Step 1: Date Selection */}
        <div ref={step1Ref} className="bg-gray-900 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 md:mb-6 text-white">Step 1: Select Rental Dates</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Pickup Date & Time */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-white">Pickup</h3>
              
              {/* Pickup Date */}
              <div ref={pickupDateRef} className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPickupDatePicker(!showPickupDatePicker)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left focus:ring-2 focus:ring-orange-500 bg-gray-900 hover:border-orange-400 transition-colors text-xs sm:text-sm ${
                    pickupDate 
                      ? 'border border-orange-500 focus:border-orange-500' 
                      : 'border-2 border-gray-700 focus:border-orange-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={pickupDate ? 'text-white font-medium' : 'text-gray-400'}>
                      {pickupDate ? pickupDate.toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Select pickup date'}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </button>
                
                {showPickupDatePicker && (
                  <>
                    {/* Mobile Overlay */}
                    <div 
                      className="fixed inset-0 bg-black/60 z-40 sm:hidden"
                      onClick={() => setShowPickupDatePicker(false)}
                    />
                    {/* Desktop Overlay */}
                    <div 
                      className="hidden sm:block fixed inset-0 bg-transparent z-40"
                      onClick={() => setShowPickupDatePicker(false)}
                    />
                    {/* Date Picker */}
                    <div className="fixed inset-x-0 bottom-0 sm:fixed sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-gray-900 border-2 border-gray-800 rounded-t-2xl sm:rounded-lg shadow-2xl sm:shadow-xl max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sm:hidden">
                        <h3 className="text-white font-semibold">Select Pickup Date</h3>
                        <button
                          onClick={() => setShowPickupDatePicker(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-2 sm:p-4">
                        <DatePicker
                          selected={pickupDate}
                          onChange={(date: Date | null) => {
                            setPickupDate(date);
                            setShowPickupDatePicker(false);
                            if (dropoffDate && date && dropoffDate <= date) {
                              setDropoffDate(null);
                            }
                          }}
                          minDate={new Date()}
                          inline
                          calendarClassName="custom-calendar"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Pickup Time */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                
                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                  {['08:00', '09:00', '10:00', '12:00', '14:00', '17:00', '18:00', '20:00'].map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setPickupTime(time)}
                      className={`px-1.5 py-2 sm:py-2.5 text-[10px] sm:text-xs rounded-lg border-2 transition-colors font-medium text-center ${
                        pickupTime === time 
                          ? 'border-orange-600 bg-orange-600 text-white font-semibold' 
                          : 'border-gray-700 hover:border-orange-400 text-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                
                {/* Custom Time */}
                <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">Custom:</span>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className={`flex-1 max-w-[110px] sm:max-w-[130px] px-2 py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-900 text-white ${
                      !['08:00', '09:00', '10:00', '12:00', '14:00', '17:00', '18:00', '20:00'].includes(pickupTime)
                        ? 'border border-orange-500 focus:border-orange-500'
                        : 'border-2 border-gray-700 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>

              {pickupDate && (
                <div className="p-4 bg-gray-800 border-2 border-gray-700 rounded-lg">
                  <p className="text-sm text-white">
                    <strong className="text-orange-600">Selected:</strong><br />
                    {pickupDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {pickupTime}
                  </p>
                </div>
              )}
            </div>

            {/* Dropoff Date & Time */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-white">Dropoff</h3>
              
              {/* Dropoff Date */}
              <div ref={dropoffDateRef} className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!pickupDate) {
                      toast.error('Please select pickup date first');
                      return;
                    }
                    setShowDropoffDatePicker(!showDropoffDatePicker);
                  }}
                  disabled={!pickupDate}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left focus:ring-2 focus:ring-orange-500 bg-gray-900 transition-colors text-xs sm:text-sm ${
                    !pickupDate 
                      ? 'border-2 border-gray-800 cursor-not-allowed opacity-50' 
                      : dropoffDate
                      ? 'border border-orange-500 hover:border-orange-400 focus:border-orange-500'
                      : 'border-2 border-gray-700 hover:border-orange-400 focus:border-orange-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={dropoffDate ? 'text-white font-medium' : 'text-gray-400'}>
                      {dropoffDate ? dropoffDate.toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Select dropoff date'}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </button>
                
                {showDropoffDatePicker && pickupDate && (
                  <>
                    {/* Mobile Overlay */}
                    <div 
                      className="fixed inset-0 bg-black/60 z-40 sm:hidden"
                      onClick={() => setShowDropoffDatePicker(false)}
                    />
                    {/* Desktop Overlay */}
                    <div 
                      className="hidden sm:block fixed inset-0 bg-transparent z-40"
                      onClick={() => setShowDropoffDatePicker(false)}
                    />
                    {/* Date Picker */}
                    <div className="fixed inset-x-0 bottom-0 sm:fixed sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-gray-900 border-2 border-gray-800 rounded-t-2xl sm:rounded-lg shadow-2xl sm:shadow-xl max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sm:hidden">
                        <h3 className="text-white font-semibold">Select Dropoff Date</h3>
                        <button
                          onClick={() => setShowDropoffDatePicker(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-2 sm:p-4">
                        <DatePicker
                          selected={dropoffDate}
                          onChange={(date: Date | null) => {
                            setDropoffDate(date);
                            setShowDropoffDatePicker(false);
                          }}
                          minDate={new Date(pickupDate.getTime() + 24 * 60 * 60 * 1000)}
                          inline
                          calendarClassName="custom-calendar"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dropoff Time */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                
                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                  {['08:00', '09:00', '10:00', '12:00', '14:00', '17:00', '18:00', '20:00'].map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDropoffTime(time)}
                      className={`px-1.5 py-2 sm:py-2.5 text-[10px] sm:text-xs rounded-lg border-2 transition-colors font-medium text-center ${
                        dropoffTime === time 
                          ? 'border-orange-600 bg-orange-600 text-white font-semibold' 
                          : 'border-gray-700 hover:border-orange-400 text-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                
                {/* Custom Time */}
                <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
                  <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">Custom:</span>
                  <input
                    type="time"
                    value={dropoffTime}
                    onChange={(e) => setDropoffTime(e.target.value)}
                    className={`flex-1 max-w-[110px] sm:max-w-[130px] px-2 py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-900 text-white ${
                      !['08:00', '09:00', '10:00', '12:00', '14:00', '17:00', '18:00', '20:00'].includes(dropoffTime)
                        ? 'border border-orange-500 focus:border-orange-500'
                        : 'border-2 border-gray-700 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>

              {dropoffDate && (
                <div className="p-4 bg-gray-800 border-2 border-gray-700 rounded-lg">
                  <p className="text-sm text-white">
                    <strong className="text-orange-600">Selected:</strong><br />
                    {dropoffDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {dropoffTime}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rental Duration Summary */}
          {rentalDays > 0 && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 md:p-6 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-1 font-medium">Rental Duration</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    {rentalDays} day{rentalDays !== 1 ? 's' : ''}
                  </p>
                </div>
                <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}

          </div>

          {/* Step 2: Locations */}
          {pickupDate && dropoffDate && rentalDays > 0 && (
            <div ref={step2Ref} className="bg-gray-900 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">Step 2: Select Locations</h2>
            
            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pickup Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={pickupLocationId}
                  onChange={(e) => setPickupLocationId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                >
                  <option value="">Select pickup location</option>
                  {allLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dropoff Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={dropoffLocationId}
                  onChange={(e) => setDropoffLocationId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                >
                  <option value="">Select dropoff location</option>
                  {allLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Search Status */}
            {pickupLocationId && dropoffLocationId && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-800 border border-gray-700 rounded-lg">
                {searchingVehicles ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-orange-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-white font-medium text-sm sm:text-base">Searching available vehicles...</span>
                  </div>
                ) : vehicles.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white font-medium text-sm sm:text-base">
                      Found {vehicles.length} available vehicle{vehicles.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ) : pickupLocationId && dropoffLocationId ? (
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-white font-medium text-sm sm:text-base">No vehicles available for selected dates and locations</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          )}

          {/* Step 3: Vehicle Selection */}
          {vehicles.length > 0 && pickupLocationId && dropoffLocationId && (
            <div ref={step3Ref} className="bg-gray-900 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">Step 3: Select Vehicle ({vehicles.length} available)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-orange-500 ring-1 ring-orange-400'
                      : 'border-gray-700 hover:border-orange-400'
                  }`}
                >
                  {vehicle.images && vehicle.images[0] && (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">{vehicle.year}</p>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-400 mb-3">
                    <p>• {vehicle.category}</p>
                    <p>• {vehicle.seats} Seats</p>
                    <p>• {vehicle.transmission}</p>
                    <p>• {vehicle.fuel_type}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs sm:text-sm text-gray-400">Daily Rate:</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">
                      €{vehicle.base_price_daily}
                    </p>
                    {rentalDays > 0 && (
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Total: €{(vehicle.base_price_daily * rentalDays).toFixed(2)} for {rentalDays} day{rentalDays !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {vehicle.subunits && vehicle.subunits.length > 0 && (
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      {vehicle.subunits.length} unit{vehicle.subunits.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Extras - shown after vehicle is selected */}
            {selectedVehicle && allExtras.length > 0 && (
              <div ref={extrasRef} className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Add Extras (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {allExtras.map((extra) => {
                    const isSelected = selectedExtras.some((e) => e.id === extra.id);
                    const selectedExtra = selectedExtras.find((e) => e.id === extra.id);
                    
                    return (
                      <div
                        key={extra.id}
                        className={`border rounded-lg p-3 sm:p-4 ${
                          isSelected ? 'border-orange-600 bg-orange-900/20' : 'border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm sm:text-base">{extra.name}</h4>
                            {extra.description && (
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">{extra.description}</p>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleExtraToggle(extra.id)}
                            className="mt-1 ml-2"
                          />
                        </div>
                        <p className="text-orange-600 font-semibold text-sm sm:text-base">
                          €{extra.price} / {extra.price_type.replace('_', ' ')}
                        </p>
                        {isSelected && (
                          <div className="mt-3">
                            <label className="block text-xs sm:text-sm text-gray-400 mb-1">Quantity:</label>
                            <input
                              type="number"
                              min="1"
                              value={selectedExtra?.quantity || 1}
                              onChange={(e) =>
                                handleExtraQuantityChange(extra.id, parseInt(e.target.value) || 1)
                              }
                              className="w-full px-3 py-1.5 border border-gray-700 rounded bg-gray-900 text-white text-sm"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Step 4: Customer Information */}
          {selectedVehicle && pickupLocationId && dropoffLocationId && (
            <div ref={step4Ref} className="bg-gray-900 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">Step 4: Customer Information</h2>
            
            {/* Customer Search */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-800 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Existing Customer (Optional)
              </label>
              <CustomerSearch 
                onSelect={(customer) => {
                  setCustomerData({
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    email: customer.email,
                    phone: customer.phone,
                    date_of_birth: customer.date_of_birth || '',
                    license_number: customer.license_number || '',
                    license_country: customer.license_country || '',
                    license_expiry: customer.license_expiry || '',
                    address: customer.address || '',
                    city: customer.city || '',
                    country: customer.country || ''
                  });
                  toast.success('Customer information loaded');
                }}
              />
              <p className="text-xs text-gray-400 mt-2">
                Or fill in new customer information below
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerData.first_name}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, first_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerData.last_name}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, last_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={customerData.date_of_birth}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, date_of_birth: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={customerData.license_number}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, license_number: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Country
                </label>
                <input
                  type="text"
                  value={customerData.license_country}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, license_country: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Expiry
                </label>
                <input
                  type="date"
                  value={customerData.license_expiry}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, license_expiry: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={customerData.address}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={customerData.city}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, city: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={customerData.country}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, country: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Booking Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white"
                  placeholder="Any special requests or notes for this booking..."
                />
              </div>
            </div>
          </div>
        )}

          {/* Step 5: Price Summary & Submit */}
          {selectedVehicle && pickupLocationId && dropoffLocationId && (
            <div ref={step5Ref} className="bg-gray-900 rounded-lg shadow-md p-3 sm:p-4 md:p-6 sticky bottom-0 border border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white">Booking Summary</h2>
                    {isSummaryMinimized && (
                      <span className="text-xl sm:text-2xl font-bold text-orange-600 whitespace-nowrap">
                        €{totalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSummaryMinimized(!isSummaryMinimized)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    title={isSummaryMinimized ? 'Expand summary' : 'Minimize summary'}
                  >
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isSummaryMinimized ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                {!isSummaryMinimized && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Vehicle:</span>
                    <span className="font-semibold text-white">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Duration:</span>
                    <span className="font-semibold text-white">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Price:</span>
                    <span className="font-semibold text-white">€{basePrice.toFixed(2)}</span>
                  </div>
                  {selectedExtras.length > 0 && (
                    <div className="space-y-2 border-t border-gray-800 pt-2 mt-2">
                      <p className="text-sm font-medium text-gray-300">Extras:</p>
                      {selectedExtras.map((selectedExtra) => {
                        const extra = allExtras.find(e => e.id === selectedExtra.id);
                        if (!extra) return null;
                        const extraTotal = extra.price * selectedExtra.quantity;
                        return (
                          <div key={extra.id} className="flex justify-between text-sm pl-4">
                            <span className="text-gray-400">
                              {extra.name} {selectedExtra.quantity > 1 ? `(x${selectedExtra.quantity})` : ''}
                            </span>
                            <span className="font-semibold text-white">€{extraTotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Coupon Code Section */}
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Coupon Code (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="SUMMER2024"
                        className="flex-1 px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-900 text-white placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={validateCouponCode}
                        disabled={!couponCode}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}
                    {appliedCoupon && (
                      <p className="text-orange-600 text-xs mt-1 flex items-center gap-1 font-medium">
                        ✓ Coupon "{appliedCoupon.code}" applied: -
                        {appliedCoupon.discount_type === 'percentage' 
                          ? `${appliedCoupon.discount_value}%` 
                          : `€${appliedCoupon.discount_value}`}
                      </p>
                    )}
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-orange-600">
                      <span>Discount:</span>
                      <span className="font-semibold text-white">
                        -€{(appliedCoupon.discount_type === 'percentage' 
                          ? (basePrice + extrasPrice) * (appliedCoupon.discount_value / 100) 
                          : appliedCoupon.discount_value).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Manual Price Adjustments */}
                  <div className="border-t border-gray-800 pt-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowManualAdjustments(!showManualAdjustments)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                    >
                      {showManualAdjustments ? '▼' : '▶'} Manual Price Adjustments
                    </button>
                    
                    {showManualAdjustments && (
                      <div className="mt-3 space-y-3 bg-yellow-900/20 p-4 rounded-lg border border-yellow-800">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Additional Discount (€)
                          </label>
                          <input
                            type="number"
                            value={manualDiscount}
                            onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Additional Fee (€)
                          </label>
                          <input
                            type="number"
                            value={manualFee}
                            onChange={(e) => setManualFee(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Reason for Adjustment <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={priceAdjustmentReason}
                            onChange={(e) => setPriceAdjustmentReason(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-500"
                            placeholder="e.g., Repeat customer discount"
                            required={manualDiscount > 0 || manualFee > 0}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {manualDiscount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Manual Discount:</span>
                      <span className="font-semibold text-white">-€{manualDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {manualFee > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Additional Fee:</span>
                      <span className="font-semibold text-white">+€{manualFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t-2 border-gray-700 pt-2 text-xl">
                    <span className="font-bold text-white">Total:</span>
                    <span className="font-bold text-orange-600">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                )}
              </div>
              <div className="w-full lg:w-auto">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full lg:w-auto bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-base sm:text-lg shadow-lg"
                >
                  {loading ? 'Creating Booking...' : 'Create Booking'}
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
        
        {/* Error Modal */}
        {errorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{errorModal.title}</h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 whitespace-pre-line">{errorModal.message}</p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {errorModal.actions?.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className={`w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold ${
                      action.variant === 'primary'
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-gray-200 text-white hover:bg-gray-300'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Payment Link Modal */}
        {showPaymentLinkModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full border border-gray-800">
              <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Send Payment Link?</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                The booking has been created successfully. Would you like to send a payment link to the customer via email?
              </p>
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Payment Link URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://payment.example.com/..."
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-900 text-white placeholder-gray-500"
                  disabled={sendingPaymentLink}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleSkipPaymentLink}
                  disabled={sendingPaymentLink}
                  className="w-full sm:flex-1 bg-gray-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-700 disabled:opacity-50 transition-all"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleSendPaymentLink}
                  disabled={sendingPaymentLink || !paymentLink.trim()}
                  className="w-full sm:flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {sendingPaymentLink ? 'Sending...' : 'Send Payment Link'}
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

