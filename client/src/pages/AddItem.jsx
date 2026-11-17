import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { itemsApi } from '../api/itemsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { FormField } from '../components/FormField.jsx';
import { usePageTitle } from '../utils/usePageTitle.js';
import { PlusCircle, ArrowLeft, Calendar, Package, AlertCircle } from 'lucide-react';

export const AddItem = () => {
  usePageTitle('Record Donation Intake');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    category: 'produce',
    quantity: '1',
    unit: 'items',
    useByDate: '',
    dateReceived: todayStr,
    donatedBy: '',
    storageLocation: 'fridge',
    storageNote: '',
    allergensNote: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await itemsApi.create({
        ...formData,
        quantity: parseFloat(formData.quantity),
        donatedBy: formData.donatedBy.trim() || 'Anonymous Donor',
        donorName: formData.donatedBy.trim() || 'Anonymous Donor',
      });
      showToast(`Successfully added ${formData.name} to fridge inventory`, 'success');
      navigate('/inventory');
    } catch (err) {
      setErrors({ form: err.message || 'Failed to add item to inventory' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
        <div className="border-b border-stone-200 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-[#1C1B19]">
            Record Food Donation Intake
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Log incoming food donations with required use-by dates so volunteers can safely track freshness.
          </p>
        </div>

        {errors.form && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 font-medium" role="alert">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FormField id="add-name" label="Food Item Name" required error={errors.name}>
                <input
                  type="text"
                  id="add-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sourdough Loaf, Semi-Skimmed Milk 2L, Bag of Gala Apples"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                />
              </FormField>
            </div>

            <FormField id="add-category" label="Food Category" required error={errors.category}>
              <select
                id="add-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              >
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy and Eggs</option>
                <option value="bakery">Bakery and Bread</option>
                <option value="cooked meal">Cooked Meal</option>
                <option value="packaged">Packaged Goods</option>
                <option value="drinks">Drinks</option>
                <option value="other">Other Goods</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField id="add-quantity" label="Quantity" required error={errors.quantity}>
                <input
                  type="number"
                  id="add-quantity"
                  name="quantity"
                  step="any"
                  min="0.01"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                />
              </FormField>

              <FormField id="add-unit" label="Unit" required>
                <select
                  id="add-unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                >
                  <option value="items">items</option>
                  <option value="packs">packs</option>
                  <option value="boxes">boxes</option>
                  <option value="cans">cans</option>
                  <option value="loaves">loaves</option>
                  <option value="bunches">bunches</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="litres">litres</option>
                  <option value="portions">portions</option>
                  <option value="tins">tins</option>
                </select>
              </FormField>
            </div>

            <FormField
              id="add-useByDate"
              label="Use-By Date"
              required
              error={errors.useByDate}
              helpText="Exact expiration or use-by date on package."
            >
              <input
                type="date"
                id="add-useByDate"
                name="useByDate"
                value={formData.useByDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              />
            </FormField>

            <FormField
              id="add-dateReceived"
              label="Date Received"
              helpText="Date donation arrived at the fridge."
            >
              <input
                type="date"
                id="add-dateReceived"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              />
            </FormField>

            <FormField
              id="add-donatedBy"
              label="Donor Name (Optional)"
              helpText="Donor, business name, or leave blank for anonymous."
            >
              <input
                type="text"
                id="add-donatedBy"
                name="donatedBy"
                value={formData.donatedBy}
                onChange={handleChange}
                placeholder="e.g. Local Co-op, Corner Bakery, Anonymous"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              />
            </FormField>

            <FormField id="add-storageLocation" label="Storage Compartment" required>
              <select
                id="add-storageLocation"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                required
              >
                <option value="fridge">Fridge (Chilled 1 to 4 C)</option>
                <option value="freezer">Freezer (-18 C)</option>
                <option value="pantry">Dry Pantry / Ambient Shelf</option>
              </select>
            </FormField>

            <FormField id="add-storageNote" label="Storage Note (Optional)">
              <input
                type="text"
                id="add-storageNote"
                name="storageNote"
                value={formData.storageNote}
                onChange={handleChange}
                placeholder="e.g. Shelf 2, Vegetable crisper drawer"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              />
            </FormField>

            <FormField id="add-allergensNote" label="Allergens / Ingredients Note (Optional)">
              <input
                type="text"
                id="add-allergensNote"
                name="allergensNote"
                value={formData.allergensNote}
                onChange={handleChange}
                placeholder="e.g. Contains wheat, milk, nuts"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField id="add-notes" label="Additional Volunteer Remarks (Optional)">
                <textarea
                  id="add-notes"
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notes on packaging integrity, inspection details, temperature on arrival..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43]"
                />
              </FormField>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#1F5E43] hover:bg-[#184D37] active:bg-[#123D2B] rounded-lg transition-colors touch-target"
            >
              {submitting ? 'Adding to Inventory...' : 'Save Donation Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
