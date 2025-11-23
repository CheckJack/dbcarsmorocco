'use client';

import { Calendar, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderBarProps {
  month: number;
  year: number;
  viewMode?: 'day' | 'week' | 'month' | 'quarter';
  onViewModeChange?: (mode: 'day' | 'week' | 'month' | 'quarter') => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onToday: () => void;
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onSearchChange?: (query: string) => void;
  onExport?: () => void;
  searchQuery?: string;
}

export default function HeaderBar({
  month,
  year,
  viewMode = 'month',
  onViewModeChange,
  onMonthChange,
  onYearChange,
  onToday,
  onNextMonth,
  onPrevMonth,
  onSearchChange,
  onExport,
  searchQuery = '',
}: HeaderBarProps) {
  const [searchValue, setSearchValue] = useState(searchQuery);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!onSearchChange) return;
    const timeoutId = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearchChange]);

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left side: Date Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={onToday}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-300 bg-gray-800 rounded-xl hover:bg-gray-200 transition-all"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevMonth}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-all"
              title="Previous month (P)"
            >
              <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <button
              onClick={onNextMonth}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-all"
              title="Next month (N)"
            >
              <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="text-sm sm:text-base font-bold text-white bg-gray-900 border border-gray-700 rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer transition-all"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(year, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value) || year)}
              className="w-20 sm:w-24 text-sm sm:text-base font-bold text-white bg-gray-900 border border-gray-700 rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Center: View Mode Tabs */}
        {onViewModeChange && (
          <div className="hidden md:flex items-center gap-1 bg-gray-800 rounded-xl p-1">
            {(['day', 'week', 'month', 'quarter'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`
                  px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-all
                  ${
                    viewMode === mode
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Right side: Search and Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onSearchChange && (
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search vehicles..."
                className="w-full sm:w-48 lg:w-64 pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg"
              title="Export (E)"
            >
              <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
