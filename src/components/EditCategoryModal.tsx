import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category } from '../types';
import * as db from '../services/db';

interface EditCategoryModalProps {
  category: Category;
  onClose: () => void;
  onCategoryUpdated: () => void;
}

export function EditCategoryModal({ category, onClose, onCategoryUpdated }: EditCategoryModalProps) {
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const updatedCategory: Category = {
        ...category,
        name: name.trim()
      };

      await db.updateCategory(updatedCategory);
      onCategoryUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update category:', err);
      setError('Failed to update category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#23252b] rounded-lg shadow-xl w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Edit Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#ff6b00] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2c35] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:border-transparent"
              placeholder="Enter category name"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#ff6b00] text-white rounded-lg hover:bg-[#ff8533] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
