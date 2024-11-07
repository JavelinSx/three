import * as THREE from 'three';
import Controls from '@/components/canvas/Controls';
import Lights from '@/components/canvas/Lights';
import type { SceneSetup } from '@/components/Scene/types';

export function setupScene(mountElement: HTMLDivElement): SceneSetup {
  // Create scene with base settings
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Setup camera
  const camera = new THREE.PerspectiveCamera(75, mountElement.clientWidth / mountElement.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  // Create renderer with optimal settings
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true,
    premultipliedAlpha: false,
  });

  // Base renderer settings
  renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Add canvas to page
  mountElement.appendChild(renderer.domElement);

  // Initialize controls and lights
  const controls = new Controls(camera, renderer.domElement);
  const lights = new Lights(scene);

  // Handle window resize
  const handleResize = () => {
    camera.aspect = mountElement.clientWidth / mountElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
  };

  window.addEventListener('resize', handleResize);

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);

    renderer.dispose();
    renderer.forceContextLoss();

    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }

    controls.cleanup();
    lights.cleanup();
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    lights,
    cleanup,
  };
}
