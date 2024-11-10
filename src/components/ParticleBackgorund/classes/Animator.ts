// src/components/ParticleBackground/classes/animator.ts
import * as THREE from 'three';
import type { SceneObjects } from '../types/types';

export const LIGHT_COLORS = [
  0xff5500, // More saturated orange
  0x0055ff, // More saturated blue
  0x00aa00, // More saturated green
];

export class Animator {
  private sceneObjects: SceneObjects;
  private frameId: number | null = null;
  private rotationSpeed: THREE.Vector3;
  private particleSystem: THREE.Points | null = null;
  private time: number = 0;

  constructor(sceneObjects: SceneObjects) {
    this.sceneObjects = sceneObjects;
    this.rotationSpeed = new THREE.Vector3(0.0002, 0.0001, 0.0003);

    this.sceneObjects.scene.traverse((object) => {
      if (object instanceof THREE.Points) {
        this.particleSystem = object;
      }
    });

    this.animate = this.animate.bind(this);
  }

  start() {
    this.animate();
  }

  stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private animate() {
    this.frameId = requestAnimationFrame(this.animate);

    this.time += 0.016;

    if (this.sceneObjects.shaderMaterial) {
      this.sceneObjects.shaderMaterial.uniforms.time.value = this.time;
    }

    if (this.particleSystem) {
      this.particleSystem.rotation.x += this.rotationSpeed.x;
      this.particleSystem.rotation.y += this.rotationSpeed.y;
      this.particleSystem.rotation.z += this.rotationSpeed.z;
    }

    const positions = [
      [Math.sin(this.time * 0.7) * 0.5, Math.cos(this.time * 0.5) * 0.5, Math.cos(this.time * 0.3) * 0.5],
      [Math.cos(this.time * 0.3) * 0.5, Math.sin(this.time * 0.5) * 0.5, Math.sin(this.time * 0.7) * 0.5],
      [Math.sin(this.time * 0.7) * 0.5, Math.cos(this.time * 0.3) * 0.5, Math.sin(this.time * 0.5) * 0.5],
    ];

    positions.forEach((pos, i) => {
      this.sceneObjects.lightGroups[i].group.position.set(pos[0], pos[1], pos[2]);
    });

    if (this.sceneObjects.shaderMaterial) {
      this.sceneObjects.shaderMaterial.uniforms.pointLights.value = this.sceneObjects.lightGroups.map(
        (group, index) => ({
          position: group.position,
          color: new THREE.Color(LIGHT_COLORS[index]),
          intensity: 3.0,
        })
      );
    }

    // Используем EffectComposer вместо прямого рендера
    this.sceneObjects.postProcessing.render();
  }

  setRotationSpeed(x: number, y: number, z: number) {
    this.rotationSpeed.set(x, y, z);
  }

  getRotationSpeed() {
    return this.rotationSpeed.clone();
  }

  stopRotation() {
    this.rotationSpeed.set(0, 0, 0);
  }

  startRotation() {
    this.rotationSpeed.set(0.0002, 0.0001, 0.0003);
  }
}
