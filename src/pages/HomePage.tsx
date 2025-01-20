import { useState, useEffect } from 'react';
import { VideoModal } from '../components/VideoModal';
import { CategorySlider } from '../components/CategorySlider';
import { Video, Category } from '../types';
import * as db from '../services/db';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryVideos, setCategoryVideos] = useState<Record<string, Video[]>>({});
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to MovieLand</h2>
        <p className="text-gray-600">Start by adding your first category!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
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
        
        return (
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
          onClose={() => {
            console.log('HomePage: Closing video modal');
            setSelectedVideo(null);
          }}
          onDelete={handleDeleteVideo}
        />
      )}
    </div>
  );
}
