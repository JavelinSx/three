// src/components/ParticleBackground/shaders/shaders.ts
export const vertexShader = `
  uniform vec3 mousePosition;
  uniform float mouseRadius;
  uniform float mouseStrength;
  uniform float time;
  
  struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
  };
  
  uniform PointLight pointLights[3];
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  vec3 calculateGravityEffect(vec3 particlePos, vec3 sourcePos, float intensity) {
    vec3 direction = sourcePos - particlePos;
    float distance = length(direction);
    float gravityRadius = 1.0;
    float gravityStrength = 0.2;
    
    if (distance < gravityRadius) {
      float force = (1.0 - distance / gravityRadius);
      force = pow(force, 1.0) * gravityStrength * intensity;
      return normalize(direction) * force;
    }
    return vec3(0.0);
  }
  
  vec3 addTurbulence(vec3 pos, float time) {
    float speed = 0.01;
    float scale = 0.5;
    return vec3(
      sin(pos.x * 2.0 + time * speed) * scale,
      cos(pos.y * 2.0 + time * speed) * scale,
      sin(pos.z * 2.0 + time * speed) * scale
    ) * 0.04;
  }
  
  void main() {
    vPosition = position;
    vNormal = normalize(position);
    
    vec3 finalPosition = position;
    
    for(int i = 0; i < 3; i++) {
      finalPosition += calculateGravityEffect(position, pointLights[i].position, pointLights[i].intensity);
    }
    
    finalPosition += addTurbulence(position, time);
    
    vec3 mouseDir = position - mousePosition;
    float mouseDistance = length(mouseDir);
    
    if (mouseDistance < mouseRadius) {
      float force = 1.0 - (mouseDistance / mouseRadius);
      force = pow(force, 2.0);
      finalPosition += normalize(mouseDir) * force * mouseStrength;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 2.5 * (1.0 / -mvPosition.z);
  }
`;

export const fragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
  };
  
  uniform PointLight pointLights[3];
  
  vec3 sphereRefraction(vec3 lightDir, vec3 normal, float ior) {
    float cosI = dot(normal, lightDir);
    float cosT2 = 1.0 - ior * ior * (1.0 - cosI * cosI);
    if (cosT2 > 0.0) {
      return ior * lightDir - (ior * cosI + sqrt(cosT2)) * normal;
    }
    return reflect(lightDir, normal);
  }
  
  float fresnel(vec3 viewDir, vec3 normal, float ior) {
    float cosTheta = dot(viewDir, normal);
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    float r0 = (1.0 - ior) / (1.0 + ior);
    r0 = r0 * r0;
    if(sinTheta == 0.0) return r0;
    return r0 + (1.0 - r0) * pow(1.0 - cosTheta, 5.0);
  }
  
  void main() {
    vec2 center = gl_PointCoord * 2.0 - 1.0;
    float dist = length(center);
    if (dist > 1.0) discard;
    
    vec3 normal;
    normal.xy = center * sqrt(1.0 - dist * dist);
    normal.z = sqrt(1.0 - normal.x * normal.x - normal.y * normal.y);
    normal = normalize(normal);
    
    vec3 viewDir = normalize(vViewPosition);
    vec3 baseColor = vec3(0.2, 0.3, 0.4);
    vec3 finalColor = vec3(0.0);
    float totalIllumination = 0.0;
    
    float ior = 1.5;
    float absorption = 0.1;
    float dispersive = 0.02;
    
    for(int i = 0; i < 3; i++) {
      vec3 lightDir = normalize(pointLights[i].position - vPosition);
      float distance = length(pointLights[i].position - vPosition);
      
      vec3 refractionR = sphereRefraction(lightDir, normal, ior - dispersive);
      vec3 refractionG = sphereRefraction(lightDir, normal, ior);
      vec3 refractionB = sphereRefraction(lightDir, normal, ior + dispersive);
      
      float internalPathR = abs(dot(refractionR, normal));
      float internalPathG = abs(dot(refractionG, normal));
      float internalPathB = abs(dot(refractionB, normal));
      
      vec3 attenuation = vec3(
        exp(-absorption * internalPathR * distance),
        exp(-absorption * internalPathG * distance),
        exp(-absorption * internalPathB * distance)
      );
      
      float fresnelTerm = fresnel(viewDir, normal, ior);
      
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      
      vec3 lightContribution = pointLights[i].color * pointLights[i].intensity * (
        (1.0 - fresnelTerm) * vec3(
          dot(refractionR, viewDir),
          dot(refractionG, viewDir),
          dot(refractionB, viewDir)
        ) * attenuation +
        fresnelTerm * spec
      );
      
      float causticIntensity = pow(max(0.0, dot(refractionG, viewDir)), 8.0);
      lightContribution += pointLights[i].color * causticIntensity * 2.0;
      
      finalColor += lightContribution;
      totalIllumination += length(lightContribution);
    }
    
    float visibilityThreshold = 0.1;
    if (totalIllumination < visibilityThreshold) {
      discard;
    }
    
    float scattering = pow(1.0 - dist, 2.0) * 0.2;
    finalColor += baseColor * scattering * totalIllumination;
    
    float alpha = smoothstep(visibilityThreshold, 0.5, totalIllumination);
    alpha *= (0.8 + (1.0 - dist * dist) * 0.2);
    
    finalColor = min(finalColor * 2.0, vec3(1.0));
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;
