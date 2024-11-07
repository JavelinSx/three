// src/components/Scene/hooks/useModelCamera.ts
import { useCallback, useState } from 'react';
import { Object3D, PerspectiveCamera, Vector3, Euler } from 'three';
import type { SceneSetup } from '../types/scene.types';

type CameraWithProperties = {
  fov: number;
  aspect: number;
  position: Vector3;
  rotation: Euler;
  updateProjectionMatrix: () => void;
};

interface ModelCameraResult {
  camera: PerspectiveCamera | null;
  setupComplete: boolean;
  isModelCamera: boolean;
  toggleCamera: () => void;
}

export function useModelCamera(sceneSetup: SceneSetup | null) {
  const [isModelCamera, setIsModelCamera] = useState(true);
  const [modelCamera, setModelCamera] = useState<PerspectiveCamera | null>(null);
  const [defaultCamera, setDefaultCamera] = useState<PerspectiveCamera | null>(null);

  const toggleCamera = useCallback(() => {
    if (!sceneSetup || !defaultCamera) return;

    setIsModelCamera((prev) => {
      const newIsModelCamera = !prev;

      if (newIsModelCamera && modelCamera) {
        // Переключаемся на камеру модели
        sceneSetup.camera = modelCamera;
        sceneSetup.controls.setEnabled(false);
        console.log('Switched to model camera');
      } else {
        // Переключаемся на стандартную камеру
        sceneSetup.camera = defaultCamera;
        defaultCamera.position.set(0, 2, 5);
        defaultCamera.lookAt(0, 0, 0);
        sceneSetup.controls.setEnabled(true);
        console.log('Switched to default camera');
      }

      return newIsModelCamera;
    });
  }, [sceneSetup, defaultCamera, modelCamera]);

  const setupModelCamera = useCallback(
    (model: Object3D): ModelCameraResult => {
      console.log('Setting up model camera');
      let foundCamera: PerspectiveCamera | null = null;

      if (!sceneSetup) {
        return {
          camera: null,
          setupComplete: false,
          isModelCamera,
          toggleCamera,
        };
      }

      // Сохраняем стандартную камеру при первой инициализации
      if (!defaultCamera) {
        const newDefaultCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        newDefaultCamera.position.set(0, 2, 5);
        newDefaultCamera.lookAt(0, 0, 0);
        setDefaultCamera(newDefaultCamera);
      }

      // Поиск камеры в модели
      model.traverse((child: Object3D) => {
        const cameraCandidate = child as unknown as CameraWithProperties;
        if ('fov' in child && 'aspect' in child && 'updateProjectionMatrix' in child) {
          console.log('Found camera in model:', {
            name: child.name,
            fov: cameraCandidate.fov,
            position: cameraCandidate.position.toArray(),
            rotation: cameraCandidate.rotation.toArray(),
          });
          foundCamera = child as PerspectiveCamera;
        }
      });

      if (foundCamera) {
        try {
          // Настраиваем найденную камеру
          const camera = foundCamera as PerspectiveCamera;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          setModelCamera(camera);

          // Применяем камеру к сцене если используется камера модели
          if (isModelCamera) {
            sceneSetup.camera = camera;
            sceneSetup.controls.setEnabled(false);
            console.log('Model camera activated');
          }

          console.log('Model camera setup complete');
        } catch (error) {
          console.error('Error setting up camera:', error);
          return {
            camera: null,
            setupComplete: false,
            isModelCamera,
            toggleCamera,
          };
        }
      } else {
        console.warn('No perspective camera found in model, using default camera');
        setIsModelCamera(false);
        if (defaultCamera) {
          sceneSetup.camera = defaultCamera;
          sceneSetup.controls.setEnabled(true);
        }
      }

      return {
        camera: foundCamera,
        setupComplete: true,
        isModelCamera,
        toggleCamera,
      };
    },
    [sceneSetup, isModelCamera, defaultCamera, toggleCamera]
  );

  return {
    setupModelCamera,
    isModelCamera,
    toggleCamera,
  };
}
