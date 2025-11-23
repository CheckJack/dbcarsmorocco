'use client';

import { CheckCircle2, Clock, XCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  compact?: boolean;
}

const statusConfig: Record<string, { 
  bg: string; 
  text: string; 
  border: string;
  icon: React.ReactNode;
  glow: string;
  label: string;
}> = {
  completed: {
    bg: 'bg-gradient-to-br from-emerald-900/50 to-green-900/50',
    text: 'text-emerald-400',
    border: 'border-emerald-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    glow: 'shadow-emerald-900/50',
    label: 'Completed'
  },
  confirmed: {
    bg: 'bg-gradient-to-br from-emerald-900/50 to-green-900/50',
    text: 'text-emerald-400',
    border: 'border-emerald-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    glow: 'shadow-emerald-900/50',
    label: 'Confirmed'
  },
  waiting_payment: {
    bg: 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50',
    text: 'text-blue-400',
    border: 'border-blue-700',
    icon: <Clock className="w-3.5 h-3.5" />,
    glow: 'shadow-blue-900/50',
    label: 'Waiting Payment'
  },
  active: {
    bg: 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50',
    text: 'text-blue-400',
    border: 'border-blue-700',
    icon: <PlayCircle className="w-3.5 h-3.5" />,
    glow: 'shadow-blue-900/50',
    label: 'Active'
  },
  pending: {
    bg: 'bg-gradient-to-br from-amber-900/50 to-yellow-900/50',
    text: 'text-amber-400',
    border: 'border-amber-700',
    icon: <Clock className="w-3.5 h-3.5" />,
    glow: 'shadow-amber-900/50',
    label: 'Pending'
  },
  cancelled: {
    bg: 'bg-gradient-to-br from-red-900/50 to-rose-900/50',
    text: 'text-red-400',
    border: 'border-red-700',
    icon: <XCircle className="w-3.5 h-3.5" />,
    glow: 'shadow-red-900/50',
    label: 'Cancelled'
  },
  default: {
    bg: 'bg-gradient-to-br from-gray-800/50 to-slate-800/50',
    text: 'text-gray-400',
    border: 'border-gray-700',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    glow: 'shadow-gray-900/50',
    label: 'Unknown'
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm'
};

export default function StatusBadge({ status, size = 'md', showIcon = true, compact = false }: StatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = statusConfig[status.toLowerCase()] || statusConfig.default;
  const sizeClass = sizeClasses[size];

  if (compact) {
    return (
      <div className="relative inline-flex">
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`
            ${config.bg}
            ${config.text}
            ${config.border}
            w-7 h-7
            flex items-center justify-center
            rounded-full border-2
            shadow-lg ${config.glow}
            transition-all duration-200
            hover:shadow-xl hover:scale-110
            cursor-pointer
          `}
        >
          <div className="scale-90">{config.icon}</div>
        </div>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-800 text-white text-[10px] font-semibold rounded-lg shadow-xl border border-gray-700 whitespace-nowrap z-50 pointer-events-none">
            {config.label}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <span
      className={`
        ${config.bg}
        ${config.text}
        ${config.border}
        ${sizeClass}
        inline-flex items-center gap-1.5
        font-semibold rounded-full border
        shadow-sm ${config.glow}
        transition-all duration-200
        hover:shadow-md hover:scale-105
        capitalize
      `}
    >
      {showIcon && <span className="flex-shrink-0">{config.icon}</span>}
      <span>{status}</span>
    </span>
  );
}

