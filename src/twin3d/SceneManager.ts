import * as THREE from 'three';
import { ThemeDefinition } from '../theme/types';

export class SceneManager {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  private groundPlane: THREE.Mesh;
  private gridHelper: THREE.GridHelper | null = null;
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private keyLight!: THREE.DirectionalLight;

  constructor(container: HTMLDivElement, initialTheme?: ThemeDefinition) {
    this.scene = new THREE.Scene();
    const bgHex = initialTheme ? initialTheme.colors.twinBg : 0x080a0d;
    this.scene.background = new THREE.Color(bgHex);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(4.8, 3.8, 5.2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.groundPlane = this.setupGround(initialTheme);
  }

  private setupLighting(): void {
    this.ambientLight = new THREE.AmbientLight(0xfff8f0, 1.4);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xfffcf5, 0x1e2229, 0.85);
    this.hemiLight.position.set(0, 20, 0);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    this.keyLight.position.set(6, 9, 7);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.camera.left = -4.5;
    this.keyLight.shadow.camera.right = 4.5;
    this.keyLight.shadow.camera.top = 4.5;
    this.keyLight.shadow.camera.bottom = -4.5;
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.radius = 2.5;
    this.scene.add(this.keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.9);
    fillLight.position.set(-7, 5, -5);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef3c7, 1.2);
    rimLight.position.set(0, 8, -6);
    this.scene.add(rimLight);
  }

  private setupGround(theme?: ThemeDefinition): THREE.Mesh {
    const groundColor = theme ? theme.colors.twinGround : 0x0c0f14;
    const grid1 = theme ? theme.colors.twinGridPrimary : 0x242a33;
    const grid2 = theme ? theme.colors.twinGridSecondary : 0x141820;

    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: groundColor,
      roughness: 0.92,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.gridHelper = new THREE.GridHelper(24, 24, grid1, grid2);
    this.gridHelper.position.y = 0.005;
    this.scene.add(this.gridHelper);

    return ground;
  }

  public updateTheme(themeDef: ThemeDefinition): void {
    if (this.scene) {
      this.scene.background = new THREE.Color(themeDef.colors.twinBg);
    }
    if (this.groundPlane) {
      (this.groundPlane.material as THREE.MeshStandardMaterial).color.setHex(themeDef.colors.twinGround);
    }
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper.dispose();
      this.gridHelper = new THREE.GridHelper(
        24,
        24,
        themeDef.colors.twinGridPrimary,
        themeDef.colors.twinGridSecondary
      );
      this.gridHelper.position.y = 0.005;
      this.scene.add(this.gridHelper);
    }

    if (!themeDef.isDark) {
      this.ambientLight.intensity = 1.8;
      this.renderer.toneMappingExposure = 1.1;
    } else {
      this.ambientLight.intensity = 1.4;
      this.renderer.toneMappingExposure = 1.25;
    }
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
