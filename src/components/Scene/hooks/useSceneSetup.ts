// src/components/Scene/hooks/useSceneSetup.ts
import { useRef, useEffect } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from 'three';
import { Controls } from '../classes/Controls';
import { Lights } from '../classes/Lights';
import { ModelManager } from '../classes/ModelManager';
import { EnvironmentManager } from '../classes/EnvironmentManager';
import { QualityManager } from '../classes/QualityManager';
import type { SceneSetup } from '../types/scene.types';

export function useSceneSetup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneSetupRef = useRef<SceneSetup | null>(null);

  useEffect(() => {
    const initScene = async () => {
      if (!containerRef.current || sceneSetupRef.current) return;

      console.log('Initializing scene...');

      try {
        // Create base scene
        const scene = new Scene();
        console.log('Scene created');

        // Setup camera
        const camera = new PerspectiveCamera(
          75,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 2, 5);
        console.log('Camera initialized');

        // Setup renderer
        const renderer = new WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });

        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.outputColorSpace = SRGBColorSpace;

        containerRef.current.appendChild(renderer.domElement);
        console.log('Renderer initialized');

        // Initialize managers and controls
        const controls = new Controls(camera, renderer.domElement);
        console.log('Controls initialized');

        const lights = new Lights(scene);
        console.log('Lights initialized');

        // Создаем QualityManager после инициализации рендерера
        const qualityManager = new QualityManager(renderer);
        console.log('Quality manager initialized');

        const modelManager = new ModelManager(scene, renderer, qualityManager);
        console.log('Model manager initialized');

        const environmentManager = new EnvironmentManager(scene, renderer);
        console.log('Environment manager initialized');

        // Create scene setup object
        const setup: SceneSetup = {
          scene,
          camera,
          renderer,
          controls,
          lights,
          modelManager,
          environmentManager,
          qualityManager,
        };

        // Store setup in ref
        sceneSetupRef.current = setup;
        console.log('Scene setup completed');

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current || !sceneSetupRef.current) return;

          const { camera, renderer } = sceneSetupRef.current;

          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
          camera.updateProjectionMatrix();

          renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          cleanup();
        };
      } catch (error) {
        console.error('Error initializing scene:', error);
        cleanup();
      }
    };

    const cleanup = () => {
      if (sceneSetupRef.current) {
        const { renderer, controls, lights, modelManager, environmentManager, qualityManager } = sceneSetupRef.current;

        controls.cleanup();
        lights.cleanup();
        modelManager.cleanup();
        environmentManager.cleanup();
        qualityManager.dispose();

        renderer.dispose();
        renderer.forceContextLoss();

        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }

        sceneSetupRef.current = null;
        console.log('Scene cleanup completed');
      }
    };

    initScene();
  }, []);

  return { containerRef, sceneSetupRef };
}
