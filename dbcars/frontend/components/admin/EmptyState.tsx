'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 bg-gray-800 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-200 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 text-center max-w-sm">{description}</p>
      )}
    </div>
  );
}

