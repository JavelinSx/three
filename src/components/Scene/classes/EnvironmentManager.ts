// src/components/Scene/classes/EnvironmentManager.ts
import { Scene, WebGLRenderer, PMREMGenerator, Texture, FloatType, EquirectangularReflectionMapping } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class EnvironmentManager {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private envMap: Texture | null = null;

  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
  }

  async loadEnvironment(path: string): Promise<void> {
    try {
      const pmremGenerator = new PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();

      const rgbeLoader = new RGBELoader().setDataType(FloatType);
      const hdrTexture = await rgbeLoader.loadAsync(path);
      hdrTexture.mapping = EquirectangularReflectionMapping;

      const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

      this.envMap = envMap;
      // this.scene.environment = envMap;
      // this.scene.background = envMap;

      // Cleanup
      hdrTexture.dispose();
      pmremGenerator.dispose();
    } catch (error) {
      console.error('Failed to load environment map:', error);
      throw error;
    }
  }

  public getEnvMap(): Texture | null {
    return this.envMap;
  }

  public cleanup(): void {
    if (this.envMap) {
      this.envMap.dispose();
      this.envMap = null;
    }
  }
}
