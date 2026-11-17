import React from 'react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-stone-200 text-stone-900',
      iconBg: 'bg-stone-100 text-stone-700',
      badge: 'text-stone-600',
    },
    expired: {
      card: 'bg-red-50/60 border-red-200 text-red-950',
      iconBg: 'bg-red-100 text-red-800',
      badge: 'text-red-800 font-semibold',
    },
    warning: {
      card: 'bg-amber-50/60 border-amber-200 text-amber-950',
      iconBg: 'bg-amber-100 text-amber-800',
      badge: 'text-amber-800 font-semibold',
    },
    soon: {
      card: 'bg-amber-50/40 border-amber-200/80 text-amber-950',
      iconBg: 'bg-amber-100/80 text-amber-800',
      badge: 'text-amber-800 font-medium',
    },
    forest: {
      card: 'bg-emerald-50/60 border-emerald-200 text-emerald-950',
      iconBg: 'bg-emerald-100 text-[#1F5E43]',
      badge: 'text-emerald-800 font-medium',
    },
  }[variant] || variantStyles.default;

  const content = (
    <div className={`p-5 rounded-xl border transition-all ${variantStyles.card}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold tracking-tight mt-1">{value}</p>
          {subtitle && <p className={`text-xs mt-1.5 ${variantStyles.badge}`}>{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${variantStyles.iconBg}`} aria-hidden="true">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left w-full focus:outline-none focus:ring-2 focus:ring-[#1F5E43] rounded-xl"
      >
        {content}
      </button>
    );
  }

  return content;
};
