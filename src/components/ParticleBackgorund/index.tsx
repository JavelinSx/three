// src/components/ParticleBackground/index.tsx
import { useEffect, useRef, useState } from 'react';
import { createParticleSystem } from './classes/SceneSetup';
import { MouseHandler } from './classes/MouseHandler';
import { Animator } from './classes/Animator';
import PostProcessingControls from './components/PostProcessingControls';
import type { SceneObjects } from './types/types';

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sceneObjects, setSceneObjects] = useState<SceneObjects | null>(null);
  const animatorRef = useRef<Animator | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const objects = createParticleSystem(containerRef.current);
    setSceneObjects(objects);
    const mouseHandler = new MouseHandler(objects);
    const animator = new Animator(objects);
    animatorRef.current = animator;

    const onWindowResize = () => {
      const { camera, renderer } = objects;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      objects.postProcessing.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', mouseHandler.handleMouseMove);
    window.addEventListener('resize', onWindowResize);

    animator.start();

    return () => {
      window.removeEventListener('mousemove', mouseHandler.handleMouseMove);
      window.removeEventListener('resize', onWindowResize);
      animator.stop();
      objects.cleanup();
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className='fixed top-0 left-0 w-full h-full -z-10' />
      {sceneObjects && <PostProcessingControls postProcessing={sceneObjects.postProcessing} />}
      <button
        onClick={() => {
          if (animatorRef.current) {
            setIsRotating(!isRotating);
            if (isRotating) {
              animatorRef.current.stopRotation();
            } else {
              animatorRef.current.startRotation();
            }
          }
        }}
        className='fixed bottom-4 right-4 px-4 py-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors z-50'
      >
        {isRotating ? 'Stop Rotation' : 'Start Rotation'}
      </button>
    </>
  );
}
