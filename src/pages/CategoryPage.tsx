import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoModal } from '../components/VideoModal';
import { CategorySlider } from '../components/CategorySlider';
import { Video, Category } from '../types';
import * as db from '../services/db';
import { ArrowLeft, Film, Trash2, Play, X } from '../components/icons';
import { Edit2 } from 'lucide-react';
import { EditCategoryModal } from '../components/EditCategoryModal';
import { AddVideoModal } from '../components/AddVideoModal';

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadContent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const categoryData = await db.getCategory(id);
      if (!categoryData) {
        setError('Category not found');
        return;
      }

      const videosData = await db.getVideosByCategory(id);
      
      setCategory(categoryData);
      setVideos(videosData);
    } catch (err) {
      console.error('Failed to load category:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [id]);

  const handleDeleteVideo = async (videoToDelete: Video) => {
    try {
      await db.deleteVideo(videoToDelete.id);
      setSelectedVideo(null);
      loadContent();
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const handleCategoryUpdated = async () => {
    await loadContent();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Category not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#23252b]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 group">
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            <button
              onClick={() => setShowEditModal(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-[#ff6b00] text-white"
              aria-label="Edit category"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 text-[#ff6b00] hover:text-[#ff8533] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {videos.length === 0 ? (
          <div 
            className="text-center py-12 cursor-pointer hover:bg-[#1b1c21] rounded-lg transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <div className="mb-4">
              <Film className="w-12 h-12 text-gray-500 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No videos yet</h3>
            <p className="text-gray-400">Click here to add videos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-[#1b1c21] rounded-lg overflow-hidden border border-gray-800 hover:border-orange-500/50 transition-colors"
              >
                <div className="relative aspect-video">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVideo(video);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Added on {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm hover:from-orange-600 hover:to-orange-700"
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onDelete={handleDeleteVideo}
        />
      )}

      {showEditModal && category && (
        <EditCategoryModal
          category={category}
          onClose={() => setShowEditModal(false)}
          onCategoryUpdated={handleCategoryUpdated}
        />
      )}

      {showAddModal && (
        <AddVideoModal
          onClose={() => setShowAddModal(false)}
          onVideoAdded={() => {
            setShowAddModal(false);
            loadContent();
          }}
        />
      )}
    </div>
  );
}