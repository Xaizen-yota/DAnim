import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import * as db from '../services/db';
import { Category } from '../types';

interface AddVideoModalProps {
  onClose: () => void;
  onVideoAdded: () => void;
}

export function AddVideoModal({ onClose, onVideoAdded }: AddVideoModalProps) {
  const [formData] = useState(() => new FormData());
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomThumbnail, setUseCustomThumbnail] = useState(false);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.group('AddVideoModal - Loading Categories');
        console.log('Fetching categories from database...');
        const cats = await db.getAllCategories();
        console.log(`Found ${cats.length} categories:`, cats);
        setCategories(cats);
        console.groupEnd();
      } catch (error) {
        console.group('AddVideoModal - Error');
        console.error('Failed to load categories:', error);
        console.groupEnd();
      }
    };

    console.log('AddVideoModal - Component Mounted');
    loadCategories();
  }, []);

  const generateThumbnail = (videoFile: File) => {
    const video = videoRef.current;
    if (!video) return;

    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadeddata = () => {
      video.currentTime = 1; // Seek to 1 second
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailFile = new File([blob], 'auto-thumbnail.jpg', { type: 'image/jpeg' });
          formData.set('thumbnail', thumbnailFile);
          setPreviewThumbnail(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.8);

      URL.revokeObjectURL(url);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      console.log('AddVideoModal - Already submitting, skipping');
      return;
    }

    console.group('AddVideoModal - Submitting Form');
    setIsSubmitting(true);

    try {
      const title = formData.get('title');
      const description = formData.get('description');
      const categoryId = formData.get('categoryId');
      const video = formData.get('video') as File | null;
      const thumbnail = formData.get('thumbnail') as File | null;

      console.log('Form Data:', {
        title,
        description,
        categoryId,
        videoName: video?.name,
        videoSize: video?.size,
        thumbnailName: thumbnail?.name,
        thumbnailSize: thumbnail?.size,
      });

      if (!title || !description || !categoryId || !video) {
        throw new Error('Missing required fields');
      }

      // If no thumbnail is provided, generate one from the video
      if (!thumbnail && !useCustomThumbnail) {
        generateThumbnail(video);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for thumbnail generation
      }

      console.log('Adding video to database...');
      await db.addVideo(formData);
      console.log('Video added successfully!');
      onVideoAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add video:', error);
      alert(error instanceof Error ? error.message : 'Failed to add video. Please try again.');
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  if (categories.length === 0) {
    console.log('AddVideoModal - No categories available');
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-[#23252b] rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Add Video</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-200 text-center">
              Please create at least one category before adding videos.
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-[#23252b] rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Add Video</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-[#1b1c21] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => {
                    console.log('Setting title:', e.target.value);
                    formData.set('title', e.target.value);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Description</label>
                <textarea
                  required
                  className="w-full px-3 py-2 bg-[#1b1c21] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  onChange={(e) => {
                    console.log('Setting description:', e.target.value.length, 'characters');
                    formData.set('description', e.target.value);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Category</label>
                <select
                  required
                  className="w-full px-3 py-2 bg-[#1b1c21] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => {
                    const category = categories.find(c => c.id === e.target.value);
                    console.log('Selected category:', category?.name);
                    formData.set('categoryId', e.target.value);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-200">Thumbnail</label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useCustomThumbnail}
                      onChange={(e) => setUseCustomThumbnail(e.target.checked)}
                      className="rounded border-gray-700 bg-[#1b1c21] text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-300">Use custom thumbnail</span>
                  </label>
                </div>
                {useCustomThumbnail && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Selected thumbnail:', {
                          name: file.name,
                          size: (file.size / 1024).toFixed(2) + ' KB',
                          type: file.type
                        });
                        formData.set('thumbnail', file);
                        setPreviewThumbnail(URL.createObjectURL(file));
                      }
                    }}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                  />
                )}
                {previewThumbnail && (
                  <div className="mt-2">
                    <img
                      src={previewThumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Video File</label>
                <input
                  type="file"
                  required
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('Selected video:', {
                        name: file.name,
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                        type: file.type
                      });
                      formData.set('video', file);
                      if (!useCustomThumbnail) {
                        generateThumbnail(file);
                      }
                    }
                  }}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />
              </div>

              <div className="flex justify-end space-x-3">
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
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </div>
          </form>

          {/* Hidden video element for thumbnail generation */}
          <video ref={videoRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}