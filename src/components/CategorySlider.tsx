import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Category, Video } from '../types';
import { deleteCategory } from '../services/db';
import { EditCategoryModal } from './EditCategoryModal';
import { Film } from './icons';
import { AddVideoModal } from './AddVideoModal';

interface CategorySliderProps {
  category: Category;
  videos: Video[];
  onVideoClick: (video: Video) => void;
  onCategoryUpdated: () => void;
}

export function CategorySlider({ category, videos, onVideoClick, onCategoryUpdated }: CategorySliderProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this category? All videos in this category will also be deleted.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCategory(category.id);
      onCategoryUpdated();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {videos.length === 0 ? (
        <div>
          <div 
            className="text-center py-12 cursor-pointer hover:bg-[#1b1c21] rounded-lg transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <div className="mb-4">
              <Film className="w-12 h-12 text-gray-500 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No videos in this category yet.</h3>
            <p className="text-gray-400">Click here to add videos</p>
          </div>
          {showAddModal && (
            <AddVideoModal
              onClose={() => setShowAddModal(false)}
              onVideoAdded={() => {
                setShowAddModal(false);
                onCategoryUpdated();
              }}
            />
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex-none w-[240px] sm:w-64 cursor-pointer group"
                onClick={() => onVideoClick(video)}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-white font-semibold text-lg truncate">{video.title}</h3>
                        <p className="text-gray-300 text-sm truncate">{video.description}</p>
                        <p className="text-gray-400 text-xs">Added on {new Date(video.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showEditModal && (
        <EditCategoryModal
          category={category}
          onClose={() => setShowEditModal(false)}
          onCategoryUpdated={() => {
            onCategoryUpdated();
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}