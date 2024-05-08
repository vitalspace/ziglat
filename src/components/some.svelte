<script>
  //  const { Project, Scene3D, PhysicsLoader, THREE } = ENABLE3D
  import {
    Project,
    Scene3D,
    PhysicsLoader,
    THREE,
    ExtendedObject3D,
  } from "enable3d";

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
    }

    async preload() {
      console.log("preload");
      await this.load.preload("ziggies", "assets/ziggies.glb");
    }

    async create() {
      console.log("create");
      this.currentPointIndex = 0;

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

      const addZiggies = async () => {
        const object = await this.load.gltf("ziggies");
        const scene = object.scenes[0];

        this.ziggie = new ExtendedObject3D();
        this.ziggie.name = "ziggie";
        this.ziggie.add(scene);

        this.ziggie.position.set(-10, 0, 0);
        // this.ziggie.rotation.set(0, 5, 0)
        this.ziggie.scale.set(5, 5, 5);

        this.ziggie.castShadow = true;
        this.ziggie.receiveShadow = true;

        this.add.existing(this.ziggie);

        this.ziggie.traverse((child) => {
          // console.log(child.name);
          child.castShadow = child.receiveShadow = true;
          if (child.name == "asteroide") this.rocks = child;

          // console.log(child.name)

          if (child.name == "dron") {
            this.cb = child;
            this.cb.position.copy(this.points[this.currentPointIndex]);

            this.spotLight = new THREE.SpotLight(
              0xffffff,
              100,
              100,
              Math.PI / 4,
              1,
              5
            ); // Color blanco, intensidad 1, distancia 100, ángulo 45 grados, penumbra 1, decay 1
            this.spotLight.position.set(0, 0, 0);
            // spotLight.target.position.set(0, 0, 0); // Ajusta el objetivo según sea necesario
            this.cb.add(this.spotLight);
            // this.lights.helper.pointLightHelper(this.spotLight);

            this.spotLight.shadow.bias = 0.0;
            this.spotLight.shadow.normalBias = 0.0;
          }
        });
      };
      addZiggies();
    }

    update() {
      const initialY = -1; // Posición inicial en el eje Y
      const amplitude = 0.2;
      const time = Date.now() * 0.001; // Obtener el tiempo actual en segundos
      const deltaY = Math.sin(time) * amplitude; // Calcular el cambio en el eje Y usando la función seno

      if (this.rocks) {
        this.rocks.position.y = initialY + deltaY;
      }

      if (this.cb) {
        const t = (Date.now() % 10000) / 10000;
        const position = this.spline.getPointAt(t);
        this.cb.position.copy(position);

        // Calcular la tangente de la curva en el punto actual
        const tangent = this.spline.getTangentAt(t).normalize();

        // Calcular el ángulo de rotación en el eje Y necesario para mirar hacia el siguiente punto
        // Asumiendo que la dirección hacia adelante es a lo largo del eje X
        const angle = Math.atan2(tangent.z, tangent.x);

        // Aplicar la rotación en el eje Y
        this.cb.rotation.z = angle;

        // this.spotLight.target. = angle
      }

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
