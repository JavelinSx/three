// src/components/Scene/classes/QualityManager.ts
import {
  Mesh,
  Material,
  Object3D,
  WebGLRenderer,
  ACESFilmicToneMapping,
  ReinhardToneMapping,
  LinearToneMapping,
  CineonToneMapping,
  NoToneMapping,
  Texture,
  LinearFilter,
  NearestFilter,
  RepeatWrapping,
  ClampToEdgeWrapping,
  PMREMGenerator,
  WebGLRenderTarget,
  ToneMapping,
  SRGBColorSpace,
  LinearSRGBColorSpace,
} from 'three';

interface QualitySettings {
  anisotropy: number;
  textureFilter: 'linear' | 'nearest';
  textureWrapping: 'repeat' | 'clamp';
  generateMipmaps: boolean;
  toneMapping: 'ACES' | 'reinhard' | 'linear' | 'cineon' | 'none';
  toneMappingExposure: number;
  shadowMapEnabled: boolean;
  gammaCorrection: boolean;
  colorSpace: 'srgb' | 'linear-srgb';
}

type ToneMappingType = 'ACES' | 'reinhard' | 'linear' | 'cineon' | 'none';

export class QualityManager {
  private renderer: WebGLRenderer;
  private maxAnisotropy: number;
  private pmremGenerator: PMREMGenerator;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    this.pmremGenerator = new PMREMGenerator(renderer);
  }

  // Применить настройки качества к модели
  public applyQualitySettings(model: Object3D, settings: Partial<QualitySettings> = {}): void {
    const defaultSettings: QualitySettings = {
      anisotropy: this.maxAnisotropy,
      textureFilter: 'linear',
      textureWrapping: 'repeat',
      generateMipmaps: true,
      toneMapping: 'ACES',
      toneMappingExposure: 1.0,
      shadowMapEnabled: true,
      gammaCorrection: true,
      colorSpace: 'srgb',
    };

    const finalSettings = { ...defaultSettings, ...settings };

    // Настройка рендерера
    this.setupRenderer(finalSettings);

    // Обработка материалов и текстур модели
    model.traverse((object) => {
      if (object instanceof Mesh) {
        this.optimizeMesh(object, finalSettings);
      }
    });
  }

  private setupRenderer(settings: QualitySettings): void {
    // Настройка тонмаппинга
    this.renderer.toneMapping = this.getToneMappingType(settings.toneMapping);
    this.renderer.toneMappingExposure = settings.toneMappingExposure;

    // Настройка теней
    this.renderer.shadowMap.enabled = settings.shadowMapEnabled;

    // Настройка цветового пространства
    this.renderer.outputColorSpace = settings.colorSpace === 'srgb' ? SRGBColorSpace : LinearSRGBColorSpace;
  }

  private optimizeMesh(mesh: Mesh, settings: QualitySettings): void {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => this.optimizeMaterial(material, settings));
    } else if (mesh.material) {
      this.optimizeMaterial(mesh.material, settings);
    }
  }

  private optimizeMaterial(material: Material, settings: QualitySettings): void {
    // Оптимизация всех текстур материала
    const textureProperties = [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'aoMap',
      'emissiveMap',
      'displacementMap',
      'alphaMap',
    ];

    textureProperties.forEach((prop) => {
      if (prop in material && (material as any)[prop]) {
        this.optimizeTexture((material as any)[prop], settings);
      }
    });
  }

  private optimizeTexture(texture: Texture, settings: QualitySettings): void {
    // Установка анизотропной фильтрации
    texture.anisotropy = settings.anisotropy;

    // Настройка фильтрации текстур
    const filter = settings.textureFilter === 'linear' ? LinearFilter : NearestFilter;
    texture.minFilter = filter;
    texture.magFilter = filter;

    // Настройка повторения текстур
    const wrapping = settings.textureWrapping === 'repeat' ? RepeatWrapping : ClampToEdgeWrapping;
    texture.wrapS = wrapping;
    texture.wrapT = wrapping;

    // Генерация мипмапов
    texture.generateMipmaps = settings.generateMipmaps;

    // Обновление текстуры
    texture.needsUpdate = true;
  }

  private getToneMappingType(type: ToneMappingType): ToneMapping {
    switch (type) {
      case 'ACES':
        return ACESFilmicToneMapping;
      case 'reinhard':
        return ReinhardToneMapping;
      case 'linear':
        return LinearToneMapping;
      case 'cineon':
        return CineonToneMapping;
      case 'none':
        return NoToneMapping;
      default:
        return ACESFilmicToneMapping;
    }
  }

  // Создание кубических текстур для отражений
  public generateEnvironmentMap(texture: Texture): WebGLRenderTarget {
    return this.pmremGenerator.fromEquirectangular(texture);
  }

  // Очистка ресурсов
  public dispose(): void {
    this.pmremGenerator.dispose();
  }
}
