import * as THREE from 'three';
import type { SceneObjects } from '../types/types';

export class MouseHandler {
  private mousePos: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private sceneObjects: SceneObjects;

  constructor(sceneObjects: SceneObjects) {
    this.mousePos = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.sceneObjects = sceneObjects;

    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  handleMouseMove(event: MouseEvent) {
    this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mousePos, this.sceneObjects.camera);

    const distance = this.sceneObjects.camera.position.z - 1.5;
    const pos = new THREE.Vector3();
    pos.copy(this.raycaster.ray.direction);
    pos.multiplyScalar(distance);
    pos.add(this.sceneObjects.camera.position);

    if (this.sceneObjects.shaderMaterial) {
      this.sceneObjects.shaderMaterial.uniforms.mousePosition.value.copy(pos);
    }
  }
}
