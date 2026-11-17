import React from 'react';

export const LoadingSpinner = ({ label = 'Loading community fridge data...' }) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-8 space-y-3"
      aria-live="polite"
    >
      <div
        className="w-8 h-8 border-3 border-stone-200 border-t-[#1F5E43] rounded-full animate-spin"
        aria-hidden="true"
      />
      <span className="text-xs font-medium text-stone-600">{label}</span>
    </div>
  );
};
