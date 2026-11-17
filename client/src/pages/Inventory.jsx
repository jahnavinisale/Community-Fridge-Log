import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { itemsApi } from '../api/itemsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { DisposeModal } from '../components/DisposeModal.jsx';
import { CollectModal } from '../components/CollectModal.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { formatCategory, formatDate } from '../utils/formatters.js';
import { usePageTitle } from '../utils/usePageTitle.js';
import {
  Search,
  Filter,
  PlusCircle,
  LayoutGrid,
  List,
  RotateCcw,
  Truck,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';

export const Inventory = () => {
  usePageTitle('Fridge Inventory');
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [activeItem, setActiveItem] = useState(null);
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);

  const { showToast } = useToast();

  // Filters from searchParams or defaults
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'in_stock';
  const category = searchParams.get('category') || 'all';
  const storageLocation = searchParams.get('storageLocation') || 'all';
  const useByStatus = searchParams.get('useByStatus') || 'all';
  const sortOption = searchParams.get('sort') || 'useByDate_asc';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams({ status: 'in_stock', sort: 'useByDate_asc' });
  };

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [sortByField, sortOrder] = sortOption.split('_');

      const data = await itemsApi.list({
        search,
        status,
        category,
        storageLocation,
        useByStatus,
        sortBy: sortByField || 'useByDate',
        order: sortOrder || 'asc',
      });
      setItems(data.items || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 50 });
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [search, status, category, storageLocation, useByStatus, sortOption]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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
    loadItems();
  };

  const handleCollectSubmit = async (payload) => {
    if (!activeItem) return;
    await itemsApi.collect(activeItem._id, payload);
    showToast(`Logged collection for ${activeItem.name}`, 'success');
    loadItems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1B19]">
            Fridge Inventory &amp; Stock
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Total {pagination.total} item{pagination.total === 1 ? '' : 's'} matching active filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-stone-200 bg-white rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/add-item"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1F5E43] text-white hover:bg-[#184D37] active:bg-[#123D2B] transition-colors touch-target"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            Add Donation
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search by food name, donor, or note..."
              className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none touch-target"
              aria-label="Filter by item inventory status"
            >
              <option value="in_stock">In Stock Only</option>
              <option value="collected">Collected Items</option>
              <option value="disposed">Disposed Items</option>
              <option value="all">All Item Records</option>
            </select>

            {/* Urgency Use-by Filter */}
            <select
              value={useByStatus}
              onChange={(e) => updateParam('useByStatus', e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none touch-target"
              aria-label="Filter by use-by urgency"
            >
              <option value="all">All Expiration Dates</option>
              <option value="expired">Expired (Past)</option>
              <option value="use_today">Use Today</option>
              <option value="soon">Soon (1-2 Days)</option>
              <option value="ok">Adequate Shelf Life (3+ Days)</option>
            </select>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none touch-target"
              aria-label="Filter by food category"
            >
              <option value="all">All Categories</option>
              <option value="dairy">Dairy and Eggs</option>
              <option value="produce">Fresh Produce</option>
              <option value="bakery">Bakery</option>
              <option value="cooked meal">Cooked Meal</option>
              <option value="packaged">Packaged</option>
              <option value="drinks">Drinks</option>
              <option value="other">Other</option>
            </select>

            {/* Sort by Use-by Date and other attributes */}
            <select
              value={sortOption}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-800 focus:outline-none touch-target"
              aria-label="Sort inventory items"
            >
              <option value="useByDate_asc">Sort: Use-By Date (Soonest First)</option>
              <option value="useByDate_desc">Sort: Use-By Date (Furthest First)</option>
              <option value="createdAt_desc">Sort: Recently Added</option>
              <option value="name_asc">Sort: Name (A to Z)</option>
              <option value="quantity_desc">Sort: Quantity (Highest First)</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-semibold flex items-center gap-1 touch-target shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner label="Loading fridge stock..." />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
          <p className="font-semibold">Error loading inventory</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found in stock"
          description="Try clearing search filters or add a new donation intake."
          action={
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold hover:bg-stone-200 touch-target"
            >
              Reset Filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onCollect={handleOpenCollect}
              onDispose={handleOpenDispose}
            />
          ))}
        </div>
      ) : (
        /* Accessible Table View */
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">Food Item</th>
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3">Stock Available</th>
                  <th scope="col" className="px-4 py-3">Use-By Date</th>
                  <th scope="col" className="px-4 py-3">Safety Status</th>
                  <th scope="col" className="px-4 py-3">Storage</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-stone-900">
                      <Link to={`/inventory/${item._id}`} className="hover:underline">
                        {item.name}
                      </Link>
                      {item.donatedBy && (
                        <p className="text-[11px] font-normal text-stone-500">
                          Donor: {item.donatedBy}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatCategory(item.category)}</td>
                    <td className="px-4 py-3 font-bold">
                      {item.quantity} <span className="font-normal text-stone-500">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3">{formatDate(item.useByDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.useByStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3 capitalize">{item.storageLocation}</td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'in_stock' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenCollect(item)}
                            className="p-1.5 rounded-md text-[#1F5E43] hover:bg-emerald-50 focus:outline-none"
                            title={`Collect ${item.name}`}
                            aria-label={`Collect ${item.name}`}
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDispose(item)}
                            className="p-1.5 rounded-md text-red-700 hover:bg-red-50 focus:outline-none"
                            title={`Dispose ${item.name}`}
                            aria-label={`Dispose ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="capitalize text-stone-500">{item.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
