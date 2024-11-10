// src/components/ParticleBackground/classes/sceneSetup.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { vertexShader, fragmentShader } from '../shaders/shaders';
import { PostProcessing } from './PostProcessing';
import type { LightGroup, SceneObjects } from '../types/types';

export const LIGHT_COLORS = [0xff5500, 0x0055ff, 0x00aa00];

function createLightGroups(scene: THREE.Scene): LightGroup[] {
  return LIGHT_COLORS.map(() => {
    const group = new THREE.Group();
    const dummyGeometry = new THREE.BufferGeometry();
    const dummyMaterial = new THREE.Material();
    const sphere = new THREE.Mesh(dummyGeometry, dummyMaterial);
    sphere.visible = false;
    group.add(sphere);
    scene.add(group);
    return {
      sphere,
      group,
      position: group.position,
    };
  });
}

function createShaderMaterial(lightGroups: LightGroup[]): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      pointLights: {
        value: lightGroups.map((group, i) => ({
          position: group.position,
          color: new THREE.Color(LIGHT_COLORS[i]),
          intensity: 3.0,
        })),
      },
      mousePosition: { value: new THREE.Vector3(0, 0, 0) },
      mouseRadius: { value: 0.3 },
      mouseStrength: { value: 0.1 },
      time: { value: 0.0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    // Добавляем оптимизации для материала
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

function createPointCloud(material: THREE.ShaderMaterial): THREE.Points {
  const particleCount = 100000;
  const positions = new Float32Array(particleCount * 3);

  // Создаем буфер позиций
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random()) * 1.5;

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Оптимизация геометрии
  geometry.computeBoundingSphere();

  return new THREE.Points(geometry, material);
}

function setupControls(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): OrbitControls {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.rotateSpeed = 0.5;
  return controls;
}

export function createParticleSystem(container: HTMLDivElement): SceneObjects {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 0, 0.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'mediump', // Используем среднюю точность для лучшей производительности
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Отключаем автоочистку рендерера, так как EffectComposer сам управляет этим
  renderer.autoClear = false;

  container.appendChild(renderer.domElement);

  const lightGroups = createLightGroups(scene);
  const shaderMaterial = createShaderMaterial(lightGroups);
  const pointCloud = createPointCloud(shaderMaterial);
  scene.add(pointCloud);

  const controls = setupControls(camera, renderer);
  const postProcessing = new PostProcessing(renderer, scene, camera);

  let frameId: number;
  const animate = () => {
    frameId = requestAnimationFrame(animate);

    controls.update();
    postProcessing.render();
  };
  animate();

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    postProcessing.resize(width, height);
  };

  window.addEventListener('resize', handleResize);

  return {
    scene,
    camera,
    renderer,
    shaderMaterial,
    lightGroups,
    postProcessing,
    controls,
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      postProcessing.dispose();
    },
  };
}
