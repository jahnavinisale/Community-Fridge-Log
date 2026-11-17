import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  action,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-stone-300 bg-white/60">
      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-600 max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
