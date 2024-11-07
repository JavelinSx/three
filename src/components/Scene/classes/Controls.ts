// src/components/Scene/classes/Controls.ts
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera } from 'three';
import { IControls } from '../types/scene.types';

export class Controls implements IControls {
  private controls: OrbitControls;

  constructor(camera: Camera, domElement: HTMLElement) {
    this.controls = new OrbitControls(camera, domElement);
    this.setup();
  }

  private setup(): void {
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  public get enabled(): boolean {
    return this.controls.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }

  public update(): void {
    this.controls.update();
  }

  public getTarget() {
    return this.controls.target;
  }

  public setTarget(x: number, y: number, z: number): void {
    this.controls.target.set(x, y, z);
  }

  public cleanup(): void {
    this.controls.dispose();
  }
}
