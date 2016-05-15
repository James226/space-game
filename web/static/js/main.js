import controls from './controls'
import ChunkManager from './chunk-manager'
import PhysicsManager from './physics-manager'

export class Game {
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    clock: THREE.Clock;
    camControls;
    stats;
    container;
    chunkManager: ChunkManager;

    constructor(socket) {
        this.socket = socket;
        this.container = document.getElementById('game-container');

        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.scene.add(new THREE.AmbientLight(0xffffff));//(0x444444));
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setPixelRatio(this.container.clientWidth / this.container.clientHeight);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500);
        this.camera.position.z = 10;
        this.camera.position.y = 4;
        this.camera.position.x = 0;

        // this.camera.rotation.x = -0.7;
        this.camera.rotation.x = -0.3;

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(.5, 1, 0);

        this.scene.add(directionalLight);

//         var light = new THREE.PointLight( 0xff0000, 1, 100 );
// light.position.set( 50, 50, 50 );
// light.castShadow = true;
//
// this.scene.add( light );


        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshLambertMaterial( {color: 0x0C0C0C} );
        this.cube = new THREE.Mesh( geometry, material );
        this.cube.position.x = 10;
        this.cube.position.y = 20;
        this.cube.position.z = 10;
        this.cube.castShadow = true;

        this.scene.add( this.cube );
        this.cube.add(this.camera);

        this.camControls = new controls(this.cube);
        this.camControls.lookSpeed = 0.4;
        this.camControls.movementSpeed = 20;
        this.camControls.noFly = true;
        this.camControls.lookVertical = true;
        this.camControls.constrainVertical = false;
        this.camControls.verticalMin = 1.0;
        this.camControls.verticalMax = 2.0;
        this.camControls.lon = -150;
        this.camControls.lat = 120;

        this.chunkManager = new ChunkManager(this.scene);
        this.physicsManager = new PhysicsManager(p => this.chunkManager.voxelActive(p));
        this.physicsManager.add(this.cube);

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

        window.addEventListener("keypress", this.onKeyPress, false);

        var chatInput = document.getElementById("chatInput");
        chatInput.addEventListener("keypress", event => {
            if (event.keyCode == 13) {
                this.socket.lobby.push("new_msg", { message: chatInput.value });
                chatInput.value = "";
                chatInput.blur();
                event.preventDefault();
                event.stopPropagation();
            }
        });

        this.socket.lobby.on("new_msg", ({message: message}) => {
            document.getElementById("chatLog").innerHTML += "<br />" + message;
            document.getElementById("chatLog").scrollTop = document.getElementById("chatLog").scrollHeight;
        })

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

    onKeyPress(event) {
        switch(event.keyCode) {
            case 13:
                document.getElementById("chatInput").focus();
        }
    }

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
        this.physicsManager.update(delta);
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }

}

export default Game;
