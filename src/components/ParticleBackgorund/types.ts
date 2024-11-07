// src/components/ParticleBackground/types.ts
import * as THREE from 'three';
export interface PointLightUniforms {
  position: THREE.Vector3;
  color: THREE.Color;
  intensity: number;
}

export interface ParticleShaderUniforms {
  pointLights: {
    value: PointLightUniforms[];
  };
}
