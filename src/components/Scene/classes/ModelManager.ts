// src/components/Scene/classes/ModelManager.ts
import { Scene, Box3, Vector3, Object3D, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { QualityManager } from './QualityManager';

interface LoadingCallbacks {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export class ModelManager {
  private scene: Scene;
  private loader: GLTFLoader;
  private model: Object3D | null = null;
  private gltf: GLTF | null = null;
  private qualityManager: QualityManager;

  constructor(scene: Scene, renderer: WebGLRenderer, qualityManager: QualityManager) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.qualityManager = qualityManager;

    // Настройка Draco декодера
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.setDecoderConfig({
      type: 'js',
      threads: navigator.hardwareConcurrency || 4,
    });
    this.loader.setDRACOLoader(dracoLoader);
  }

  async loadModel(modelPath: string, callbacks?: LoadingCallbacks): Promise<void> {
    try {
      console.log('Starting model load from:', modelPath);

      const gltf = await this.loader.loadAsync(modelPath, (event: ProgressEvent) => {
        const percentComplete = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
        callbacks?.onProgress?.(percentComplete);
      });

      if (this.model) {
        this.cleanup();
      }

      this.gltf = gltf;
      this.model = gltf.scene;

      // Применяем улучшенные настройки качества
      if (this.model) {
        this.qualityManager.applyQualitySettings(this.model, {
          anisotropy: 16,
          textureFilter: 'linear',
          generateMipmaps: true,
          toneMapping: 'ACES',
          toneMappingExposure: 1.2,
          shadowMapEnabled: true,
          gammaCorrection: true,
          colorSpace: 'srgb',
        });
      }

      if (gltf.animations.length > 0) {
        this.model.animations = gltf.animations;
      }

      this.centerModel();

      if (this.model) {
        this.scene.add(this.model);
        callbacks?.onLoad?.();
      }
    } catch (error) {
      console.error('Error loading model:', error);
      const e = error instanceof Error ? error : new Error('Failed to load model');
      callbacks?.onError?.(e);
      throw e;
    }
  }

  private centerModel(): void {
    if (!this.model) return;

    const box = new Box3().setFromObject(this.model);
    const center = box.getCenter(new Vector3());

    this.model.position.sub(center);

    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 10) {
      const scale = 10 / maxDim;
      this.model.scale.multiplyScalar(scale);
    }
  }

  public getModel(): Object3D | null {
    return this.model;
  }

  public getAnimations() {
    return this.gltf?.animations || [];
  }

  public cleanup(): void {
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
    }
    this.gltf = null;
  }
}
