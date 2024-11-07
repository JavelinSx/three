export const vertexShader = /* glsl */ `
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vPosition = position;
    vNormal = normalize(position);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 2.0 * (1.0 / -mvPosition.z);
  }
`;

// src/components/ParticleBackground/shaders/fragment.glsl.ts
export const fragmentShader = `
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
      // Используем точную позицию из группы
      vec3 lightPos = pointLights[i].position;
      vec3 lightDir = normalize(lightPos - vPosition);
      float diff = max(dot(vNormal, lightDir), 0.0);
      
      float distance = length(lightPos - vPosition);
      float attenuation = 1.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);
      
      finalColor += baseColor * pointLights[i].color * pointLights[i].intensity * diff * attenuation;
    }
    
    finalColor += baseColor * 0.1;
    gl_FragColor = vec4(finalColor, 0.6);
  }
`;
