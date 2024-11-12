// src/components/Scene/index.tsx
import { useEffect, useRef, useState } from 'react';
import { useSceneSetup } from './hooks/useSceneSetup';
import { useModelCamera } from './hooks/useModelCamera';
import { useModelAnimations } from './hooks/useModelAnimations';
import { useModelLoading } from './hooks/useModelLoading';
import { useEnvironmentLoading } from './hooks/useEnvironmentLoading';
import { Clock } from 'three';
import type { AnimatedObject } from './types/scene.types';
import LoadingOverlay from './components/LoadingOverlay';
import AnimationControls from './components/AnimationControls';
import { CameraIcon } from '@heroicons/react/24/solid';

const MODEL_PATH = '/models/scene.gltf';
const HDR_PATH = '/models/world.hdr';

export default function Scene() {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const { containerRef, sceneSetupRef } = useSceneSetup();
  const { setupModelCamera, isModelCamera, toggleCamera } = useModelCamera(sceneSetupRef.current);
  const {
    setupAnimations,
    updateAnimations,
    playAnimations,
    pauseAnimations,
    resetAnimations,
    cleanup: cleanupAnimations,
    getAnimationInfo,
    isAnimating,
  } = useModelAnimations();

  const [cameraResult, setCameraResult] = useState<ReturnType<typeof setupModelCamera> | null>(null);
  console.log(cameraResult);
  const clockRef = useRef(new Clock());
  const frameIdRef = useRef<number>();

  // Scene initialization tracking
  useEffect(() => {
    if (sceneSetupRef.current) {
      console.log('Scene is initialized');
      setIsSceneReady(true);
    }
  }, [sceneSetupRef.current]);

  // Setup model
  useEffect(() => {
    const model = sceneSetupRef.current?.modelManager.getModel() as AnimatedObject;
    if (!model) return;

    // Настраиваем камеру из модели
    const result = setupModelCamera(model);
    setCameraResult(result);

    // Настраиваем анимации
    setupAnimations(model);

    return () => {
      cleanupAnimations();
    };
  }, [sceneSetupRef.current?.modelManager.getModel(), setupModelCamera, setupAnimations, cleanupAnimations]);

  // Animation render loop
  useEffect(() => {
    if (!sceneSetupRef.current || !isSceneReady) return;

    const { scene, camera, renderer } = sceneSetupRef.current;
    clockRef.current.start();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      updateAnimations(clockRef.current.getDelta());
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      clockRef.current.stop();
    };
  }, [isSceneReady, updateAnimations]);

  const {
    loading: modelLoading,
    progress,
    error: modelError,
  } = useModelLoading(isSceneReady ? sceneSetupRef.current : null, MODEL_PATH);

  const { loading: envLoading, error: envError } = useEnvironmentLoading(
    isSceneReady ? sceneSetupRef.current : null,
    HDR_PATH
  );

  const isLoading = !isSceneReady || modelLoading || envLoading;
  const error = modelError || envError;

  const { totalAnimations, maxDuration } = getAnimationInfo();

  return (
    <div ref={containerRef} className='w-full h-full relative'>
      <LoadingOverlay isLoading={isLoading} progress={progress} error={error} />
      {!isLoading && !error && (
        <>
          <AnimationControls
            onPlay={playAnimations}
            onPause={pauseAnimations}
            onReset={resetAnimations}
            duration={maxDuration * 1000}
          />
          <div className='absolute top-4 left-4 bg-black/50 p-4 rounded text-white space-y-2'>
            <p>Total Animations: {totalAnimations}</p>
            <p>Status: {isAnimating ? 'Playing' : 'Paused'}</p>
            <p>Max Duration: {maxDuration.toFixed(2)}s</p>
            <p>Camera: {isModelCamera ? 'Model' : 'Free'}</p>
            <button
              onClick={toggleCamera}
              className='flex items-center gap-2 px-3 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors'
            >
              <CameraIcon className='w-5 h-5' />
              <span>Toggle Camera Mode</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
