// src/components/Scene/classes/PerformanceMonitor.ts
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
interface Metric {
  memory: {
    drawCalls: number;
  };
  renderer: {
    triangles: number;
  };
}
export class PerformanceMonitor {
  private stats: Stats;
  private renderer: THREE.WebGLRenderer;
  private frameTime: number = 0;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private memoryUsage: {
    geometries: number;
    textures: number;
    drawCalls: number;
  } = {
    geometries: 0,
    textures: 0,
    drawCalls: 0,
  };

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(this.stats.dom);

    // Позиционируем Stats в правом верхнем углу
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '0px';
    this.stats.dom.style.right = '0px';
  }

  startFrame(): void {
    this.stats.begin();
  }

  endFrame(): void {
    this.stats.end();
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const info = this.renderer.info;
    const currentTime = performance.now();

    // Обновляем счетчик кадров
    this.frameCount++;
    this.frameTime += currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Обновляем метрики каждую секунду
    if (this.frameTime >= 1000) {
      this.memoryUsage = {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        drawCalls: info.render.calls,
      };

      // Сброс счетчиков
      this.frameTime = 0;
      this.frameCount = 0;
    }
  }

  getMetrics() {
    const info = this.renderer.info;
    return {
      fps: this.stats.showPanel(0),
      memory: {
        ...this.memoryUsage,
        programs: info.programs?.length ?? 0,
      },
      renderer: {
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines,
      },
      capabilities: {
        maxTextures: this.renderer.capabilities.maxTextures,
        maxVertexTextures: this.renderer.capabilities.maxVertexTextures,
        maxTextureSize: this.renderer.capabilities.maxTextureSize,
        precision: this.renderer.capabilities.precision,
      },
    };
  }

  // Анализ проблем производительности
  analyzePerformance() {
    const metrics = this.getMetrics();
    const issues = [];

    // if (metrics.fps < 30) {
    //   issues.push('Low FPS detected. Consider reducing scene complexity.');
    // }

    if (metrics.memory.drawCalls > 1000) {
      issues.push('High number of draw calls. Consider using mesh merging or instancing.');
    }

    if (metrics.memory.geometries > 1000) {
      issues.push('High number of geometries. Consider geometry instancing or pooling.');
    }

    if (metrics.renderer.triangles > 1000000) {
      issues.push('High triangle count. Consider using LOD or geometry simplification.');
    }

    return {
      metrics,
      issues,
      recommendations: this.getOptimizationRecommendations(metrics),
    };
  }

  private getOptimizationRecommendations(metrics: Metric) {
    const recommendations = [];

    // Рекомендации по оптимизации на основе метрик
    if (metrics.memory.drawCalls > 1000) {
      recommendations.push({
        type: 'draw-calls',
        title: 'Reduce Draw Calls',
        steps: [
          'Merge similar geometries',
          'Use geometry instancing',
          'Implement frustum culling',
          'Use texture atlasing',
        ],
      });
    }

    if (metrics.renderer.triangles > 1000000) {
      recommendations.push({
        type: 'geometry',
        title: 'Optimize Geometry',
        steps: [
          'Implement Level of Detail (LOD)',
          'Use geometry compression',
          'Remove invisible faces',
          'Optimize vertex count',
        ],
      });
    }

    return recommendations;
  }

  dispose(): void {
    if (this.stats.dom && this.stats.dom.parentElement) {
      this.stats.dom.parentElement.removeChild(this.stats.dom);
    }
  }
}
