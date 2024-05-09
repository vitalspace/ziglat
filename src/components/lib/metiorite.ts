import { ExtendedObject3D, THREE } from "enable3d";

class MeteoriteManager {
  scene: any;
  gltfLoader: any;
  meteor: any;
  rocks: any;
  dron: any;
  currentPointIndex: any;
  spotLight: any;
  spline: THREE.CatmullRomCurve3;
  points: THREE.Vector3[];
  constructor(scene: THREE.Scene, gltfLoader: any) {
    this.scene = scene;
    this.gltfLoader = gltfLoader;

    this.currentPointIndex = 0;

    this.points = [
      new THREE.Vector3(0, 0.1, 0.1),
      new THREE.Vector3(1.3, 0.2, 0),
      new THREE.Vector3(1.3, 0.2, 2),
      new THREE.Vector3(0, 0.2, 2.5),
      new THREE.Vector3(-2, 0.2, 2.5),
      new THREE.Vector3(-1, 0.4, 0),
    ];

    this.spline = new THREE.CatmullRomCurve3(this.points, true);
  }

  async loadMeteorite() {
    this.gltfLoader.load("assets/ziggies.glb", (gltf: { scenes: any[]; }) => {
      const scene = gltf.scenes[0];

      this.meteor = new ExtendedObject3D();
      this.meteor.name = "meteor";
      this.meteor.add(scene);
      this.meteor.position.set(-10, 0, 0);
      this.meteor.scale.set(5, 5, 5);

      // this.meteor.castShadow = true;
      // this.meteor.receiveShadow = true;

      this.scene.add(this.meteor);

      this.meteor.traverse((child: { castShadow: boolean; receiveShadow: boolean; name: string; }) => {
        child.castShadow = child.receiveShadow = true;
        if (child.name == "asteroide") this.rocks = child;

        if (child.name == "dron") {
          this.dron = child;
          this.dron.position.copy(this.points[this.currentPointIndex]);

          this.spotLight = new THREE.SpotLight(
            0xffffff,
            100,
            100,
            Math.PI / 4,
            1,
            5
          );
          this.spotLight.position.set(0, 0, 0);
          this.dron.add(this.spotLight);

          this.spotLight.shadow.bias = 0.0;
          this.spotLight.shadow.normalBias = 0.0;
        }
      });
    });
  }

  updatedRocksPosition() {
    if (this.rocks) {
      const initialY = -1; // Posición inicial en el eje Y
      const amplitude = 0.2;
      const time = Date.now() * 0.001; // Obtener el tiempo actual en segundos
      const deltaY = Math.sin(time) * amplitude; // Calcular el cambio en el eje Y usando la función seno
      this.rocks.position.y = initialY + deltaY;
    }
  }

  updatedDronPosition() {
    if (this.dron) {
      const t = (Date.now() % 10000) / 10000;
      const position = this.spline.getPointAt(t);
      this.dron.position.copy(position);

      const tangent = this.spline.getTangentAt(t).normalize();
      const angle = Math.atan2(tangent.z, tangent.x);
      this.dron.rotation.z = angle;
    }
  }
}

export { MeteoriteManager };
