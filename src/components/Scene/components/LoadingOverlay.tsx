// src/components/Scene/components/LoadingOverlay.tsx
interface LoadingOverlayProps {
  isLoading: boolean;
  progress: number; // теперь это значение от 0 до 100
  error: string | null;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, progress, error }) => {
  // Убеждаемся, что прогресс в допустимом диапазоне
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  if (error) {
    return (
      <div className='absolute inset-0 flex items-center justify-center bg-black/75'>
        <div className='bg-red-500/90 p-6 rounded-lg max-w-md text-white'>
          <h3 className='text-xl font-semibold mb-2'>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoading) return null;

  return (
    <div className='absolute inset-0 flex items-center justify-center bg-black/75'>
      <div className='text-center text-white'>
        <div className='mb-4'>
          <div className='w-16 h-16 border-4 border-t-white border-r-white/30 border-b-white/10 border-l-white/50 rounded-full animate-spin' />
        </div>
        <div className='space-y-2'>
          <p className='text-xl font-semibold'>Loading Scene</p>
          {normalizedProgress > 0 && (
            <div className='w-48 mx-auto'>
              <div className='bg-white/20 rounded-full h-2'>
                <div
                  className='bg-white rounded-full h-2 transition-all duration-300'
                  style={{ width: `${normalizedProgress}%` }}
                />
              </div>
              <p className='text-sm mt-2'>{Math.round(normalizedProgress)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
