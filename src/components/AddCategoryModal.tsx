import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addCategory } from '../services/db';

interface AddCategoryModalProps {
  onClose: () => void;
  onCategoryAdded: () => void;
}

export function AddCategoryModal({ onClose, onCategoryAdded }: AddCategoryModalProps) {
  const [name, setName] = useState('');
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

      const newCategory = {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: new Date()
      };

      await addCategory(newCategory);
      onCategoryAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add category:', err);
      setError('Failed to add category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-[#23252b] rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Add Category</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-[#1b1c21] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
