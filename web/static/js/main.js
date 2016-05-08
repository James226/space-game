import controls from './controls'
import ChunkManager from './chunk-manager'

export class Game {

constructor() {
    this.container = document.getElementById('game-container');

    //var playerHub = window["$"].connection.playerHub;

    //playerHub.client.receive = message => {
    //    console.log(message);
    //};

    //window["$"].connection.hub.start().done(() => {
    //    playerHub.server.send("Testing");
    //});

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.scene.add(new THREE.AmbientLight(0x444444));
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(this.container.clientWidth / this.container.clientHeight);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500);
    this.camera.position.z = 10;
    this.camera.position.y = 10;
    this.camera.position.x = -10;

    this.camera.rotation.x = -0.7;
    this.camera.rotation.y = -0.7;

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(.5, 1, 0);
    this.scene.add(directionalLight);

    this.camControls = new controls(this.camera);
    this.camControls.lookSpeed = 0.4;
    this.camControls.movementSpeed = 20;
    this.camControls.noFly = true;
    this.camControls.lookVertical = true;
    this.camControls.constrainVertical = false;
    this.camControls.verticalMin = 1.0;
    this.camControls.verticalMax = 2.0;
    this.camControls.lon = -150;
    this.camControls.lat = 120;


    //var block = this.generateBlock();
    //this.scene.add(block);



    this.chunkManager = new ChunkManager(this.scene);

    document.getElementById("fullscreen").addEventListener("click", e => {
        if (this.container.requestFullscreen) {
            this.container.requestFullscreen();
        } else if (this.container.msRequestFullscreen) {
            this.container.msRequestFullscreen();
        } else if (this.container.mozRequestFullScreen) {
            this.container.mozRequestFullScreen();
        } else if (this.container.webkitRequestFullscreen) {
            this.container.webkitRequestFullscreen();
        }


        this.renderer.setSize(window.innerWidth, window.innerHeight);


    }, false);

    this.container.addEventListener("mousedown", e => {
        this.container.requestPointerLock();
    });

    document.addEventListener("fullscreenchange", () => this.onFullscreen, false);
    document.addEventListener("mozfullscreenchange", () => this.onFullscreen, false);
    document.addEventListener("webkitfullscreenchange", () => this.onFullscreen, false);
    document.addEventListener("msfullscreenchange", () => this.onFullscreen, false);

    this.container.addEventListener("resize", e => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    });
    this.stats = new window["Stats"]();
    this.stats.setMode(0);
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';
    this.container.appendChild(this.stats.domElement);

    this.render();
}

scene: THREE.Scene;
renderer: THREE.WebGLRenderer;
camera: THREE.PerspectiveCamera;
clock: THREE.Clock;
camControls;
stats;
container;
chunkManager: ChunkManager;

onFullscreen(e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
}

render() {
    requestAnimationFrame(() => this.render());
    var delta = this.clock.getDelta();
    this.chunkManager.update(delta);
    this.camControls.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
}

generateBlock() : THREE.Mesh {
    var geometry = new THREE.BufferGeometry();
    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.

    var length = 1.0, width = 1.0, height = 1.0;

    var vertices = new Float32Array([
        length, -height, -width,
        -length, -height, -width,
        -length, height, -width,
        length, height, -width,

        -length, -height, width,
        length, -height, width,
        length, height, width,
        -length, height, width,

        length, -height, width,
        length, -height, -width,
        length, height, -width,
        length, height, width,

        -length, -height, -width,
        -length, -height, width,
        -length, height, width,
        -length, height, -width,

        -length, -height, -width,
        length, -height, -width,
        length, -height, width,
        -length, -height, width,

        length, height, -width,
        -length, height, -width,
        -length, height, width,
        length, height, width
    ]);

    var normals = new Float32Array([
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,

        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
    ]);

    var indices = new Uint16Array([
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ]);


    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    var material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, material);
}

}

export default Game;
