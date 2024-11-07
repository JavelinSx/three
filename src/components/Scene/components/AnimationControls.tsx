import React, { useState, useCallback, useEffect } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const AnimationControls = ({ onPlay = () => {}, onPause = () => {}, onReset = () => {}, duration = 5000 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);

  useEffect(() => {
    let animationFrame: number;

    const updateProgress = (timestamp: number) => {
      if (!startTime) {
        setStartTime(timestamp);
      }

      const effectiveStartTime = startTime || timestamp;
      const totalElapsed = timestamp - effectiveStartTime + pausedTime;
      const newProgress = Math.min(100, (totalElapsed / duration) * 100);

      setProgress(newProgress);

      if (newProgress < 100 && isPlaying) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else if (newProgress >= 100) {
        setIsPlaying(false);
        onPause();
      }
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, startTime, pausedTime, duration, onPause]);

  const handlePlay = useCallback(() => {
    if (!isPlaying) {
      if (progress >= 100) {
        // If animation completed, reset everything
        setPausedTime(0);
        setStartTime(null);
        setProgress(0);
      } else if (progress > 0) {
        // If resuming from pause, update pausedTime
        setPausedTime((progress / 100) * duration);
        setStartTime(null);
      }
      setIsPlaying(true);
      onPlay();
    }
  }, [isPlaying, progress, duration, onPlay]);

  const handlePause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      // Store current progress as pausedTime
      setPausedTime((progress / 100) * duration);
      onPause();
    }
  }, [isPlaying, progress, duration, onPause]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    setStartTime(null);
    setPausedTime(0);
    onReset();
  }, [onReset]);

  return (
    <div className='absolute bottom-4 left-4 bg-black/50 p-4 rounded text-white'>
      <div className='space-y-4'>
        <div className='flex items-center space-x-4'>
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className='p-2 hover:bg-white/20 rounded-full transition-colors'
              title='Play animation'
            >
              <PlayIcon className='w-6 h-6' />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className='p-2 hover:bg-white/20 rounded-full transition-colors'
              title='Pause animation'
            >
              <PauseIcon className='w-6 h-6' />
            </button>
          )}
          <button
            onClick={handleReset}
            className='p-2 hover:bg-white/20 rounded-full transition-colors'
            title='Reset animation'
          >
            <ArrowPathIcon className='w-6 h-6' />
          </button>
        </div>

        <div className='w-48'>
          <div className='bg-white/20 rounded-full h-2'>
            <div className='bg-white rounded-full h-2 transition-all duration-300' style={{ width: `${progress}%` }} />
          </div>
          <p className='text-sm mt-2 text-center'>{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;
