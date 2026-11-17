import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemsApi } from '../api/itemsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { DisposeModal } from '../components/DisposeModal.jsx';
import { CollectModal } from '../components/CollectModal.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { formatDate, formatDateTime, formatCategory, formatReason, formatStorageLocation } from '../utils/formatters.js';
import { usePageTitle } from '../utils/usePageTitle.js';
import {
  ArrowLeft,
  Calendar,
  Package,
  HeartHandshake,
  Thermometer,
  ShieldAlert,
  FileText,
  Truck,
  Trash2,
  Clock,
  User,
  Pencil,
} from 'lucide-react';

export const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  usePageTitle(item ? `${item.name} - Item Detail` : 'Food Item Details');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await itemsApi.getById(id);
      setItem(data.item);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || 'Item not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleDisposeSubmit = async (payload) => {
    await itemsApi.dispose(item._id, payload);
    showToast(`Logged safe disposal for ${item.name}`, 'warning');
    loadItem();
  };

  const handleCollectSubmit = async (payload) => {
    await itemsApi.collect(item._id, payload);
    showToast(`Logged collection for ${item.name}`, 'success');
    loadItem();
  };

  if (loading) {
    return <LoadingSpinner label="Loading item audit record..." />;
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
          <p className="font-semibold">Unable to load item</p>
          <p className="mt-1">{error || 'Item record does not exist'}</p>
          <Link to="/inventory" className="mt-3 inline-block text-xs font-semibold underline">
            Return to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = item.daysRemaining;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>

        {item.status === 'in_stock' && (
          <div className="flex items-center gap-2">
            <Link
              to={`/inventory/${item._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-300 touch-target"
            >
              <Pencil className="w-3.5 h-3.5 text-stone-500" />
              Edit Item
            </Link>
            <button
              type="button"
              onClick={() => setIsCollectOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1F5E43] text-white hover:bg-[#184D37] touch-target"
            >
              <Truck className="w-3.5 h-3.5" />
              Collect Stock
            </button>
            <button
              type="button"
              onClick={() => setIsDisposeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 touch-target"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Dispose Item
            </button>
          </div>
        )}
      </div>

      {/* Main Item Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {formatCategory(item.category)}
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">{item.name}</h1>
            <p className="text-xs text-stone-500 mt-1">
              Recorded into fridge log on {formatDate(item.dateReceived || item.donatedDate)}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <StatusBadge status={item.useByStatus} size="lg" />
            <span className="text-xs text-stone-600 font-medium">
              {daysLeft !== null && daysLeft < 0 && `${Math.abs(daysLeft)} day(s) past use-by`}
              {daysLeft === 0 && 'Expires today'}
              {daysLeft !== null && daysLeft > 0 && `${daysLeft} day(s) remaining`}
            </span>
          </div>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#FAF8F4] rounded-lg border border-stone-200">
            <span className="text-stone-500 flex items-center gap-1 mb-1">
              <Package className="w-3.5 h-3.5" /> Quantity in Fridge:
            </span>
            <p className="text-base font-bold text-stone-900">
              {item.quantity} <span className="text-xs font-normal text-stone-600">{item.unit}</span>
            </p>
          </div>

          <div className="p-3 bg-[#FAF8F4] rounded-lg border border-stone-200">
            <span className="text-stone-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Use-By Expiry Date:
            </span>
            <p className="text-base font-bold text-stone-900">
              {formatDate(item.useByDate)}
            </p>
          </div>

          <div className="p-3 bg-[#FAF8F4] rounded-lg border border-stone-200">
            <span className="text-stone-500 flex items-center gap-1 mb-1">
              <Thermometer className="w-3.5 h-3.5" /> Storage Compartment:
            </span>
            <p className="text-base font-semibold text-stone-900 capitalize">
              {item.storageLocation}
            </p>
          </div>
        </div>

        {/* Detailed Notes */}
        <div className="space-y-3 pt-2 text-xs">
          {(item.donatedBy || item.donorName) && (
            <div className="flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-[#1F5E43] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-800">Donor Information:</p>
                <p className="text-stone-600">{item.donatedBy || item.donorName}</p>
              </div>
            </div>
          )}

          {item.storageNote && (
            <div className="flex items-start gap-2">
              <Thermometer className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-800">Storage Location Details:</p>
                <p className="text-stone-600">{item.storageNote}</p>
              </div>
            </div>
          )}

          {item.allergensNote && (
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-800">Allergens / Ingredients Notice:</p>
                <p className="text-amber-900 font-medium">{item.allergensNote}</p>
              </div>
            </div>
          )}

          {item.notes && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-800">Volunteer Notes:</p>
                <p className="text-stone-600">{item.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit History Log for this Item */}
      <section aria-labelledby="history-heading" className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-4">
        <h2 id="history-heading" className="text-base font-bold text-stone-900">
          Item Lifecycle and Activity Audit Log
        </h2>

        {logs.length === 0 ? (
          <p className="text-xs text-stone-500">No lifecycle logs recorded for this item yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2">Action Type</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Reason / Note</th>
                  <th className="px-3 py-2">Logged By</th>
                  <th className="px-3 py-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-3 py-2 font-semibold capitalize">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          log.type === 'collection'
                            ? 'bg-emerald-50 text-[#1F5E43]'
                            : log.type === 'disposal'
                            ? 'bg-red-50 text-red-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-semibold">{formatReason(log.reason)}</span>
                      {(log.note || log.notes) && (
                        <p className="text-stone-500 text-[11px]">{log.note || log.notes}</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-stone-600">
                      {log.performedByName || log.performedBy?.name || 'Volunteer'}
                    </td>
                    <td className="px-3 py-2 text-right text-stone-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modals */}
      <DisposeModal
        item={item}
        isOpen={isDisposeOpen}
        onClose={() => setIsDisposeOpen(false)}
        onSubmit={handleDisposeSubmit}
      />
      <CollectModal
        item={item}
        isOpen={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        onSubmit={handleCollectSubmit}
      />
    </div>
  );
};
