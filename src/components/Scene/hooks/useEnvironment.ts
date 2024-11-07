// src/components/Scene/hooks/useEnvironmentLoading.ts
import { useState, useEffect } from 'react';
import type { SceneSetup } from '../types/scene.types';

export function useEnvironmentLoading(sceneSetup: SceneSetup | null, hdrPath: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sceneSetup) return;

    const { environmentManager } = sceneSetup;

    const loadEnvironment = async () => {
      try {
        await environmentManager.loadEnvironment(hdrPath);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load environment');
        setLoading(false);
      }
    };

    loadEnvironment();
  }, [sceneSetup, hdrPath]);

  return { loading, error };
}
