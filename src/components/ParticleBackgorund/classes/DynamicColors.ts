import { Color } from 'three';
export class DynamicColors {
  private colors: Color[];
  private hues: number[];
  private speeds: number[];

  constructor(count: number) {
    this.colors = Array(count)
      .fill(0)
      .map(() => new Color());
    this.hues = Array(count)
      .fill(0)
      .map((_, i) => i * (360 / count));
    this.speeds = Array(count)
      .fill(0)
      .map(() => Math.random() * 1.5 + 0.1);
    this.updateColors(0);
  }

  updateColors(deltaTime: number): Color[] {
    this.hues = this.hues.map((hue, i) => {
      // Обновляем оттенок для каждого цвета
      const newHue = (hue + this.speeds[i] * deltaTime * 100) % 360;
      // Преобразуем HSL в RGB
      this.colors[i].setHSL(
        newHue / 360, // Оттенок (0-1)
        0.8, // Насыщенность (0-1)
        0.6 // Яркость (0-1)
      );
      return newHue;
    });
    return this.colors;
  }

  getColors(): Color[] {
    return this.colors;
  }
}
