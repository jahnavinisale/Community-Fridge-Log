import React, { useState, useEffect, useCallback } from 'react';
import { logsApi } from '../api/logsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { formatCategory, formatDateTime, formatReason } from '../utils/formatters.js';
import { exportToCsv } from '../utils/exportCsv.js';
import { usePageTitle } from '../utils/usePageTitle.js';
import { Trash2, Search, RotateCcw, Download, User, AlertOctagon, FileText } from 'lucide-react';

const DISPOSAL_REASONS = [
  { value: 'all', label: 'All Disposal Reasons' },
  { value: 'expired', label: 'Past Use-By Date' },
  { value: 'spoiled', label: 'Spoiled / Mold Detected' },
  { value: 'damaged_packaging', label: 'Damaged Packaging / Broken Seal' },
  { value: 'contamination_suspected', label: 'Contamination Suspected' },
  { value: 'recalled', label: 'Official Product Recall' },
  { value: 'other', label: 'Other Reason (requires explanation note)' },
];

export const DisposalLog = () => {
  usePageTitle('Disposal Audit Log');
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { showToast } = useToast();

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await logsApi.list({
        type: 'disposal',
        search,
        reason,
        from: fromDate,
        to: toDate,
        limit: 100,
      });
      setLogs(data.logs || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 100 });
    } catch (err) {
      setError(err.message || 'Failed to load disposal audit logs');
    } finally {
      setLoading(false);
    }
  }, [search, reason, fromDate, toDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const resetFilters = () => {
    setSearch('');
    setReason('all');
    setFromDate('');
    setToDate('');
  };

  const getReasonBadgeStyle = (r) => {
    switch (r) {
      case 'expired':
        return 'bg-red-50 text-red-900 border-red-300 font-semibold';
      case 'spoiled':
        return 'bg-amber-50 text-amber-950 border-amber-300 font-semibold';
      case 'contamination_suspected':
        return 'bg-red-100 text-red-950 border-red-400 font-bold';
      case 'recalled':
        return 'bg-stone-200 text-stone-900 border-stone-400 font-bold';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300 font-medium';
    }
  };

  const handleExportCsv = () => {
    if (logs.length === 0) {
      showToast('No records available to export', 'warning');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `community-fridge-disposals-${todayStr}.csv`;

    const columns = [
      { header: 'Item Name', key: 'itemName' },
      { header: 'Category', getValue: (row) => formatCategory(row.category) },
      { header: 'Quantity Disposed', key: 'quantity' },
      { header: 'Unit', key: 'unit' },
      { header: 'Mandatory Reason', getValue: (row) => formatReason(row.reason) },
      { header: 'Explanation Note', getValue: (row) => row.note || row.notes || '' },
      { header: 'Authorized By', getValue: (row) => row.performedByName || row.performedBy?.name || 'Volunteer' },
      { header: 'Disposal Timestamp', getValue: (row) => formatDateTime(row.createdAt) },
    ];

    const success = exportToCsv(filename, columns, logs);
    if (success) {
      showToast(`Exported ${logs.length} disposal audit records to CSV`, 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1B19]">
            Food Waste &amp; Disposal Audit Log
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Mandatory recorded disposals with audited safety reasons to maintain food safety and identify waste patterns.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={loading || logs.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 active:bg-stone-100 transition-colors shadow-xs touch-target disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          title="Export current filtered records to CSV"
        >
          <Download className="w-4 h-4 text-[#1F5E43]" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item, note, or volunteer..."
              className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              aria-label="Search disposal logs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" aria-hidden="true" />
          </div>

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none touch-target"
            aria-label="Filter by mandatory disposal reason"
          >
            {DISPOSAL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 shrink-0">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              aria-label="Filter disposals from date"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none touch-target"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text-stone-500 shrink-0">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="Filter disposals to date"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none touch-target"
              />
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-semibold flex items-center gap-1 touch-target shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-stone-500 pt-1">
          Showing {logs.length} of {pagination.total} disposal record{pagination.total === 1 ? '' : 's'}.
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner label="Loading disposal safety logs..." />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
          <p className="font-semibold">Error loading disposal logs</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={loadLogs}
            className="mt-3 px-3 py-1.5 bg-red-800 text-white rounded text-xs font-semibold"
          >
            Retry Loading
          </button>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="No disposal records found"
          description="Any food items discarded due to expiration, spoilage, or packaging damage will appear here."
          action={
            (search || reason !== 'all' || fromDate || toDate) ? (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg touch-target"
              >
                Clear Filters
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile View: Stacked Cards (visible below md breakpoint) */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => (
              <div
                key={log._id}
                className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      {formatCategory(log.category)}
                    </span>
                    <h2 className="text-base font-bold text-stone-900 leading-snug">
                      {log.itemName}
                    </h2>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] ${getReasonBadgeStyle(
                      log.reason
                    )} shrink-0`}
                  >
                    {formatReason(log.reason)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                  <span className="text-stone-500">Quantity Discarded:</span>
                  <span className="font-bold text-sm text-red-800">
                    {log.quantity} <span className="text-xs font-normal text-stone-600">{log.unit}</span>
                  </span>
                </div>

                {(log.note || log.notes) && (
                  <div className="text-xs text-stone-800 bg-red-50/60 p-2.5 rounded-lg border border-red-200/70">
                    <span className="font-semibold text-red-950">Reason Note: </span>
                    {log.note || log.notes}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    {log.performedByName || log.performedBy?.name || 'Volunteer'}
                  </span>
                  <span>{formatDateTime(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Clean Table (visible at md breakpoint and above) */}
          <div className="hidden md:block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3">Disposed Food Item</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Quantity</th>
                    <th scope="col" className="px-4 py-3">Mandatory Reason</th>
                    <th scope="col" className="px-4 py-3">Volunteer Explanation Note</th>
                    <th scope="col" className="px-4 py-3">Authorized By</th>
                    <th scope="col" className="px-4 py-3 text-right">Disposal Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        {log.itemName}
                      </td>
                      <td className="px-4 py-3">{formatCategory(log.category)}</td>
                      <td className="px-4 py-3 font-bold text-red-800">
                        {log.quantity} <span className="font-normal text-stone-500">{log.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] ${getReasonBadgeStyle(
                            log.reason
                          )}`}
                        >
                          {formatReason(log.reason)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-700 max-w-sm">
                        {log.note || log.notes || '-'}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {log.performedByName || log.performedBy?.name || 'Volunteer'}
                      </td>
                      <td className="px-4 py-3 text-right text-stone-500 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
