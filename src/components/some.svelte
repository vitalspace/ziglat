<script>
  //  const { Project, Scene3D, PhysicsLoader, THREE } = ENABLE3D
  import { Project, Scene3D, PhysicsLoader, THREE } from "enable3d";

  class MainScene extends Scene3D {
    // box: any;
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
    }

    async create() {
      console.log("create");

      // set up scene (light, ground, grid, sky, orbitControls)
      this.warpSpeed("-sky", "-orbitControls");

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

      // position camera
      this.camera.position.set(0, 10, 20);

      // blue box
      this.box = this.add.box({ y: 2 }, { lambert: { color: "deepskyblue" } });

      // pink box
      this.physics.add.box({ y: 10 }, { lambert: { color: "hotpink" } });

      // green sphere
      const geometry = new THREE.SphereGeometry(0.8, 16, 16);
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0.2, 3, 0);
      this.scene.add(cube);
      // add physics to an existing object
      this.physics.add.existing(cube);
    }

    update() {
      this.box.rotation.x += 0.01;
      this.box.rotation.y += 0.01;
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

  //   const WIDTH = window.innerWidth;
  //   const HEIGHT = !("ontouchstart" in window)
  //     ? (window.innerHeight / 5) * 3
  //     : window.innerHeight - 200;
  //   const destination = document.getElementById("welcome-game");
  //   if (destination) {
  //     destination.style.height = `${HEIGHT}px`;
  //     destination.appendChild(project.canvas);

  //     project.canvas.style.marginTop = "0px !important";

  //     const resize = () => {
  //       const newWidth = window.innerWidth;
  //       const newHeight = (HEIGHT / WIDTH) * newWidth;

  //       destination.style.width = `${newWidth}px`;
  //       destination.style.height = `${newHeight}px`;

  //       project.renderer.setSize(newWidth, newHeight);
  //       project.camera.aspect = newWidth / newHeight;
  //       project.camera.updateProjectionMatrix();
  //     };

  //     window.onresize = resize;
  //     resize();
  //   }
</script>

<div id="welcome-game" class="border-2 border-red-400">
  <div id="welcome-game-placeholder">
    <div id="welcome-game-placeholder-loader"><div class="loader"></div></div>
    <div id="welcome-game-placeholder-image"></div>
  </div>
</div>

<!-- <script>
    const WIDTH = window.innerWidth
    const HEIGHT = !('ontouchstart' in window) ? (window.innerHeight / 5) * 3 : window.innerHeight - 200
    document.getElementById('welcome-game').style.height = `${HEIGHT}px`
  </script> -->

<style>
  #welcome-game {
    overflow: hidden;
  }
  #welcome-game-placeholder {
    width: 100%;
    height: 100%;
  }
  #welcome-game-placeholder-loader {
    position: absolute;
    left: 50%;
  }
  #welcome-game-placeholder-image {
    width: 100%;
    height: 100%;
    background-image: url("/img/welcome-game-screenshot.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    filter: blur(4px);
    cursor: pointer;
  }
</style>
