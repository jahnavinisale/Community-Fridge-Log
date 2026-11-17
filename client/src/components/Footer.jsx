import React from 'react';
import { Link } from 'react-router-dom';
import { Refrigerator } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#FAF8F4] border-t border-stone-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F5E43] flex items-center justify-center text-white shrink-0">
            <Refrigerator className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span>
            <strong>Community Fridge Log</strong> &bull; Internal Volunteer Management Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="hover:text-stone-900 underline-offset-2 hover:underline focus:outline-none focus:ring-1 focus:ring-[#1F5E43] rounded"
          >
            Privacy Policy (Draft)
          </Link>
          <span className="text-stone-300" aria-hidden="true">&bull;</span>
          <Link
            to="/terms"
            className="hover:text-stone-900 underline-offset-2 hover:underline focus:outline-none focus:ring-1 focus:ring-[#1F5E43] rounded"
          >
            Terms of Use (Draft)
          </Link>
        </div>
      </div>
    </footer>
  );
};
