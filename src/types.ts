export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  categoryId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

export interface VideoModalProps {
  video: Video;
  onClose: () => void;
  onDelete: (video: Video) => void;
}

export interface CategorySliderProps {
  category: Category;
  videos: Video[];
  onVideoClick: (video: Video) => void;
  onCategoryUpdated: () => void;
}