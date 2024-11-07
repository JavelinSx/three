// src/components/Scene/hooks/useEnvironmentLoading.ts
import { useState, useEffect } from 'react';
import type { SceneSetup } from '../types/scene.types';

export function useEnvironmentLoading(sceneSetup: SceneSetup | null, hdrPath: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sceneSetup) {
      console.log('Environment Loading: No scene setup yet');
      return;
    }

    console.log('Starting environment loading from:', hdrPath);
    const { environmentManager } = sceneSetup;

    const loadEnvironment = async () => {
      try {
        await environmentManager.loadEnvironment(hdrPath);
        console.log('Environment loaded successfully');
        setLoading(false);
      } catch (error) {
        console.error('Environment loading error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load environment');
        setLoading(false);
      }
    };

    loadEnvironment();
  }, [sceneSetup, hdrPath]);

  return { loading, error };
}
