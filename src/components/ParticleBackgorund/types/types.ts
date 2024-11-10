import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PostProcessing } from '../classes/PostProcessing';
export interface LightGroup {
  sphere: THREE.Mesh;
  group: THREE.Group;
  position: THREE.Vector3;
}

export interface SceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  shaderMaterial: THREE.ShaderMaterial;
  lightGroups: LightGroup[];
  postProcessing: PostProcessing;
  controls: OrbitControls;
  cleanup: () => void;
}
