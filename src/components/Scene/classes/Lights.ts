// src/components/Scene/classes/Lights.ts
import {
  Scene,
  AmbientLight,
  DirectionalLight,
  DirectionalLightHelper,
  Object3D,
  Material,
  MeshStandardMaterial,
  Color,
  Vector3,
  SpotLight,
  PointLight,
  HemisphereLight,
} from 'three';

interface LightSettings {
  ambient: {
    enabled: boolean;
    intensity: number;
    color: number | string;
  };
  directional: {
    enabled: boolean;
    intensity: number;
    color: number | string;
    position: Vector3;
    castShadow: boolean;
  };
  modelEmissive: {
    enabled: boolean;
    intensity: number;
    color: number | string;
  };
}

export class Lights {
  private scene: Scene;
  private ambient: AmbientLight;
  private directional: DirectionalLight;
  private hemisphere: HemisphereLight;
  private helper?: DirectionalLightHelper;

  private settings: LightSettings = {
    ambient: {
      enabled: true,
      intensity: 0.3,
      color: 0xfff5f9,
    },
    directional: {
      enabled: true,
      intensity: 0.5,
      color: 0xffffff,
      position: new Vector3(5, 5, 5),
      castShadow: true,
    },
    modelEmissive: {
      enabled: true,
      intensity: 1.0,
      color: 0xffffff,
    },
  };

  constructor(scene: Scene) {
    this.scene = scene;

    // Создаем основной свет
    this.ambient = new AmbientLight(this.settings.ambient.color, this.settings.ambient.intensity);

    // Направленный свет
    this.directional = new DirectionalLight(this.settings.directional.color, this.settings.directional.intensity);

    // Полусферический свет для более естественного освещения
    this.hemisphere = new HemisphereLight(0xffffff, 0x444444, 0.5);

    this.setup();
  }

  private setup(): void {
    // Настройка направленного света
    this.directional.position.copy(this.settings.directional.position);
    this.directional.castShadow = this.settings.directional.castShadow;

    // Улучшенные настройки теней
    if (this.directional.castShadow) {
      this.directional.shadow.mapSize.width = 2048;
      this.directional.shadow.mapSize.height = 2048;
      this.directional.shadow.camera.near = 0.5;
      this.directional.shadow.camera.far = 500;
      this.directional.shadow.bias = -0.0001;
    }

    // Добавляем все источники света в сцену
    this.updateLights();
  }

  // Обновление видимости и параметров всех источников света
  private updateLights(): void {
    // Ambient Light
    if (this.settings.ambient.enabled) {
      this.scene.add(this.ambient);
    } else {
      this.scene.remove(this.ambient);
    }

    // Directional Light
    if (this.settings.directional.enabled) {
      this.scene.add(this.directional);
    } else {
      this.scene.remove(this.directional);
    }

    // Hemisphere Light
    this.scene.add(this.hemisphere);
  }

  // Метод для управления запеченным светом в модели
  public updateModelLighting(model: Object3D): void {
    model.traverse((object: Object3D) => {
      if ('material' in object) {
        const obj = object as any;
        if (obj.material && obj.material instanceof MeshStandardMaterial) {
          const material = obj.material as MeshStandardMaterial;

          // Управление эмиссией
          if (this.settings.modelEmissive.enabled) {
            material.emissive = new Color(this.settings.modelEmissive.color);
            material.emissiveIntensity = this.settings.modelEmissive.intensity;
          } else {
            material.emissiveIntensity = 0;
          }

          // Обновляем материал
          material.needsUpdate = true;
        }
      }
    });
  }

  // Методы управления настройками освещения
  public updateSettings(newSettings: Partial<LightSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    // Обновляем ambient light
    this.ambient.color.set(this.settings.ambient.color);
    this.ambient.intensity = this.settings.ambient.intensity;

    // Обновляем directional light
    this.directional.color.set(this.settings.directional.color);
    this.directional.intensity = this.settings.directional.intensity;
    this.directional.position.copy(this.settings.directional.position);
    this.directional.castShadow = this.settings.directional.castShadow;

    // Обновляем видимость источников света
    this.updateLights();

    // Обновляем helper если он есть
    if (this.helper) {
      this.helper.update();
    }
  }

  // Включение/выключение отдельных источников света
  public toggleAmbient(enabled: boolean): void {
    this.settings.ambient.enabled = enabled;
    this.updateLights();
  }

  public toggleDirectional(enabled: boolean): void {
    this.settings.directional.enabled = enabled;
    this.updateLights();
  }

  public toggleModelEmissive(enabled: boolean): void {
    this.settings.modelEmissive.enabled = enabled;
    if (this.scene) {
      const model = this.scene.getObjectByName('model');
      if (model) {
        this.updateModelLighting(model);
      }
    }
  }

  // Управление интенсивностью
  public setAmbientIntensity(intensity: number): void {
    this.settings.ambient.intensity = intensity;
    this.ambient.intensity = intensity;
  }

  public setDirectionalIntensity(intensity: number): void {
    this.settings.directional.intensity = intensity;
    this.directional.intensity = intensity;
  }

  public setModelEmissiveIntensity(intensity: number): void {
    this.settings.modelEmissive.intensity = intensity;
    if (this.scene) {
      const model = this.scene.getObjectByName('model');
      if (model) {
        this.updateModelLighting(model);
      }
    }
  }

  // Управление позицией направленного света
  public setDirectionalPosition(position: Vector3): void {
    this.settings.directional.position.copy(position);
    this.directional.position.copy(position);
    if (this.helper) {
      this.helper.update();
    }
  }

  // Управление цветом
  public setAmbientColor(color: number | string): void {
    this.settings.ambient.color = color;
    this.ambient.color.set(color);
  }

  public setDirectionalColor(color: number | string): void {
    this.settings.directional.color = color;
    this.directional.color.set(color);
  }

  public setModelEmissiveColor(color: number | string): void {
    this.settings.modelEmissive.color = color;
    if (this.scene) {
      const model = this.scene.getObjectByName('model');
      if (model) {
        this.updateModelLighting(model);
      }
    }
  }

  // Включение/выключение теней
  public toggleShadows(enabled: boolean): void {
    this.settings.directional.castShadow = enabled;
    this.directional.castShadow = enabled;
  }

  // Управление помощником
  public showHelper(show: boolean): void {
    if (show && !this.helper) {
      this.helper = new DirectionalLightHelper(this.directional);
      this.scene.add(this.helper);
    } else if (!show && this.helper) {
      this.scene.remove(this.helper);
      this.helper = undefined;
    }
  }

  // Очистка
  public cleanup(): void {
    if (this.helper) {
      this.scene.remove(this.helper);
    }
    this.scene.remove(this.ambient);
    this.scene.remove(this.directional);
    this.scene.remove(this.hemisphere);
  }

  // Получение текущих настроек
  public getSettings(): LightSettings {
    return { ...this.settings };
  }
}
