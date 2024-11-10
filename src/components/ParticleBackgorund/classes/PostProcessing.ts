// src/components/ParticleBackground/classes/postProcessing.ts
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

type FilmPassUniformValue = { value: number };

interface FilmPassUniforms {
  uniforms: {
    [key: string]: FilmPassUniformValue;
    nIntensity: FilmPassUniformValue;
    sIntensity: FilmPassUniformValue;
    sCount: FilmPassUniformValue;
    grayscale: FilmPassUniformValue;
  };
}

export class PostProcessing {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private filmPass: FilmPass & FilmPassUniforms;
  private fxaaPass: ShaderPass;
  private smaaPass: SMAAPass;
  private enabled = true;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    // Создаем отдельный буфер для рендера с пониженным разрешением
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth * 0.75, window.innerHeight * 0.75, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      encoding: THREE.sRGBEncoding,
    });

    this.composer = new EffectComposer(renderer, renderTarget);

    // Basic scene render
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Bloom effect с оптимизированными настройками
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth * 0.75, window.innerHeight * 0.75),
      1.5, // уменьшена интенсивность
      0.4, // уменьшен радиус
      0.85 // увеличен порог
    );
    this.bloomPass.renderToScreen = false;
    this.composer.addPass(this.bloomPass);

    // Film grain effect с оптимизированными настройками
    this.filmPass = new FilmPass(0.25) as FilmPass & FilmPassUniforms;
    this.filmPass.renderToScreen = false;
    this.composer.addPass(this.filmPass);

    // Инициализация униформ в следующем кадре
    requestAnimationFrame(() => {
      if (this.filmPass.uniforms) {
        this.filmPass.uniforms.sIntensity.value = 0.015; // уменьшена интенсивность
        this.filmPass.uniforms.sCount.value = 648;
        this.filmPass.uniforms.grayscale.value = 0;
      }
    });

    // Anti-aliasing с оптимизированными настройками
    this.fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio * 0.75);
    this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio * 0.75);
    this.fxaaPass.enabled = true;
    this.fxaaPass.renderToScreen = true;
    this.composer.addPass(this.fxaaPass);

    // SMAA только как fallback
    this.smaaPass = new SMAAPass(window.innerWidth * pixelRatio * 0.75, window.innerHeight * pixelRatio * 0.75);
    this.smaaPass.enabled = false;
    this.composer.addPass(this.smaaPass);
  }

  // Безопасная установка параметров film эффекта
  private setFilmParameter(uniformName: string, value: number): void {
    if (this.filmPass?.uniforms?.[uniformName]) {
      this.filmPass.uniforms[uniformName].value = value;
    }
  }

  public setFilmNoise(intensity: number): void {
    this.setFilmParameter('nIntensity', intensity);
  }

  public setFilmScanlines(intensity: number): void {
    this.setFilmParameter('sIntensity', intensity);
  }

  public setScanlineCount(count: number): void {
    this.setFilmParameter('sCount', count);
  }

  public setFilmEnabled(enabled: boolean): void {
    this.filmPass.enabled = enabled;
  }

  public setBloomIntensity(intensity: number): void {
    this.bloomPass.strength = intensity;
  }

  public setBloomRadius(radius: number): void {
    this.bloomPass.radius = radius;
  }

  public setBloomThreshold(threshold: number): void {
    this.bloomPass.threshold = threshold;
  }

  public toggleAntiAliasing(mode: 'none' | 'FXAA' | 'SMAA'): void {
    this.fxaaPass.enabled = mode === 'FXAA';
    this.smaaPass.enabled = mode === 'SMAA';
  }

  public resize(width: number, height: number): void {
    const w = width * 0.75;
    const h = height * 0.75;

    this.composer.setSize(w, h);
    const pixelRatio = this.composer.renderer.getPixelRatio();

    this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (w * pixelRatio);
    this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (h * pixelRatio);

    if (this.smaaPass) {
      const smaaTarget = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      });
      this.smaaPass.setSize(w, h);
    }
  }

  public render(): void {
    if (this.enabled) {
      this.composer.render();
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public dispose(): void {
    this.composer.dispose();
  }
}
