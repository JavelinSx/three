// declare module 'three/examples/jsm/controls/OrbitControls' {
//   import { Camera, MOUSE, TOUCH, Vector3 } from 'three';

//   export class OrbitControls {
//     constructor(camera: Camera, domElement: HTMLElement);

//     enabled: boolean;
//     target: Vector3;

//     minDistance: number;
//     maxDistance: number;

//     minZoom: number;
//     maxZoom: number;

//     minPolarAngle: number;
//     maxPolarAngle: number;

//     minAzimuthAngle: number;
//     maxAzimuthAngle: number;

//     enableDamping: boolean;
//     dampingFactor: number;

//     enableZoom: boolean;
//     zoomSpeed: number;

//     enableRotate: boolean;
//     rotateSpeed: number;

//     enablePan: boolean;
//     panSpeed: number;
//     screenSpacePanning: boolean;
//     keyPanSpeed: number;

//     autoRotate: boolean;
//     autoRotateSpeed: number;

//     enableKeys: boolean;

//     keys: {
//       LEFT: string;
//       UP: string;
//       RIGHT: string;
//       BOTTOM: string;
//     };

//     mouseButtons: {
//       LEFT: MOUSE;
//       MIDDLE: MOUSE;
//       RIGHT: MOUSE;
//     };

//     touches: {
//       ONE: TOUCH;
//       TWO: TOUCH;
//     };

//     update(): boolean;
//     dispose(): void;
//   }
// }

// declare module 'three/examples/jsm/loaders/GLTFLoader' {
//   import { Loader, LoadingManager } from 'three';

//   export interface GLTF {
//     animations: Array<any>;
//     scene: THREE.Scene;
//     scenes: Array<THREE.Scene>;
//     cameras: Array<THREE.Camera>;
//     asset: object;
//   }

//   export class GLTFLoader extends Loader {
//     constructor(manager?: LoadingManager);
//     load(
//       url: string,
//       onLoad: (gltf: GLTF) => void,
//       onProgress?: (event: ProgressEvent) => void,
//       onError?: (event: ErrorEvent) => void
//     ): void;
//     parse(
//       data: ArrayBuffer | string,
//       path: string,
//       onLoad: (gltf: GLTF) => void,
//       onError?: (event: ErrorEvent) => void
//     ): void;
//   }

//   export class DRACOLoader {
//     constructor(manager?: LoadingManager);
//     setDecoderPath(path: string): this;
//     setDecoderConfig(config: object): this;
//     setWorkerLimit(workerLimit: number): this;
//     preload(): void;
//     dispose(): void;
//   }
// }

// declare module 'three/examples/jsm/loaders/RGBELoader' {
//   import { DataTexture, LoadingManager } from 'three';

//   export class RGBELoader {
//     constructor(manager?: LoadingManager);
//     load(
//       url: string,
//       onLoad: (texture: DataTexture) => void,
//       onProgress?: (event: ProgressEvent) => void,
//       onError?: (event: ErrorEvent) => void
//     ): void;
//     loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<DataTexture>;
//     setDataType(type: number): this;
//     setPath(path: string): this;
//   }
// }
