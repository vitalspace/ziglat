<script>
  //  const { Project, Scene3D, PhysicsLoader, THREE } = ENABLE3D
  import { PhysicsLoader, Project, Scene3D } from "enable3d";
  import * as THREE from "three";
  import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

  import { MeteoriteManager } from "./lib/metiorite";

  class MainScene extends Scene3D {
    // cb: any;
    // currentPointIndex: number;
    constructor() {
      super({ key: "MainScene" });
    }

    async init() {
      console.log("init");

      this.renderer.setPixelRatio(1);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      const dLoader = new DRACOLoader();
      dLoader.setDecoderPath(
        "https://www.gstatic.com/draco/versioned/decoders/1.5.5/"
      );
      dLoader.setDecoderConfig({ type: "js" });

      // Instantiate GLTFLoader and associate DRACOLoader with it
      this.gltfLoader = new GLTFLoader();
      this.gltfLoader.setDRACOLoader(dLoader);

      this.meteoriteManager = new MeteoriteManager(this.scene, this.gltfLoader);
      await this.meteoriteManager.loadMeteorite();
    }

    async preload() {
      console.log("preload");
    }

    async create() {
      console.log("create");

      // set up scene (light, ground, grid, sky, orbitControls)
      this.warpSpeed("-sky", "-orbitControls", "-ground", "-sky");

      const resize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        this.renderer.setSize(newWidth, newHeight);
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
      };

      window.onresize = resize;
      resize();

      // enable physics debug
      //   this.physics.debug?.enable();

      this.points = [
        new THREE.Vector3(0, 0.1, 0.1),
        new THREE.Vector3(1.3, 0.2, 0),
        new THREE.Vector3(1.3, 0.2, 2),
        new THREE.Vector3(0, 0.2, 2.5),
        new THREE.Vector3(-2, 0.2, 2.5),
        new THREE.Vector3(-1, 0.4, 0),
      ];

      this.spline = new THREE.CatmullRomCurve3(this.points, true);

      // position camera
      this.camera.position.set(0, 10, 20);

      this.stars = [];

      const createStars = () => {
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        for (let i = 0; i < 100; i++) {
          const starSize = Math.random() * 0.5 + 0.1; // Tamaños de estrellas aleatorios entre 0.1 y 0.6
          const starGeometry = new THREE.SphereGeometry(starSize, 32, 32);
          const star = new THREE.Mesh(starGeometry, starMaterial);

          // Posicionar las estrellas aleatoriamente en el espacio
          star.position.set(
            Math.random() * 100 - 50,
            Math.random() * 100 - 50,
            Math.random() * 100 - 50
          );

          // Asignar velocidad de rotación y movimiento aleatorios
          star.rotationSpeed = Math.random() * 0.01 + 0.005;
          star.movementSpeed = Math.random() * 0.01 + 0.005;

          this.scene.add(star);

          // Añadir la estrella a la escena
          //
          this.stars.push(star);
        }
      };

      createStars();
    }

    update() {
      this.meteoriteManager.updatedDronPosition();
      this.meteoriteManager.updatedRocksPosition();

      if (this.stars.length > 0) {
        this.stars.forEach((star) => {
          // Actualizar la rotación de la estrella
          star.rotation.y += star.rotationSpeed;

          // Calcular el nuevo movimiento de la estrella
          const newX =
            star.position.x + Math.sin(star.movementSpeed) * star.movementSpeed;
          const newZ =
            star.position.z + Math.cos(star.movementSpeed) * star.movementSpeed;

          // Verificar si la estrella ha alcanzado un límite en el eje X
          if (newX > 50 || newX < -50) {
            // Invertir la dirección de movimiento en el eje X
            star.movementSpeed *= -1;
          }

          // Verificar si la estrella ha alcanzado un límite en el eje Z
          if (newZ > 50 || newZ < -50) {
            // Invertir la dirección de movimiento en el eje Z
            star.movementSpeed *= -1;
          }

          // Actualizar la posición de la estrella
          star.position.x = newX;
          star.position.z = newZ;
        });
      }
    }
  }

  PhysicsLoader(
    "/lib/ammo/kripken",
    () =>
      new Project({
        scenes: [MainScene],
        antialias: true,
        alpha: true,
        parent: "welcome-game",
      })
  );
</script>

<div id="welcome-game" class="overflow-hidden">
  <div class="absolute flex justify-around w-full h-full place-items-center">
    <div></div>
    <div class="flex flex-col gap-4 font-serif">
      <h1 class="text-9xl text-[#F8A41C] drop-shadow-lg">Zig lang</h1>
      <h2 class="text-3xl text-white">Comunidad en español</h2>
    </div>
  </div>
</div>
