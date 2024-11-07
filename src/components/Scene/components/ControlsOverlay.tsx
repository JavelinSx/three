// src/components/Scene/components/ControlsOverlay.tsx
import React from 'react';

export const ControlsOverlay: React.FC = () => {
  return (
    <div className='absolute bottom-4 right-4 bg-black/50 p-4 rounded text-white'>
      <div className='space-y-2'>
        <p className='text-sm flex items-center'>
          <span className='mr-2'>🖱️</span>
          <span>Left click + drag to rotate</span>
        </p>
        <p className='text-sm flex items-center'>
          <span className='mr-2'>🖱️</span>
          <span>Right click + drag to pan</span>
        </p>
        <p className='text-sm flex items-center'>
          <span className='mr-2'>⚲</span>
          <span>Scroll to zoom</span>
        </p>
      </div>
    </div>
  );
};

export default ControlsOverlay;
