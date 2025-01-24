import React, { useEffect, useRef, useState } from 'react';
import { X, Trash2, Calendar, Image } from 'lucide-react';
import { Video } from '../types';
import * as db from '../services/db';

interface VideoModalProps {
  video: Video;
  onClose: () => void;
  onDelete: (video: Video) => void;
}

export function VideoModal({ video, onClose, onDelete }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnail, setThumbnail] = useState<string>(video.thumbnail);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Create a new FormData instance
        const formData = new FormData();
        formData.set('thumbnail', file);
        
        // Update the video with the new thumbnail
        await db.updateVideoThumbnail(video.id, file);
        
        // Update the UI
        const newThumbnail = URL.createObjectURL(file);
        setThumbnail(newThumbnail);
      } catch (error) {
        console.error('Failed to update thumbnail:', error);
        alert('Failed to update thumbnail. Please try again.');
      }
    }
  };

  // Handle keyboard shortcuts for video control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ': // Space
        case 'k': // YouTube-style play/pause
          e.preventDefault();
          if (videoRef.current.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime += 10; // Forward 10 seconds
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime -= 10; // Backward 10 seconds
          break;
        case 'ArrowUp':
          e.preventDefault();
          videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          break;
        case 'f': // Fullscreen
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            videoRef.current.requestFullscreen();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#23252b] rounded-2xl w-[90vw] max-w-6xl flex flex-col sm:flex-row overflow-hidden shadow-2xl animate-scaleIn border border-gray-800">
        <div className="w-full sm:w-2/3 relative bg-gradient-to-b from-[#23252b] to-[#1b1c21] sm:border-r border-gray-800">
          <div className="absolute inset-0 bg-[#1b1c21]/50"></div>
          <div className="relative w-full h-full p-4">
            <div className="w-full h-[40vh] sm:h-full rounded-xl overflow-hidden bg-gradient-to-b from-[#23252b] to-[#1b1c21] border border-gray-800/50 shadow-lg">
              <video 
                ref={videoRef}
                src={video.videoUrl} 
                controls 
                poster={thumbnail}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        
        <div className="w-full sm:w-1/3 p-4 sm:p-8 bg-[#1b1c21] flex flex-col">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
                {video.title}
              </h2>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-full transition-colors mr-2"
              title="Change thumbnail"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this video?')) {
                  onDelete(video);
                }
              }}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              title="Delete video"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}