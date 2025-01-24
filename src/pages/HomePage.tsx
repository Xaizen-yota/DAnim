import { useState, useEffect } from 'react';
import { VideoModal } from '../components/VideoModal';
import { CategorySlider } from '../components/CategorySlider';
import { AddVideoModal } from '../components/AddVideoModal';
import { Video, Category } from '../types';
import * as db from '../services/db';
import { Film } from '../components/icons';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryVideos, setCategoryVideos] = useState<Record<string, Video[]>>({});
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadContent = async () => {
    try {
      console.log('HomePage: Loading categories and videos...');
      setLoading(true);

      // Load categories
      const cats = await db.getAllCategories();
      console.log(`HomePage: Loaded ${cats.length} categories`);
      setCategories(cats);

      // Load videos for each category
      const videosMap: Record<string, Video[]> = {};
      for (const category of cats) {
        console.log(`HomePage: Loading videos for category "${category.name}"`);
        const videos = await db.getVideosByCategory(category.id);
        console.log(`HomePage: Found ${videos.length} videos in category "${category.name}"`);
        videosMap[category.id] = videos;
      }
      setCategoryVideos(videosMap);

    } catch (error) {
      console.error('HomePage: Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleDeleteVideo = async (video: Video) => {
    try {
      await db.deleteVideo(video.id);
      setSelectedVideo(null);
      loadContent(); // Refresh content after deletion
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    console.log('HomePage: No categories found');
    return (
      <div className="min-h-screen bg-[#23252b] text-white">
        <div className="text-center py-12">
          <h2 className="text-3xl font-semibold mb-4">Welcome to DAnim</h2>
          <p className="text-gray-400">Start by adding your first category!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#23252b]">
      <div className="space-y-12 container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="app-title text-5xl mb-6">
            Welcome to <br />
            <span className="highlight">D</span>
            <span>ANI</span>
            <span className="highlight">M</span>
            <span>E</span>
          </h1>
          <p className="text-xl text-gray-300">Your Ultimate Anime Collection Hub</p>
        </div>
        
        {categories.map((category) => {
          const videos = categoryVideos[category.id] || [];
          console.log(`HomePage: Rendering category "${category.name}" with ${videos.length} videos`);
          
          return videos.length === 0 ? (
            <div key={category.id} className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">{category.name}</h2>
              <div 
                className="text-center py-12 cursor-pointer hover:bg-[#1b1c21] rounded-lg transition-colors"
                onClick={() => setShowAddModal(true)}
              >
                <div className="mb-4">
                  <Film className="w-12 h-12 text-gray-500 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No videos in {category.name}</h3>
                <p className="text-gray-400">Click here to add videos</p>
              </div>
            </div>
          ) : (
            <CategorySlider
              key={category.id}
              category={category}
              videos={videos}
              onVideoClick={(video) => setSelectedVideo(video)}
              onCategoryUpdated={loadContent}
            />
          );
        })}

        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onDelete={handleDeleteVideo}
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
    </div>
  );
}
