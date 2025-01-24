import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Video, Category } from '../types';

interface MovielandDB extends DBSchema {
  videos: {
    key: string;
    value: {
      id: string;
      title?: string;
      description?: string;
      thumbnail: Blob;
      video: Blob;
      categoryId: string;
      createdAt: Date;
    };
  };
  categories: {
    key: string;
    value: Category;
  };
}

let db: IDBPDatabase<MovielandDB>;

export async function initDB() {
  console.group('Database Initialization');
  console.log('Initializing database...');
  
  // Check if IndexedDB is available
  if (!window.indexedDB) {
    console.error('IndexedDB is not available in this browser');
    throw new Error('IndexedDB is not supported in this browser');
  }

  try {
    db = await openDB<MovielandDB>('movieland', 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains('videos')) {
          console.log('Creating videos store...');
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
          videoStore.createIndex('categoryId', 'categoryId', { unique: false });
          console.log('Created videos store with categoryId index');
        }
        
        if (!db.objectStoreNames.contains('categories')) {
          console.log('Creating categories store...');
          db.createObjectStore('categories', { keyPath: 'id' });
          console.log('Created categories store');
        }

        transaction.oncomplete = () => {
          console.log('Database upgrade transaction completed successfully');
        };

        transaction.onerror = (event) => {
          console.error('Database upgrade transaction failed:', event);
        };
      },
      blocked(currentVersion, blockedVersion, event) {
        console.warn('Database upgrade blocked. Current version:', currentVersion, 'Blocked version:', blockedVersion);
        alert('Please close other tabs with this site open and reload.');
      },
      blocking(currentVersion, blockedVersion, event) {
        console.warn('Database is blocking upgrade. Current version:', currentVersion, 'Blocked version:', blockedVersion);
      },
      terminated() {
        console.error('Database connection was terminated unexpectedly');
      }
    });
    
    console.log('Database initialized successfully');
    console.groupEnd();
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.groupEnd();
    throw error;
  }
}

// Add a function to check database connection
export async function checkDB() {
  if (!db) {
    console.log('Database not initialized, attempting to initialize...');
    await initDB();
  }
  return db;
}

export async function addVideo(videoData: FormData): Promise<Video> {
  console.group('Add Video');
  console.log('Processing video data...');
  
  try {
    await checkDB();
    const categoryId = videoData.get('categoryId') as string;
    const video = videoData.get('video') as File;
    const thumbnail = videoData.get('thumbnail') as File | null;

    if (!categoryId || !video) {
      throw new Error('Missing required fields: category and video are required');
    }

    const videoId = crypto.randomUUID();

    // If no thumbnail is provided, create one from the video
    let thumbnailBlob: Blob;
    if (thumbnail) {
      thumbnailBlob = thumbnail;
    } else {
      // Create a default thumbnail if none is provided
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Thumbnail', canvas.width / 2, canvas.height / 2);
        const blob = await new Promise<Blob>((resolve) => 
          canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.8)
        );
        thumbnailBlob = blob;
      } else {
        throw new Error('Failed to create default thumbnail');
      }
    }

    // Get title from video filename or use default
    const title = (videoData.get('title') as string) || video.name.split('.').slice(0, -1).join('.') || 'Untitled Video';
    const description = (videoData.get('description') as string) || '';

    // Store the video data in IndexedDB
    await db.put('videos', {
      id: videoId,
      title,
      description,
      thumbnail: thumbnailBlob,
      video,
      categoryId,
      createdAt: new Date(),
    });

    // Create URLs from the stored blobs
    const storedVideo = await db.get('videos', videoId);
    if (!storedVideo) {
      throw new Error('Failed to store video');
    }

    const newVideo: Video = {
      id: videoId,
      title,
      description,
      thumbnail: URL.createObjectURL(storedVideo.thumbnail),
      videoUrl: URL.createObjectURL(storedVideo.video),
      categoryId,
      createdAt: storedVideo.createdAt,
    };

    console.log('Video added successfully:', { id: videoId, title });
    console.groupEnd();
    return newVideo;
  } catch (error) {
    console.error('Failed to add video:', error);
    console.groupEnd();
    throw error;
  }
}

export async function getVideo(id: string): Promise<Video | undefined> {
  console.group('Get Video');
  console.log(`Fetching video with ID "${id}"...`);
  try {
    const videoData = await db.get('videos', id);
    if (!videoData) {
      console.log('Video not found');
      console.groupEnd();
      return undefined;
    }

    const result = {
      id: videoData.id,
      title: videoData.title,
      description: videoData.description,
      thumbnail: URL.createObjectURL(videoData.thumbnail),
      videoUrl: URL.createObjectURL(videoData.video),
      categoryId: videoData.categoryId,
      createdAt: videoData.createdAt,
    };
    console.log('Video found:', { id: result.id, title: result.title });
    console.groupEnd();
    return result;
  } catch (error) {
    console.error('Failed to get video:', error);
    console.groupEnd();
    throw error;
  }
}

export async function getAllVideos(): Promise<Video[]> {
  console.group('Get All Videos');
  console.log('Fetching all videos...');
  try {
    const videos = await db.getAll('videos');
    const result = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: URL.createObjectURL(video.thumbnail),
      videoUrl: URL.createObjectURL(video.video),
      categoryId: video.categoryId,
      createdAt: video.createdAt,
    }));
    console.log(`Found ${result.length} videos`);
    console.groupEnd();
    return result;
  } catch (error) {
    console.error('Failed to get videos:', error);
    console.groupEnd();
    throw error;
  }
}

export async function getVideosByCategory(categoryId: string): Promise<Video[]> {
  console.group('Get Videos By Category');
  console.log(`Fetching videos for category "${categoryId}"...`);
  try {
    const allVideos = await db.getAll('videos');
    const categoryVideos = allVideos.filter(v => v.categoryId === categoryId);
    const result = categoryVideos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: URL.createObjectURL(video.thumbnail),
      videoUrl: URL.createObjectURL(video.video),
      categoryId: video.categoryId,
      createdAt: video.createdAt,
    }));
    console.log(`Found ${result.length} videos in category`);
    console.groupEnd();
    return result;
  } catch (error) {
    console.error('Failed to get category videos:', error);
    console.groupEnd();
    throw error;
  }
}

export async function deleteVideo(id: string): Promise<void> {
  console.group('Delete Video');
  console.log(`Deleting video with ID "${id}"...`);
  try {
    await db.delete('videos', id);
    console.log('Video deleted successfully');
    console.groupEnd();
  } catch (error) {
    console.error('Failed to delete video:', error);
    console.groupEnd();
    throw error;
  }
}

export async function addCategory(category: Category): Promise<void> {
  console.group('Add Category');
  console.log('Adding category:', category);
  try {
    await db.add('categories', category);
    console.log('Category added successfully');
    console.groupEnd();
  } catch (error) {
    console.error('Failed to add category:', error);
    console.groupEnd();
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  console.group('Get All Categories');
  console.log('Fetching all categories...');
  try {
    const categories = await db.getAll('categories');
    console.log(`Found ${categories.length} categories`);
    console.groupEnd();
    return categories;
  } catch (error) {
    console.error('Failed to get categories:', error);
    console.groupEnd();
    throw error;
  }
}

export async function getCategory(id: string): Promise<Category | undefined> {
  console.group('Get Category');
  console.log(`Fetching category with ID "${id}"...`);
  try {
    const category = await db.get('categories', id);
    if (!category) {
      console.log('Category not found');
      console.groupEnd();
      return undefined;
    }
    console.log('Category found:', category);
    console.groupEnd();
    return category;
  } catch (error) {
    console.error('Failed to get category:', error);
    console.groupEnd();
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  console.group('Delete Category');
  console.log(`Deleting category with ID "${id}"...`);
  try {
    // First, delete all videos in this category
    const videos = await getVideosByCategory(id);
    await Promise.all(videos.map(video => deleteVideo(video.id)));

    // Then delete the category
    await db.delete('categories', id);
    console.log('Category and associated videos deleted successfully');
    console.groupEnd();
  } catch (error) {
    console.error('Failed to delete category:', error);
    console.groupEnd();
    throw error;
  }
}

export async function updateCategory(category: Category): Promise<void> {
  console.group('Update Category');
  console.log('Updating category:', category);
  try {
    await db.put('categories', category);
    console.log('Category updated successfully');
    console.groupEnd();
  } catch (error) {
    console.error('Failed to update category:', error);
    console.groupEnd();
    throw error;
  }
}

export async function updateVideoThumbnail(videoId: string, newThumbnail: File): Promise<void> {
  console.group('Update Video Thumbnail');
  try {
    await checkDB();
    
    // Get the existing video
    const video = await db.get('videos', videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Update the video with the new thumbnail
    await db.put('videos', {
      ...video,
      thumbnail: newThumbnail,
    });

    console.log('Thumbnail updated successfully');
  } catch (error) {
    console.error('Failed to update thumbnail:', error);
    throw error;
  } finally {
    console.groupEnd();
  }
}
