import React, { useState, useEffect, useRef } from 'react';
import { AlertOctagon, X, AlertTriangle } from 'lucide-react';
import { FormField } from './FormField.jsx';

export const DISPOSAL_REASONS = [
  { value: 'expired', label: 'Past Use-By Date' },
  { value: 'spoiled', label: 'Spoiled / Mold / Degradation' },
  { value: 'damaged_packaging', label: 'Damaged Packaging / Broken Seal' },
  { value: 'contamination_suspected', label: 'Contamination Suspected' },
  { value: 'recalled', label: 'Official Product Recall' },
  { value: 'other', label: 'Other (requires explanation note)' },
];

export const DisposeModal = ({ item, isOpen, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('expired');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity || 1);
      setReason(item.useByStatus === 'expired' ? 'expired' : 'spoiled');
      setNote('');
      setErrors({});
    }
  }, [item, isOpen]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          // Focus the quantity input or first interactive control
          const initial = modalRef.current.querySelector('#dispose-quantity') || focusable[0];
          initial.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const validateForm = () => {
    const newErrors = {};
    const qty = parseFloat(quantity);

    if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'Quantity must be greater than zero';
    } else if (qty > item.quantity) {
      newErrors.quantity = `Quantity cannot exceed current stock (${item.quantity} ${item.unit})`;
    }

    if (!reason) {
      newErrors.reason = 'Please select a disposal reason';
    }

    if (reason === 'other' && (!note || note.trim().length < 3)) {
      newErrors.note = 'A note (at least 3 characters) is required when reason is "Other"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        quantity: parseFloat(quantity),
        reason,
        note: note.trim(),
        notes: note.trim(),
      });
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to record disposal' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispose-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-stone-100 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-800">
            <AlertOctagon className="w-5 h-5" aria-hidden="true" />
            <h2 id="dispose-modal-title" className="text-base font-semibold text-stone-900">
              Record Safe Food Disposal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200 focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 font-medium" role="alert">
              {errors.form}
            </div>
          )}

          <div className="bg-[#FAF8F4] p-3 rounded-lg border border-stone-200 text-xs space-y-1">
            <p className="font-semibold text-stone-900 text-sm">{item.name}</p>
            <p className="text-stone-600">
              Available in fridge: <span className="font-bold text-stone-900">{item.quantity} {item.unit}</span>
            </p>
          </div>

          <FormField
            id="dispose-quantity"
            label={`Quantity to Dispose (${item.unit})`}
            required
            error={errors.quantity}
          >
            <input
              type="number"
              id="dispose-quantity"
              step="any"
              min="0.01"
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              required
            />
          </FormField>

          <FormField
            id="dispose-reason"
            label="Mandatory Disposal Reason"
            required
            error={errors.reason}
            helpText="Audited log: community fridges require a recorded reason for food safety."
          >
            <select
              id="dispose-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
              required
            >
              {DISPOSAL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="dispose-note"
            label={reason === 'other' ? 'Explanation Note (Required)' : 'Volunteer Note (Optional)'}
            required={reason === 'other'}
            error={errors.note}
            helpText={
              reason === 'other'
                ? 'Please describe why this item is being disposed of.'
                : 'Any visible condition details (mold, packaging defect, off-smell).'
            }
          >
            <textarea
              id="dispose-note"
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                reason === 'other'
                  ? 'Describe reason for disposal...'
                  : 'Optional notes on condition or disposal method...'
              }
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43]"
            />
          </FormField>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors touch-target"
            >
              {submitting ? 'Recording...' : 'Confirm Disposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
