import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import { getDaysRemaining, STATUS_CONFIG } from '../utils/dateStatus.js';
import { formatDate, formatCategory, formatStorageLocation } from '../utils/formatters.js';
import {
  Calendar,
  Package,
  Layers,
  Thermometer,
  HeartHandshake,
  ArrowUpRight,
  Trash2,
  Truck,
} from 'lucide-react';

export const ItemCard = ({ item, onCollect, onDispose }) => {
  const status = item.useByStatus || 'unknown';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  const daysLeft = item.daysRemaining !== undefined ? item.daysRemaining : getDaysRemaining(item.useByDate);

  const getUrgencyText = () => {
    if (daysLeft === null) return '';
    if (daysLeft < 0) return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} past use-by`;
    if (daysLeft === 0) return 'Expires by end of day today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `${daysLeft} days remaining`;
  };

  return (
    <article
      className={`bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative ${config.accentBorder}`}
      aria-labelledby={`item-title-${item._id}`}
    >
      <div className="p-5">
        {/* Header: Category and Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {formatCategory(item.category)}
          </span>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Item Title */}
        <h3
          id={`item-title-${item._id}`}
          className="text-base font-bold text-slate-900 group-hover:text-emerald-700 leading-snug mb-3 line-clamp-2"
        >
          <Link to={`/inventory/${item._id}`} className="hover:underline focus:outline-none">
            {item.name}
          </Link>
        </h3>

        {/* Key Metrics */}
        <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Package className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              Stock Available:
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {item.quantity} <span className="text-xs font-normal text-slate-600">{item.unit}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              Use-by Date:
            </span>
            <div className="text-right">
              <span className="font-semibold text-slate-800">{formatDate(item.useByDate)}</span>
              <p className={`text-[11px] font-medium ${config.text}`}>
                {getUrgencyText()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Thermometer className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              Storage:
            </span>
            <span className="capitalize font-medium text-slate-700">
              {item.storageLocation}
            </span>
          </div>
        </div>

        {/* Donor info */}
        {(item.donatedBy || item.donorName) && (
          <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate mb-1">
            <HeartHandshake className="w-3.5 h-3.5 text-[#1F5E43] shrink-0" aria-hidden="true" />
            <span className="truncate">Donor: <span className="text-stone-700 font-medium">{item.donatedBy || item.donorName}</span></span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
        <Link
          to={`/inventory/${item._id}`}
          className="text-xs font-semibold text-stone-600 hover:text-[#1F5E43] flex items-center gap-1 py-1.5"
          aria-label={`View details for ${item.name}`}
        >
          Details
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCollect(item)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1F5E43] text-white hover:bg-[#184D37] active:bg-[#123D2B] transition-colors focus:outline-none touch-target"
            aria-label={`Collect ${item.name}`}
          >
            <Truck className="w-3.5 h-3.5" aria-hidden="true" />
            Collect
          </button>

          <button
            type="button"
            onClick={() => onDispose(item)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 active:bg-red-200 transition-colors focus:outline-none touch-target"
            aria-label={`Dispose ${item.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Dispose
          </button>
        </div>
      </div>
    </article>
  );
};
