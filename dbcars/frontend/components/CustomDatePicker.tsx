'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React from 'react';

interface CustomDatePickerProps extends Omit<React.ComponentProps<typeof DatePicker>, 'className'> {
  className?: string;
}

export default function CustomDatePicker({
  className = '',
  ...props
}: CustomDatePickerProps) {
  return (
    <div className="custom-datepicker-wrapper">
      <DatePicker
        {...(props as any)}
        className={className}
        calendarClassName="custom-datepicker-calendar"
        popperClassName="custom-datepicker-popper"
        portalId="datepicker-portal"
      />
    </div>
  );
}

