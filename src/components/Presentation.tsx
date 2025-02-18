import { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
const audioFile = 'love-story.mp3';

type PresentationProps = {
  photos: Array<{
    id: string;
    path: string;
    title: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
};

export function Presentation({ photos, isOpen, onClose }: PresentationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audio] = useState(() => {
    const source = document.createElement('source');
    const audioElement = new Audio();
    audioElement.loop = true;
    audioElement.volume = isMuted ? 0 : 0.5;
    audioElement.preload = 'auto';
    source.src = audioFile;
    source.type = `audio/mpeg`; // Important!
    audioElement.appendChild(source)
    audioElement.onerror = () => setAudioError(true);
    return audioElement;
  });

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  }, [photos.length]);

  useEffect(() => {
    let slideInterval: number;

    console.log(audio)
    if (isPlaying) {
        console.log("PLAYED")
      slideInterval = window.setInterval(goToNext, 3000);
      audio.play().then(()=>{
        console.log("PLAYED BROO")
      }).catch(error => {
        console.error('Error playing audio:', error);
        setAudioError(true);
      });
    } else {
        audio.pause();
    }

    return () => {
      clearInterval(slideInterval);
      audio.pause();
    };
  }, [isPlaying, goToNext, audio]);

  useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : 0.5;
    }
  }, [isMuted, audio]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={photos[currentIndex].path}
          alt={photos[currentIndex].title}
          className="max-h-screen max-w-full object-contain"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? photos.length - 1 : prev - 1
                )
              }
              className="text-white hover:text-blue-400 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <span className="text-white">
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              onClick={goToNext}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}