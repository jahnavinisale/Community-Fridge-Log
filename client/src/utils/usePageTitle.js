import { useEffect } from 'react';

/**
 * Custom hook to update document title per view for screen readers and browser history
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    const baseTitle = 'Community Fridge Log';
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} - Food Inventory & Safety Tracking`;
  }, [title]);
};
