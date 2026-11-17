import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemsApi } from '../api/itemsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { FormField } from '../components/FormField.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { usePageTitle } from '../utils/usePageTitle.js';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'produce', label: 'Fresh Produce (Fruit and Vegetables)' },
  { value: 'dairy', label: 'Dairy and Eggs' },
  { value: 'bakery', label: 'Bakery (Bread and Pastries)' },
  { value: 'cooked meal', label: 'Prepared / Cooked Meal' },
  { value: 'packaged', label: 'Packaged / Pantry Groceries' },
  { value: 'drinks', label: 'Drinks and Juices' },
  { value: 'other', label: 'Other Food Item' },
];

const UNITS = [
  { value: 'items', label: 'Individual items' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'litres', label: 'Litres (L)' },
  { value: 'ml', label: 'Millilitres (ml)' },
  { value: 'packs', label: 'Packs' },
  { value: 'portions', label: 'Portions' },
  { value: 'loaves', label: 'Loaves' },
  { value: 'cans', label: 'Cans' },
  { value: 'bottles', label: 'Bottles' },
];

const STORAGE_LOCATIONS = [
  { value: 'fridge', label: 'Main Fridge Compartment (1 to 4 C)' },
  { value: 'freezer', label: 'Freezer (-18 C)' },
  { value: 'pantry_shelf', label: 'Dry Pantry Shelf' },
  { value: 'bakery_rack', label: 'Bakery / Bread Rack' },
  { value: 'ambient', label: 'Ambient Temperature Table' },
];

export const EditItem = () => {
  usePageTitle('Edit Food Item');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'produce',
    quantity: '1',
    unit: 'items',
    useByDate: '',
    dateReceived: '',
    donatedBy: '',
    storageLocation: 'fridge',
    storageNote: '',
    allergensNote: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await itemsApi.getById(id);
      const item = data.item;

      // Format ISO dates to YYYY-MM-DD for date inputs
      const formatToInputDate = (d) => {
        if (!d) return '';
        try {
          return new Date(d).toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setFormData({
        name: item.name || '',
        category: item.category || 'produce',
        quantity: item.quantity?.toString() || '1',
        unit: item.unit || 'items',
        useByDate: formatToInputDate(item.useByDate),
        dateReceived: formatToInputDate(item.dateReceived || item.donatedDate),
        donatedBy: item.donatedBy || item.donorName || '',
        storageLocation: item.storageLocation || 'fridge',
        storageNote: item.storageNote || '',
        allergensNote: item.allergensNote || '',
        notes: item.notes || '',
      });
    } catch (err) {
      setLoadError(err.message || 'Item could not be loaded for editing');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Item name must be at least 2 characters';
    } else if (formData.name.trim().length > 120) {
      newErrors.name = 'Item name cannot exceed 120 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a food category';
    }

    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'Quantity must be greater than zero';
    }

    if (!formData.useByDate) {
      newErrors.useByDate = 'Use-by date is required for food safety';
    } else if (isNaN(Date.parse(formData.useByDate))) {
      newErrors.useByDate = 'Please provide a valid calendar date';
    }

    if (formData.donatedBy && formData.donatedBy.length > 100) {
      newErrors.donatedBy = 'Donor name cannot exceed 100 characters';
    }

    if (formData.storageNote && formData.storageNote.length > 300) {
      newErrors.storageNote = 'Storage notes cannot exceed 300 characters';
    }

    if (formData.allergensNote && formData.allergensNote.length > 300) {
      newErrors.allergensNote = 'Allergen notice cannot exceed 300 characters';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'General notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await itemsApi.update(id, {
        ...formData,
        quantity: parseFloat(formData.quantity),
        donatedBy: formData.donatedBy.trim() || 'Anonymous Donor',
        donorName: formData.donatedBy.trim() || 'Anonymous Donor',
      });
      showToast(`Updated details for ${formData.name}`, 'success');
      navigate(`/inventory/${id}`);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to update item record' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading item for editing..." />;
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
          <p className="font-semibold">Unable to edit item</p>
          <p className="mt-1">{loadError}</p>
          <Link to="/inventory" className="mt-3 inline-block text-xs font-semibold underline">
            Return to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/inventory/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Item Details
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
        <div className="border-b border-stone-200 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-[#1C1B19]">
            Edit Food Item Record
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Update stock quantity, use-by date, storage instructions, or allergen notes.
          </p>
        </div>

        {errors.form && (
          <div
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium flex items-start gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField
            id="item-name"
            label="Food Item Name"
            required
            error={errors.name}
            helpText="Be specific (for example: Whole Milk 2L, Brown Sourdough Loaf)."
          >
            <input
              type="text"
              id="item-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Organic Semi-Skimmed Milk 1L"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="item-category"
              label="Food Category"
              required
              error={errors.category}
            >
              <select
                id="item-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="item-storageLocation"
              label="Storage Location"
              required
              error={errors.storageLocation}
            >
              <select
                id="item-storageLocation"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              >
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="item-quantity"
              label="Remaining Quantity"
              required
              error={errors.quantity}
            >
              <input
                type="number"
                id="item-quantity"
                name="quantity"
                step="any"
                min="0.01"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              />
            </FormField>

            <FormField
              id="item-unit"
              label="Measurement Unit"
              required
              error={errors.unit}
            >
              <select
                id="item-unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="item-useByDate"
              label="Use-By / Expiry Date"
              required
              error={errors.useByDate}
              helpText="Food safety date printed on packaging."
            >
              <input
                type="date"
                id="item-useByDate"
                name="useByDate"
                value={formData.useByDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              />
            </FormField>

            <FormField
              id="item-donatedBy"
              label="Donated By (Donor Name)"
              error={errors.donatedBy}
              helpText="Optional: individual or partner bakery/supermarket."
            >
              <input
                type="text"
                id="item-donatedBy"
                name="donatedBy"
                value={formData.donatedBy}
                onChange={handleChange}
                placeholder="e.g. City Bakery, Anonymous Neighbor"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              />
            </FormField>
          </div>

          <FormField
            id="item-storageNote"
            label="Specific Storage Instructions"
            error={errors.storageNote}
            helpText="e.g. Keep on bottom shelf away from cooked meals."
          >
            <input
              type="text"
              id="item-storageNote"
              name="storageNote"
              value={formData.storageNote}
              onChange={handleChange}
              placeholder="e.g. Keep chilled below 4 C, seal tightly after opening"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
            />
          </FormField>

          <FormField
            id="item-allergensNote"
            label="Allergens / Dietary Warnings"
            error={errors.allergensNote}
            helpText="Common allergens (nuts, milk, gluten, soy, eggs, sesame)."
          >
            <input
              type="text"
              id="item-allergensNote"
              name="allergensNote"
              value={formData.allergensNote}
              onChange={handleChange}
              placeholder="e.g. Contains wheat gluten and milk; manufactured in nut-free kitchen"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
            />
          </FormField>

          <FormField
            id="item-notes"
            label="Volunteer Notes"
            error={errors.notes}
            helpText="Any additional observations regarding packaging condition or donation source."
          >
            <textarea
              id="item-notes"
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Outer cardboard slightly scuffed but internal tamper-proof seal intact."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
            />
          </FormField>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <Link
              to={`/inventory/${id}`}
              className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors touch-target"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-[#1F5E43] text-white hover:bg-[#184D37] active:bg-[#123D2B] transition-colors shadow-xs touch-target disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
