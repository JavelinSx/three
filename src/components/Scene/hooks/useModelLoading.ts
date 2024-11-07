// src/components/Scene/hooks/useModelLoading.ts
import { useState, useEffect } from 'react';
import type { SceneSetup } from '../types/scene.types';

export function useModelLoading(sceneSetup: SceneSetup | null, modelPath: string) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sceneSetup) {
      console.log('Model Loading: No scene setup yet');
      return;
    }

    const { modelManager } = sceneSetup;
    console.log('Starting model loading from:', modelPath);

    const loadModel = async () => {
      try {
        await modelManager.loadModel(modelPath, {
          onProgress: (progress) => {
            console.log('Model loading progress:', progress);
            setProgress(progress);
          },
          onLoad: () => {
            console.log('Model loaded successfully');
            setLoading(false);
          },
          onError: (error) => {
            console.error('Model loading error:', error);
            setError(error.message);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('Model loading caught error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load model');
        setLoading(false);
      }
    };

    loadModel();
  }, [sceneSetup, modelPath]);

  return { loading, progress, error };
}
