// src/components/Scene/types/model.types.ts
import { Material, Texture, BufferGeometry, Object3D } from 'three';

export interface LoadingCallbacks {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export interface LoadableObject extends Object3D {
  material?: Material | Material[];
  geometry?: BufferGeometry;
}

export interface MaterialWithTextures extends Material {
  map?: Texture | null;
  normalMap?: Texture | null;
  roughnessMap?: Texture | null;
  metalnessMap?: Texture | null;
  needsUpdate: boolean;
}
