import React from 'react';
import { AlertOctagon, AlertTriangle, Clock, CheckCircle2, HelpCircle } from 'lucide-react';
import { getUseByStatus, STATUS_CONFIG } from '../utils/dateStatus.js';

export const StatusBadge = ({ status, date, showIcon = true, size = 'md' }) => {
  const calculatedStatus = status || (date ? getUseByStatus(date) : 'unknown');
  const config = STATUS_CONFIG[calculatedStatus] || STATUS_CONFIG.unknown;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const renderIcon = () => {
    const iconClass = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
    switch (calculatedStatus) {
      case 'expired':
        return <AlertOctagon className={`${iconClass} text-red-700`} aria-hidden="true" />;
      case 'use_today':
        return <AlertTriangle className={`${iconClass} text-amber-700`} aria-hidden="true" />;
      case 'soon':
      case 'use_within_2_days':
        return <Clock className={`${iconClass} text-amber-700`} aria-hidden="true" />;
      case 'ok':
        return <CheckCircle2 className={`${iconClass} text-emerald-700`} aria-hidden="true" />;
      default:
        return <HelpCircle className={`${iconClass} text-stone-500`} aria-hidden="true" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs ${config.badgeClass} ${sizeClasses}`}
      title={config.tagline}
      role="status"
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
      <span className="sr-only">({config.tagline})</span>
    </span>
  );
};
