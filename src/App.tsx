import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Plus, Film, Video, List, Maximize2, Minus, X } from 'lucide-react';
import { Video as VideoType, Category } from './types';
import { VideoModal } from './components/VideoModal';
import { AddVideoModal } from './components/AddVideoModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { CategoryPage } from './pages/CategoryPage';
import { CategorySlider } from './components/CategorySlider';
import { Footer } from './components/Footer';
import * as db from './services/db';
import { initDB } from './services/db';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('Starting database initialization...');
        await initDB();
        console.log('Database initialized successfully');
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setDbError(`Failed to initialize the application: ${errorMessage}. Please refresh the page or check if your browser supports IndexedDB.`);
      }
    };

    initDatabase();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const focusable = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const currentFocus = document.activeElement;
      let index = Array.from(focusable).indexOf(currentFocus as Element);

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          index = Math.min(index + 1, focusable.length - 1);
          (focusable[index] as HTMLElement).focus();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          index = Math.max(index - 1, 0);
          (focusable[index] as HTMLElement).focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          index = Math.max(index - 4, 0); 
          (focusable[index] as HTMLElement).focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          index = Math.min(index + 4, focusable.length - 1); 
          (focusable[index] as HTMLElement).focus();
          break;
        case 'Enter':
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCategoryAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (dbError) {
    return (
      <div className="min-h-screen bg-[#23252b] text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
          <p className="text-gray-300 mb-4">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!dbInitialized) {
    return (
      <div className="min-h-screen bg-[#23252b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#23252b] flex flex-col">
      <TitleBar />
      <div className="bg-gradient-to-b from-[#23252b] to-[#1b1c21] flex-grow">
        <div className="pattern-left" />
        <div className="pattern-right" />
        <div className="body-overlay" />
        <div className="container mx-auto px-4">
          <nav className="border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <a className="flex items-center gap-2" href="/">
                  <h1 className="app-title">
                    <span className="highlight">D</span>
                    <span>ANI</span>
                    <span className="highlight">M</span>
                    <span>E</span>
                  </h1>
                </a>
                <div className="relative">
                  <AddButton onCategoryAdded={handleCategoryAdded} />
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage key={refreshKey} />} />
              <Route path="/category/:id" element={<CategoryPage />} />
            </Routes>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const TitleBar = () => {
  return (
    <div className="flex items-center justify-between bg-[#23252b] p-2 select-none">
      <div className="flex items-center gap-2 ml-2">
        <Film className="w-5 h-5 text-[#ff6b00]" />
        <span className="text-white font-medium">Danime</span>
      </div>
      <div className="flex items-center">
        <button className="p-2 hover:bg-[#ff6b00] text-white transition-colors">
          <Minus className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-[#ff6b00] text-white transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-[#ff6b00] text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function AddButton({ onCategoryAdded }: { onCategoryAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleCategoryAdded = () => {
    onCategoryAdded();
    setShowCategoryModal(false);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-primary rounded-full p-3 flex items-center justify-center"
          aria-label="Add content"
        >
          <Plus className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#2a2c35] rounded-lg shadow-lg border border-gray-800 overflow-hidden z-50">
            <button
              onClick={() => {
                setShowVideoModal(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#32343e] flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Add Video
            </button>
            <button
              onClick={() => {
                setShowCategoryModal(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#32343e] flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Add Category
            </button>
          </div>
        )}
      </div>

      {showVideoModal && (
        <AddVideoModal 
          onClose={() => setShowVideoModal(false)} 
          onVideoAdded={() => setShowVideoModal(false)} 
        />
      )}
      
      {showCategoryModal && (
        <AddCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      )}
    </>
  );
}

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Demon Slayer",
      description: "Follow Tanjiro's epic journey in the acclaimed anime series",
      image: "https://www.otaku-discount.com/modules/smartblog/images/59-large_default.jpg"
    },
    {
      title: "Attack on Titan",
      description: "Humanity's last stand against the mysterious Titans",
      image: "https://static1.cbrimages.com/wordpress/wp-content/uploads/2024/01/attack-on-titan-every-main-character-fate.jpg"
    },
    {
      title: "One Piece",
      description: "Join Luffy and his crew in their quest for the One Piece",
      image: "https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=85,width=1200,height=675/catalog/crunchyroll/a249096c7812deb8c3c2c907173f3774.jpg"
    },
    {
      title: "Jujutsu Kaisen",
      description: "Enter the world of Curses and Jujutsu Sorcerers",
      image: "https://our.today/wp-content/uploads/2023/03/jujutsu-kaisen-season2-our-today-banner.jpg"
    },
    {
      title: "My Hero Academia",
      description: "Where heroes rise and legends are born",
      image: "https://images8.alphacoders.com/736/736903.jpg"
    },
    {
      title: "korea Drama",
      description: "A psychological thriller that questions justice and morality",
      image: "https://image.kpopmap.com/2021/01/vincenzo-drama-tvn-official-2021-5-scaled.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vids, cats] = await Promise.all([
        db.getAllVideos(),
        db.getAllCategories()
      ]);
      setVideos(vids);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryUpdated = () => {
    loadData();
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    try {
      await db.deleteVideo(selectedVideo.id);
      setVideos(videos.filter(v => v.id !== selectedVideo.id));
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-24">
        <Film className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">
          Welcome to Your Video Library
        </h2>
        <p className="text-gray-500 mb-8">
          Start by adding a category for your videos
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#23252b] to-[#1b1c21]">
      {/* Hero Section */}
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0f] via-[#1a0f0f]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 hero-content w-full lg:w-2/3">
              <h2 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
                {slide.title}
              </h2>
              <p className="hero-description text-base md:text-lg lg:text-xl text-white/90 mb-6">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-4 bg-gradient-to-b from-[#23252b] to-[#1b1c21]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-3">
            Welcome to <br />
            <span className="text-3xl">
              <span className="text-[#ff6b00]">D</span>
              <span className="text-[#ff6b00]">A</span>
              <span className="text-[#ff6b00]">N</span>
              <span>I</span>
              <span className="text-[#ff6b00]">M</span>
              <span>E</span>
            </span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl mx-auto">
            Your ultimate destination for organizing and enjoying your favorite videos. Enjoy xd
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => {
            const categoryVideos = videos.filter((video) => video.categoryId === category.id);

            return (
              <div key={category.id} className="mb-12">
                <div className="flex items-center justify-center sm:justify-between mb-4">
                  <Link
                    to={`/category/${category.id}`}
                    className="group text-2xl font-bold text-white hover:text-orange-500 transition-colors"
                  >
                    {category.name}
                    <div className="h-0.5 w-0 group-hover:w-full bg-orange-500 transition-all duration-300"></div>
                  </Link>
                </div>
                {categoryVideos.length > 0 ? (
                  <CategorySlider
                    category={category}
                    videos={categoryVideos}
                    onVideoClick={setSelectedVideo}
                    onCategoryUpdated={handleCategoryUpdated}
                  />
                ) : (
                  <div className="text-center py-16 bg-[#2a2c35] rounded-xl border border-[#32343e]">
                    <Film className="w-12 h-12 mx-auto text-orange-500/60 mb-4" />
                    <p className="text-gray-300">No videos in this category yet.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onDelete={handleDeleteVideo}
        />
      )}
    </div>
  );
}

export default App;
