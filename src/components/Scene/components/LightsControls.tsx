// src/components/Scene/components/LightsControls.tsx
import React, { useState } from 'react';
import { Vector3 } from 'three';
import { Lights } from '../classes/Lights';

interface LightsControlsProps {
  lights: Lights;
}

export const LightsControls: React.FC<LightsControlsProps> = ({ lights }) => {
  const [showHelpers, setShowHelpers] = useState(false);
  const [settings, setSettings] = useState(lights.getSettings());

  const handleAmbientToggle = (enabled: boolean) => {
    lights.toggleAmbient(enabled);
    setSettings(lights.getSettings());
  };

  const handleDirectionalToggle = (enabled: boolean) => {
    lights.toggleDirectional(enabled);
    setSettings(lights.getSettings());
  };

  const handleModelEmissiveToggle = (enabled: boolean) => {
    lights.toggleModelEmissive(enabled);
    setSettings(lights.getSettings());
  };

  const handleAmbientIntensity = (intensity: number) => {
    lights.setAmbientIntensity(intensity);
    setSettings(lights.getSettings());
  };

  const handleDirectionalIntensity = (intensity: number) => {
    lights.setDirectionalIntensity(intensity);
    setSettings(lights.getSettings());
  };

  const handleModelEmissiveIntensity = (intensity: number) => {
    lights.setModelEmissiveIntensity(intensity);
    setSettings(lights.getSettings());
  };

  const handleDirectionalPosition = (axis: 'x' | 'y' | 'z', value: number) => {
    const position = new Vector3();
    position.copy(settings.directional.position);
    position[axis] = value;
    lights.setDirectionalPosition(position);
    setSettings(lights.getSettings());
  };

  const handleHelpersToggle = () => {
    const newShowHelpers = !showHelpers;
    setShowHelpers(newShowHelpers);
    lights.showHelper(newShowHelpers);
  };

  return (
    <div className='absolute top-4 right-4 bg-black/50 p-4 rounded text-white'>
      <h3 className='text-lg font-semibold mb-4'>Lighting Controls</h3>

      {/* Ambient Light Controls */}
      <div className='mb-4'>
        <h4 className='font-medium mb-2'>Ambient Light</h4>
        <div className='space-y-2'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={settings.ambient.enabled}
              onChange={(e) => handleAmbientToggle(e.target.checked)}
              className='mr-2'
            />
            Enabled
          </label>
          <div className='flex items-center'>
            <span className='mr-2'>Intensity:</span>
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={settings.ambient.intensity}
              onChange={(e) => handleAmbientIntensity(Number(e.target.value))}
              className='w-32'
            />
            <span className='ml-2'>{settings.ambient.intensity.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Directional Light Controls */}
      <div className='mb-4'>
        <h4 className='font-medium mb-2'>Directional Light</h4>
        <div className='space-y-2'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={settings.directional.enabled}
              onChange={(e) => handleDirectionalToggle(e.target.checked)}
              className='mr-2'
            />
            Enabled
          </label>
          <div className='flex items-center'>
            <span className='mr-2'>Intensity:</span>
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={settings.directional.intensity}
              onChange={(e) => handleDirectionalIntensity(Number(e.target.value))}
              className='w-32'
            />
            <span className='ml-2'>{settings.directional.intensity.toFixed(1)}</span>
          </div>

          {/* Position Controls */}
          <div className='space-y-1'>
            <div className='flex items-center'>
              <span className='mr-2 w-8'>X:</span>
              <input
                type='range'
                min='-10'
                max='10'
                step='0.5'
                value={settings.directional.position.x}
                onChange={(e) => handleDirectionalPosition('x', Number(e.target.value))}
                className='w-32'
              />
              <span className='ml-2'>{settings.directional.position.x.toFixed(1)}</span>
            </div>
            <div className='flex items-center'>
              <span className='mr-2 w-8'>Y:</span>
              <input
                type='range'
                min='-10'
                max='10'
                step='0.5'
                value={settings.directional.position.y}
                onChange={(e) => handleDirectionalPosition('y', Number(e.target.value))}
                className='w-32'
              />
              <span className='ml-2'>{settings.directional.position.y.toFixed(1)}</span>
            </div>
            <div className='flex items-center'>
              <span className='mr-2 w-8'>Z:</span>
              <input
                type='range'
                min='-10'
                max='10'
                step='0.5'
                value={settings.directional.position.z}
                onChange={(e) => handleDirectionalPosition('z', Number(e.target.value))}
                className='w-32'
              />
              <span className='ml-2'>{settings.directional.position.z.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='mb-4'>
        <h4 className='font-medium mb-2'>Model Emissive Light</h4>
        <div className='space-y-2'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={settings.modelEmissive.enabled}
              onChange={(e) => handleModelEmissiveToggle(e.target.checked)}
              className='mr-2'
            />
            Enabled
          </label>
          <div className='flex items-center'>
            <span className='mr-2'>Intensity:</span>
            <input
              type='range'
              min='0'
              max='2'
              step='0.1'
              value={settings.modelEmissive.intensity}
              onChange={(e) => handleModelEmissiveIntensity(Number(e.target.value))}
              className='w-32'
            />
            <span className='ml-2'>{settings.modelEmissive.intensity.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Helper Controls */}
      <div className='mb-4'>
        <h4 className='font-medium mb-2'>Debug Tools</h4>
        <label className='flex items-center'>
          <input type='checkbox' checked={showHelpers} onChange={() => handleHelpersToggle()} className='mr-2' />
          Show Light Helpers
        </label>
      </div>

      {/* Color Controls */}
      <div className='space-y-4'>
        <div>
          <h4 className='font-medium mb-2'>Light Colors</h4>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='block text-sm mb-1'>Ambient</label>
              <input
                type='color'
                value={`#${settings.ambient.color.toString(16).padStart(6, '0')}`}
                onChange={(e) => {
                  lights.setAmbientColor(parseInt(e.target.value.substring(1), 16));
                  setSettings(lights.getSettings());
                }}
                className='w-full h-8 rounded cursor-pointer'
              />
            </div>
            <div>
              <label className='block text-sm mb-1'>Directional</label>
              <input
                type='color'
                value={`#${settings.directional.color.toString(16).padStart(6, '0')}`}
                onChange={(e) => {
                  lights.setDirectionalColor(parseInt(e.target.value.substring(1), 16));
                  setSettings(lights.getSettings());
                }}
                className='w-full h-8 rounded cursor-pointer'
              />
            </div>
          </div>
        </div>

        <div>
          <label className='block text-sm mb-1'>Model Emissive Color</label>
          <input
            type='color'
            value={`#${settings.modelEmissive.color.toString(16).padStart(6, '0')}`}
            onChange={(e) => {
              lights.setModelEmissiveColor(parseInt(e.target.value.substring(1), 16));
              setSettings(lights.getSettings());
            }}
            className='w-full h-8 rounded cursor-pointer'
          />
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          const defaultSettings = {
            ambient: {
              enabled: true,
              intensity: 0.3,
              color: 0xfff5f9,
            },
            directional: {
              enabled: true,
              intensity: 0.5,
              color: 0xffffff,
              position: new Vector3(5, 5, 5),
              castShadow: true,
            },
            modelEmissive: {
              enabled: true,
              intensity: 1.0,
              color: 0xffffff,
            },
          };
          lights.updateSettings(defaultSettings);
          setSettings(lights.getSettings());
          setShowHelpers(false);
          lights.showHelper(false);
        }}
        className='mt-4 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition-colors'
      >
        Reset to Defaults
      </button>
    </div>
  );
};

export default LightsControls;
