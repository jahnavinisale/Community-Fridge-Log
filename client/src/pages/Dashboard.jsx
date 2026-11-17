import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { logsApi } from '../api/logsApi.js';
import { itemsApi } from '../api/itemsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { StatsCard } from '../components/StatsCard.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import { DisposeModal } from '../components/DisposeModal.jsx';
import { CollectModal } from '../components/CollectModal.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { formatCategory, formatDateTime, formatReason } from '../utils/formatters.js';
import { usePageTitle } from '../utils/usePageTitle.js';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Boxes,
  Truck,
  Trash2,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

export const Dashboard = () => {
  usePageTitle('Dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [activeItem, setActiveItem] = useState(null);
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);

  const { showToast } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await logsApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleOpenDispose = (item) => {
    setActiveItem(item);
    setIsDisposeOpen(true);
  };

  const handleOpenCollect = (item) => {
    setActiveItem(item);
    setIsCollectOpen(true);
  };

  const handleDisposeSubmit = async (payload) => {
    if (!activeItem) return;
    await itemsApi.dispose(activeItem._id, payload);
    showToast(`Logged safe disposal for ${activeItem.name}`, 'warning');
    loadDashboardData();
  };

  const handleCollectSubmit = async (payload) => {
    if (!activeItem) return;
    await itemsApi.collect(activeItem._id, payload);
    showToast(`Logged collection for ${activeItem.name}`, 'success');
    loadDashboardData();
  };

  if (loading) {
    return <LoadingSpinner label="Loading fridge stock and safety alerts..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
          <p className="font-semibold">Unable to load dashboard</p>
          <p className="mt-1">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-3 px-3 py-1.5 bg-red-800 text-white rounded text-xs font-semibold"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const urgency = stats?.urgencySummary || {
    expired: 0,
    useToday: 0,
    useWithin2Days: 0,
    ok: 0,
    totalInStock: 0,
  };

  const urgentItems = stats?.urgentItems || [];
  const recentLogs = stats?.recentActivity || [];
  const categories = stats?.categoryBreakdown || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1B19]">
            Fridge Operations Dashboard
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Real-time stock levels, urgent use-by alerts, and volunteer activity log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/add-item"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1F5E43] text-white hover:bg-[#184D37] active:bg-[#123D2B] transition-colors touch-target"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            Add Donation
          </Link>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition-colors touch-target"
          >
            View All Stock
          </Link>
        </div>
      </div>

      {/* Act Now Section: Priority items sorted by soonest use-by date (SURFACED FIRST) */}
      <section aria-labelledby="act-now-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600" aria-hidden="true" />
            <h2 id="act-now-heading" className="text-lg font-bold text-[#1C1B19]">
              Act Now: Expiring or Urgent Items
            </h2>
          </div>
          <Link
            to="/inventory?status=in_stock"
            className="text-xs font-semibold text-[#1F5E43] hover:underline flex items-center gap-1"
          >
            All Inventory
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {urgentItems.length === 0 ? (
          <EmptyState
            title="No urgent food items right now"
            description="All active food items in stock have 3 or more days of shelf life remaining."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onCollect={handleOpenCollect}
                onDispose={handleOpenDispose}
              />
            ))}
          </div>
        )}
      </section>

      {/* Summary Counts (Plain numbers, no animation) */}
      <section aria-labelledby="summary-heading" className="space-y-3">
        <h2 id="summary-heading" className="text-sm font-semibold uppercase tracking-wider text-stone-600">
          Stock &amp; Urgency Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Expired Items"
            value={urgency.expired}
            subtitle="Do not distribute without safety check"
            icon={AlertOctagon}
            variant="expired"
          />
          <StatsCard
            title="Use Today"
            value={urgency.useToday}
            subtitle="Must be distributed or used today"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatsCard
            title="Soon (1-2 Days)"
            value={urgency.useWithin2Days}
            subtitle="Priority stock for pickup"
            icon={Clock}
            variant="soon"
          />
          <StatsCard
            title="In Stock Total"
            value={urgency.totalInStock}
            subtitle="Active items currently in fridge"
            icon={Boxes}
            variant="forest"
          />
        </div>
      </section>

      {/* Secondary Dashboard Sections: Category Distribution & Recent Volunteer Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">
            Stock by Food Category
          </h3>
          {categories.length === 0 ? (
            <p className="text-xs text-stone-500">No stock data available</p>
          ) : (
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-800">{formatCategory(c.category)}</span>
                  <span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-mono">
                    {c.count} items ({c.totalQuantity} units)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Volunteer Activity Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
              Recent Activity Feed
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <Link to="/collections" className="text-[#1F5E43] hover:underline font-medium">
                Collections Log
              </Link>
              <span className="text-stone-300">|</span>
              <Link to="/disposals" className="text-red-700 hover:underline font-medium">
                Disposals Log
              </Link>
            </div>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-stone-500">No activity recorded yet</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentLogs.map((log) => {
                const isCollection = log.type === 'collection';
                const isDisposal = log.type === 'disposal';

                return (
                  <div key={log._id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-md mt-0.5 ${
                          isCollection
                            ? 'bg-emerald-50 text-[#1F5E43]'
                            : isDisposal
                            ? 'bg-red-50 text-red-700'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                        aria-hidden="true"
                      >
                        {isCollection ? (
                          <Truck className="w-3.5 h-3.5" />
                        ) : isDisposal ? (
                          <Trash2 className="w-3.5 h-3.5" />
                        ) : (
                          <Boxes className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">
                          {log.quantity} {log.unit} of {log.itemName}
                        </p>
                        <p className="text-stone-600">
                          {isCollection && `Collected: ${formatReason(log.reason)}`}
                          {isDisposal && `Disposed: ${formatReason(log.reason)}`}
                          {log.type === 'intake' && 'Donation Intake Received'}
                          {log.note && ` - "${log.note}"`}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Logged by {log.performedByName || 'Volunteer'}
                        </p>
                      </div>
                    </div>
                    <time className="text-[11px] text-stone-600 shrink-0">
                      {formatDateTime(log.createdAt)}
                    </time>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DisposeModal
        item={activeItem}
        isOpen={isDisposeOpen}
        onClose={() => setIsDisposeOpen(false)}
        onSubmit={handleDisposeSubmit}
      />
      <CollectModal
        item={activeItem}
        isOpen={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        onSubmit={handleCollectSubmit}
      />
    </div>
  );
};
