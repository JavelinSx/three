// src/components/Scene/types/scene.types.ts
import { Scene, PerspectiveCamera, WebGLRenderer, AnimationClip, Object3D, Vector3, Euler } from 'three';
import { Controls } from '../classes/Controls';
import { Lights } from '../classes/Lights';
import { ModelManager } from '../classes/ModelManager';
import { EnvironmentManager } from '../classes/EnvironmentManager';
import { QualityManager } from '../classes/QualityManager';

export interface SceneSetup {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: Controls;
  lights: Lights;
  modelManager: ModelManager;
  environmentManager: EnvironmentManager;
  qualityManager: QualityManager;
}

export interface SceneState {
  loading: boolean;
  progress: number;
  error: string | null;
}

export interface AnimatedObject extends Object3D {
  animations: AnimationClip[];
}

export interface IControls {
  enabled: boolean;
  setEnabled(enabled: boolean): void;
  update(): void;
  cleanup(): void;
}

export interface CameraProperties {
  fov: number;
  aspect: number;
  position: Vector3;
  rotation: Euler;
  updateProjectionMatrix: () => void;
}

export interface ModelCameraResult {
  camera: PerspectiveCamera | null;
  setupComplete: boolean;
}
