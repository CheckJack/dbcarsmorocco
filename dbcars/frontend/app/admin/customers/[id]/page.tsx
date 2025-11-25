'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getAdminCustomer,
  updateCustomer,
  updateCustomerBlacklist,
} from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Ban,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Car,
  Euro,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Navigation,
  CreditCard,
  Clock,
  User
} from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import StatusBadge from '@/components/admin/StatusBadge';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const data = await getAdminCustomer(customerId);
      setCustomer(data);
    } catch (error) {
      console.error('Error loading customer:', error);
      toast.error('Error loading customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      date_of_birth: customer.date_of_birth ? new Date(customer.date_of_birth).toISOString().split('T')[0] : '',
      license_number: customer.license_number || '',
      license_country: customer.license_country || '',
      license_expiry: customer.license_expiry ? new Date(customer.license_expiry).toISOString().split('T')[0] : '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!customer) return;
    
    try {
      const dataToUpdate = { ...editForm };
      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === '') {
          dataToUpdate[key] = null;
        }
      });

      await updateCustomer(customer.id, dataToUpdate);
      await loadCustomer();
      setIsEditing(false);
      setEditForm({});
      toast.success('Customer information updated successfully!');
    } catch (error) {
      toast.error('Error updating customer information');
      console.error('Error:', error);
    }
  };

  const handleBlacklistToggle = async () => {
    if (customer.is_blacklisted) {
      if (confirm('Remove this customer from blacklist?')) {
        try {
          await updateCustomerBlacklist(customer.id, false);
          await loadCustomer();
          toast.success('Customer removed from blacklist');
        } catch (error) {
          toast.error('Error updating blacklist status');
        }
      }
    } else {
      setShowBlacklistModal(true);
    }
  };

  const handleBlacklistSubmit = async () => {
    if (!customer) return;
    try {
      await updateCustomerBlacklist(customer.id, true, blacklistReason);
      setShowBlacklistModal(false);
      setBlacklistReason('');
      await loadCustomer();
      toast.success('Customer added to blacklist');
    } catch (error) {
      toast.error('Error updating blacklist status');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm p-8">
        <LoadingSpinner size="md" text="Loading customer details..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm p-8">
        <EmptyState
          icon={User}
          title="Customer not found"
          description="The customer you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="w-full mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => router.push('/admin/customers')}
              className="p-2 hover:bg-gray-800 rounded-xl transition-colors flex-shrink-0"
              aria-label="Back to customers"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 break-words">
                {customer.first_name} {customer.last_name}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 break-words">
                Member since {formatDate(customer.created_at)}
              </p>
            </div>
          </div>
          {!isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0 min-w-0">
              <button
                onClick={handleEditClick}
                className="px-4 sm:px-5 lg:px-6 py-2 lg:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm lg:text-base font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Edit className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Edit Customer</span>
              </button>
              <button
                onClick={handleBlacklistToggle}
                className={`px-4 sm:px-5 lg:px-6 py-2 lg:py-2.5 rounded-xl transition-all text-sm lg:text-base font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 ${
                  customer.is_blacklisted
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                }`}
              >
                {customer.is_blacklisted ? (
                  <>
                    <UserCheck className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span>Remove from Blacklist</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span>Add to Blacklist</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Information Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6 w-full overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl sm:rounded-t-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-white">Customer Information</h2>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6 w-full">
          {isEditing ? (
            <div className="space-y-4 sm:space-y-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={editForm.date_of_birth}
                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">License Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editForm.license_number}
                      onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">License Country</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editForm.license_country}
                      onChange={(e) => setEditForm({ ...editForm, license_country: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">License Expiry</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={editForm.license_expiry}
                      onChange={(e) => setEditForm({ ...editForm, license_expiry: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">City</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Country</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-800 w-full">
                <button
                  onClick={handleSaveEdit}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all text-sm sm:text-base font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2 min-w-0"
                >
                  <Save className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Save Changes</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all text-sm sm:text-base font-semibold flex items-center justify-center gap-2 min-w-0"
                >
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">Email</label>
                  <p className="text-sm sm:text-base font-medium text-white mt-1 break-words">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">Phone</label>
                  <p className="text-sm sm:text-base font-medium text-white mt-1 break-words">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">Date of Birth</label>
                  <p className="text-sm sm:text-base font-medium text-white mt-1 break-words">{formatDate(customer.date_of_birth)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg flex-shrink-0">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">License Number</label>
                  <p className="text-sm sm:text-base font-medium text-white mt-1 break-words">{customer.license_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">License Country</label>
                  <p className="text-sm sm:text-base font-medium text-white mt-1 break-words">{customer.license_country || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-pink-50 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">License Expiry</label>
                  <p className="text-sm sm:text-base font-medium text-white mt-1 break-words">{formatDate(customer.license_expiry)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-teal-50 rounded-lg flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">Address</label>
                  <p className="text-sm sm:text-base font-medium text-white mt-1 break-words">
                    {customer.address || 'N/A'}
                    {customer.city && `, ${customer.city}`}
                    {customer.country && `, ${customer.country}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <div className="p-1.5 sm:p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <label className="text-xs sm:text-sm font-semibold text-gray-400">Status</label>
                  <div className="mt-1">
                    {customer.is_blacklisted ? (
                      <span className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 text-red-700 shadow-sm shadow-red-200/50 inline-flex items-center gap-1.5">
                        <Ban className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Blacklisted
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 shadow-sm shadow-emerald-200/50 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {customer.is_blacklisted && customer.blacklist_reason && (
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 overflow-hidden">
                  <div className="p-1.5 sm:p-2 bg-red-50 rounded-lg flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <label className="text-xs sm:text-sm font-semibold text-gray-400">Blacklist Reason</label>
                    <p className="text-sm sm:text-base font-medium text-red-600 mt-1 break-words">{customer.blacklist_reason}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reservation History Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6 w-full">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl sm:rounded-t-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-white">Reservation History</h2>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 w-full">
          {customer.bookings && customer.bookings.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {customer.bookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    onClick={() => router.push(`/admin/bookings?booking=${booking.id}`)}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-blue-600">
                            #{booking.booking_number}
                          </span>
                          <StatusBadge status={booking.status} compact={true} />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Car className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-semibold text-white">
                            {booking.make} {booking.model} ({booking.year})
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <div className="flex items-center gap-1">
                          <Euro className="w-4 h-4 text-gray-400" />
                          <span className="text-base font-bold text-white">
                            {formatCurrency(parseFloat(booking.total_price))}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-gray-700">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400">Pick-up</p>
                          <p className="text-sm font-medium text-white">
                            {formatDate(booking.pickup_date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 break-words">
                            {booking.pickup_location_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400">Drop-off</p>
                          <p className="text-sm font-medium text-white">
                            {formatDate(booking.dropoff_date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 break-words">
                            {booking.dropoff_location_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full divide-y divide-gray-800">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Booking #
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Vehicle
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Pick-up
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Drop-off
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Total Price
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-800">
                    {customer.bookings.map((booking: any) => (
                      <tr
                        key={booking.id}
                        className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                        onClick={() => router.push(`/admin/bookings?booking=${booking.id}`)}
                      >
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800">
                            #{booking.booking_number}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <Car className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-white break-words">
                              {booking.make} {booking.model} ({booking.year})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-start gap-2 min-w-0">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                                {formatDate(booking.pickup_date)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 break-words">{booking.pickup_location_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-start gap-2 min-w-0">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                                {formatDate(booking.dropoff_date)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 break-words">{booking.dropoff_location_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {formatCurrency(parseFloat(booking.total_price))}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <StatusBadge status={booking.status} compact={true} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="No reservations found"
              description="This customer hasn't made any reservations yet."
            />
          )}
        </div>
      </div>

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowBlacklistModal(false);
              setBlacklistReason('');
            }}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full overflow-hidden mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-rose-600">
                <h2 className="text-lg sm:text-xl font-bold text-white">Add to Blacklist</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <p className="text-sm sm:text-base text-gray-400 mb-2">
                    Customer: <span className="font-semibold text-white break-words">{customer.first_name} {customer.last_name}</span>
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Reason (optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={blacklistReason}
                      onChange={(e) => setBlacklistReason(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-sm sm:text-base"
                      rows={4}
                      placeholder="Enter reason for blacklisting..."
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleBlacklistSubmit}
                    className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Ban className="w-4 h-4" />
                    Add to Blacklist
                  </button>
                  <button
                    onClick={() => {
                      setShowBlacklistModal(false);
                      setBlacklistReason('');
                    }}
                    className="w-full sm:flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
