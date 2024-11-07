// src/components/Scene/hooks/useRenderLoop.ts
import { useRef, useEffect } from 'react';
import type { SceneSetup } from '../types/scene.types';

export function useRenderLoop(sceneSetup: SceneSetup | null) {
  const frameIdRef = useRef<number>();

  useEffect(() => {
    if (!sceneSetup) return;

    const { scene, camera, renderer, controls } = sceneSetup;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [sceneSetup]);
}
