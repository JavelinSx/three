// src/components/ParticleBackground/classes/PostProcessing.ts
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

// Определяем тип для униформ
interface IUniform<T> {
  value: T;
}

interface FilmPassUniforms {
  uniforms: {
    nIntensity: IUniform<number>;
    sIntensity: IUniform<number>;
    sCount: IUniform<number>;
    grayscale: IUniform<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: IUniform<any>;
  };
}

// Расширяем тип FilmPass
type TypedFilmPass = FilmPass & FilmPassUniforms;

export class PostProcessing {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private filmPass: FilmPass;
  private fxaaPass: ShaderPass;
  private smaaPass: SMAAPass;
  private enabled = true;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    // Создаем отдельный буфер для рендера с пониженным разрешением
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      samples: 4, // MSAA для улучшения качества
    });

    this.composer = new EffectComposer(renderer, renderTarget);

    // Basic scene render
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Bloom effect с оптимизированными настройками
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.4, 1.0);
    this.bloomPass.renderToScreen = false;
    this.composer.addPass(this.bloomPass);

    // Film grain effect - инициализация с базовыми параметрами
    this.filmPass = new FilmPass(0.0, false) as TypedFilmPass;

    // // Установка дополнительных параметров через униформы
    // if (this.filmPass.uniforms) {
    //   this.filmPass.uniforms.sCount.value = 648;
    //   this.filmPass.uniforms.grayscale.value = false;
    // }

    this.filmPass.renderToScreen = false;
    this.composer.addPass(this.filmPass);

    // Anti-aliasing FXAA
    this.fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();

    if (this.fxaaPass.material.uniforms) {
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio * 0.75);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio * 0.75);
    }

    this.fxaaPass.enabled = true;
    this.fxaaPass.renderToScreen = true;
    this.composer.addPass(this.fxaaPass);

    // SMAA как альтернативный метод сглаживания
    this.smaaPass = new SMAAPass(window.innerWidth * pixelRatio * 0.75, window.innerHeight * pixelRatio * 0.75);
    this.smaaPass.enabled = false;
    this.composer.addPass(this.smaaPass);
  }

  public setFilmNoise(intensity: number): void {
    const filmPass = this.filmPass as TypedFilmPass;
    if (filmPass?.uniforms) {
      filmPass.uniforms['nIntensity'].value = intensity;
    }
  }

  public setFilmScanlines(intensity: number): void {
    const filmPass = this.filmPass as TypedFilmPass;
    if (filmPass?.uniforms) {
      filmPass.uniforms['sIntensity'].value = intensity;
    }
  }

  public setScanlineCount(count: number): void {
    const filmPass = this.filmPass as TypedFilmPass;
    if (filmPass?.uniforms) {
      filmPass.uniforms['sCount'].value = count;
    }
  }

  public setFilmGrayscale(enabled: boolean): void {
    const filmPass = this.filmPass as TypedFilmPass;
    if (filmPass?.uniforms) {
      filmPass.uniforms['grayscale'].value = enabled;
    }
  }

  public setFilmEnabled(enabled: boolean): void {
    if (this.filmPass) {
      this.filmPass.enabled = enabled;
    }
  }

  public setBloomIntensity(intensity: number): void {
    if (this.bloomPass) {
      this.bloomPass.strength = intensity;
    }
  }

  public setBloomRadius(radius: number): void {
    if (this.bloomPass) {
      this.bloomPass.radius = radius;
    }
  }

  public setBloomThreshold(threshold: number): void {
    if (this.bloomPass) {
      this.bloomPass.threshold = threshold;
    }
  }

  public toggleAntiAliasing(mode: 'none' | 'SMAA'): void {
    if (this.fxaaPass && this.smaaPass) {
      // this.fxaaPass.enabled = mode === 'FXAA';
      this.smaaPass.enabled = mode === 'SMAA';
    }
  }

  public resize(width: number, height: number): void {
    if (!this.composer) return;

    const w = width;
    const h = height;

    this.composer.setSize(w, h);

    if (this.fxaaPass && this.fxaaPass.material.uniforms) {
      const pixelRatio = this.composer.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (w * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (h * pixelRatio);
    }

    if (this.smaaPass) {
      this.smaaPass.setSize(w, h);
    }
  }

  public render(): void {
    if (this.enabled && this.composer) {
      this.composer.render();
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public dispose(): void {
    if (this.composer) {
      this.composer.dispose();
    }
  }
}
