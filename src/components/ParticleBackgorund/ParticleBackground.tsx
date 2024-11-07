import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface LightGroup {
  sphere: THREE.Mesh;
  group: THREE.Group;
  position: THREE.Vector3;
}

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let frameId: number;
    const lightGroups: LightGroup[] = [];
    let shaderMaterial: THREE.ShaderMaterial;

    // Добавляем переменные для отслеживания мыши
    const mouse = new THREE.Vector3();
    const mousePos = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const vertexShader = `
      uniform vec3 mousePosition;
      uniform float mouseRadius;
      uniform float mouseStrength;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vPosition = position;
        vNormal = normalize(position);
        
        // Вычисляем расстояние до курсора
        vec3 dir = position - mousePosition;
        float distance = length(dir);
        
        // Применяем отталкивание если частица в радиусе действия курсора
        vec3 finalPosition = position;
        if (distance < mouseRadius) {
          float force = 1.0 - (distance / mouseRadius);
          force = pow(force, 2.0); // Делаем эффект более плавным
          finalPosition += normalize(dir) * force * mouseStrength;
        }
        
        vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = 2.5 * (1.0 / -mvPosition.z);
      }
    `;

    const fragmentShader = `
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      struct PointLight {
        vec3 position;
        vec3 color;
        float intensity;
      };
      
      uniform PointLight pointLights[3];
      
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;
        
        vec3 baseColor = vec3(1.0);
        vec3 finalColor = vec3(0.0);
        
        for(int i = 0; i < 3; i++) {
          vec3 lightDir = pointLights[i].position - vPosition;
          float distance = length(lightDir);
          lightDir = normalize(lightDir);
          
          float attenuation = 1.0 / (1.0 + 0.05 * distance + 0.01 * distance * distance);
          
          float diff = max(dot(vNormal, lightDir), 0.0);
          
          float ambient = 0.2;
          
          finalColor += baseColor * pointLights[i].color * 
                       (ambient + pointLights[i].intensity * diff * attenuation);
        }
        
        finalColor *= 2.0;
        finalColor = min(finalColor, vec3(1.0));
        gl_FragColor = vec4(finalColor, 0.7);
      }
    `;
    const onWindowResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    const init = () => {
      const lightColors: number[] = [0xffaa00, 0x0040ff, 0x80ff80];

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
      camera.position.set(0, 0, 0.8);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);

      // Создаем точки как обычно...
      const points = [];
      for (let i = 0; i < 200000; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * 1.5;

        points.push(
          new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi))
        );
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // Добавляем униформы для взаимодействия с мышью
      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          pointLights: {
            value: lightGroups.map((group, i) => ({
              position: group.position,
              color: new THREE.Color(lightColors[i]),
              intensity: 3.0,
            })),
          },
          mousePosition: { value: new THREE.Vector3(0, 0, 0) },
          mouseRadius: { value: 0.3 }, // Радиус действия курсора
          mouseStrength: { value: 0.1 }, // Сила отталкивания
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      });

      const pointCloud = new THREE.Points(geometry, shaderMaterial);
      scene.add(pointCloud);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    };

    const onMouseMove = (event: MouseEvent) => {
      // Преобразуем координаты мыши в нормализованные координаты устройства
      mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Обновляем луч
      raycaster.setFromCamera(mousePos, camera);

      // Находим точку в пространстве на определенном расстоянии от камеры
      const distance = camera.position.z - 0.5; // Расстояние от камеры
      const pos = new THREE.Vector3();
      pos.copy(raycaster.ray.direction);
      pos.multiplyScalar(distance);
      pos.add(camera.position);

      // Обновляем позицию мыши в шейдере
      if (shaderMaterial) {
        shaderMaterial.uniforms.mousePosition.value.copy(pos);
      }
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      const scale = 0.5;

      const positions = [
        [Math.sin(time * 0.7) * scale, Math.cos(time * 0.5) * scale, Math.cos(time * 0.3) * scale],
        [Math.cos(time * 0.3) * scale, Math.sin(time * 0.5) * scale, Math.sin(time * 0.7) * scale],
        [Math.sin(time * 0.7) * scale, Math.cos(time * 0.3) * scale, Math.sin(time * 0.5) * scale],
      ];

      positions.forEach((pos, i) => {
        lightGroups[i].group.position.set(pos[0], pos[1], pos[2]);
      });

      // Обновляем uniforms шейдера
      if (shaderMaterial) {
        shaderMaterial.uniforms.pointLights.value = lightGroups.map((group) => ({
          position: group.position,
          color: (group.sphere.material as THREE.MeshBasicMaterial).color,
          intensity: 3.0,
        }));
      }

      controls.update();
      renderer.render(scene, camera);
    };

    init();
    animate();

    // Добавляем обработчик движения мыши
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className='fixed top-0 left-0 w-full h-full -z-10' />;
}
