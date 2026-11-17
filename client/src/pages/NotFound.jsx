import React from 'react';
import { Link } from 'react-router-dom';
import { Refrigerator, ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../utils/usePageTitle.js';

export const NotFound = () => {
  usePageTitle('404 Page Not Found');
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center mb-4">
        <Refrigerator className="w-6 h-6" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-[#1C1B19]">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-stone-600 max-w-sm mt-2 mb-6">
        The community fridge log page or resource you requested does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1F5E43] text-white hover:bg-[#184D37] touch-target"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Fridge Dashboard
      </Link>
    </div>
  );
};
