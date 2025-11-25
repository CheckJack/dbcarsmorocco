'use client';

import { useEffect } from 'react';
import { X, HelpCircle, BookOpen } from 'lucide-react';
import { getHelpContent, HelpContent } from '@/lib/helpContent';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export default function HelpCenter({ isOpen, onClose, pathname }: HelpCenterProps) {
  const helpContent = getHelpContent(pathname);

  // Close on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Fallback content if no help content found
  const displayContent = helpContent || {
    title: 'Help Center',
    description: 'Help content for this page is not available.',
    sections: [
      {
        title: 'General Help',
        content: [
          'Use the sidebar navigation to access different sections of the admin panel.',
          'If you need assistance with a specific feature, contact your system administrator.',
        ],
      },
    ],
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto border border-gray-800 transform transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{displayContent.title}</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">{displayContent.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Close help"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="space-y-4 sm:space-y-6">
              {displayContent.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{section.title}</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 ml-6 sm:ml-8">
                    {section.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-sm sm:text-base text-gray-300 leading-relaxed flex items-start gap-3"
                      >
                        <span className="text-orange-500 font-bold mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-gradient-to-t from-black to-gray-900 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                Need more help? Contact your system administrator.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all text-sm font-medium whitespace-nowrap"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

