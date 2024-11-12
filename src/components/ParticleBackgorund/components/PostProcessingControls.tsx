// src/components/ParticleBackground/components/PostProcessingControls.tsx
import React, { useState } from 'react';
import { PostProcessing } from '../classes/PostProcessing';

interface PostProcessingControlsProps {
  postProcessing: PostProcessing;
}

export default function PostProcessingControls({ postProcessing }: PostProcessingControlsProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className='fixed top-4 right-4 bg-black/50 p-4 rounded text-white z-50'>
      <button
        onClick={() => setShowControls(!showControls)}
        className='w-full mb-2 px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors'
      >
        {showControls ? 'Hide Effects Controls' : 'Show Effects Controls'}
      </button>

      {showControls && (
        <div className='space-y-4'>
          {/* Bloom Controls */}
          <div className='space-y-2'>
            <h3 className='font-semibold'>Bloom</h3>
            <div className='space-y-1'>
              <label className='block text-sm'>Strength</label>
              <input
                type='range'
                min='0'
                max='5'
                step='0.1'
                defaultValue='0'
                onChange={(e) => postProcessing.setBloomIntensity(parseFloat(e.target.value))}
                className='w-full'
              />
            </div>
            <div className='space-y-1'>
              <label className='block text-sm'>Radius</label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                defaultValue='0'
                onChange={(e) => postProcessing.setBloomRadius(parseFloat(e.target.value))}
                className='w-full'
              />
            </div>
            <div className='space-y-1'>
              <label className='block text-sm'>Threshold</label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                defaultValue='0'
                onChange={(e) => postProcessing.setBloomThreshold(parseFloat(e.target.value))}
                className='w-full'
              />
            </div>
          </div>

          {/* Film Effect Controls */}
          <div className='space-y-2'>
            <h3 className='font-semibold'>Film Effect</h3>
            <div className='mb-2'>
              <label className='inline-flex items-center'>
                <input
                  type='checkbox'
                  defaultChecked={false}
                  onChange={(e) => postProcessing.setFilmEnabled(e.target.checked)}
                  className='mr-2'
                />
                Enable Film Effect
              </label>
            </div>
            <div className='space-y-1'>
              <label className='block text-sm'>Noise Intensity</label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                defaultValue='0'
                onChange={(e) => postProcessing.setFilmNoise(parseFloat(e.target.value))}
                className='w-full'
              />
            </div>
            <div className='space-y-1'>
              <label className='block text-sm'>Scanline Intensity</label>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                defaultValue='0'
                onChange={(e) => postProcessing.setFilmScanlines(parseFloat(e.target.value))}
                className='w-full'
              />
            </div>
          </div>

          {/* Anti-aliasing Controls */}
          <div className='space-y-2'>
            <h3 className='font-semibold'>Anti-aliasing</h3>
            <select
              onChange={(e) => postProcessing.toggleAntiAliasing(e.target.value as 'none' | 'FXAA' | 'SMAA')}
              className='w-full bg-white/10 px-2 py-1 rounded'
              defaultValue='FXAA'
            >
              <option value='none'>None</option>
              <option value='FXAA'>FXAA</option>
              <option value='SMAA'>SMAA</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
