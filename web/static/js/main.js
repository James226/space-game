import controls from './controls'
import ChunkManager from './chunk-manager'
import PhysicsManager from './physics-manager'

var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');

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
        this.camera.position.z = 60;
        this.camera.position.y = 25;
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


        // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // var material = new THREE.MeshLambertMaterial( {color: 0x0C0C0C} );
        // this.player = new THREE.Mesh( geometry, material );
        // this.player.position.x = 10;
        // this.player.position.y = 20;
        // this.player.position.z = 10;
        // this.player.castShadow = true;

        this.chunkManager = new ChunkManager(this.scene);
        this.physicsManager = new PhysicsManager(p => this.chunkManager.voxelActive(p));

        this.player = new THREE.Object3D();
        this.player.velocity = new THREE.Vector3(0, -1, 0);
        this.player.position.set(0, 40, 1);
        this.scene.add(this.player);
        this.player.add(this.camera);

        this.camControls = new controls(this.player);
        this.camControls.lookSpeed = 0.4;
        this.camControls.movementSpeed = 20;
        this.camControls.noFly = true;
        this.camControls.lookVertical = true;
        this.camControls.constrainVertical = false;
        this.camControls.verticalMin = 1.0;
        this.camControls.verticalMax = 2.0;
        this.camControls.lon = -150;
        this.camControls.lat = 120;
        this.physicsManager.add(this.player);

        var loader = new THREE.JSONLoader();
		loader.load( "js/models/knight.js", ( geometry, materials ) => {
			this.createScene(geometry, materials, 0, 0, 0, 0.2);
		});

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

        var element = document.createElement("div");
        this.socket.lobby.on("new_msg", ({message: message}) => {
            element.innerText = message;
            document.getElementById("chatLog").innerHTML += (document.getElementById("chatLog").innerHTML.length === 0) ? element.innerHTML : "<br />" + element.innerHTML;
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

    createScene( geometry, materials, x, y, z, s ) {
        geometry.computeBoundingBox();
        var bb = geometry.boundingBox;
        var path = "textures/cube/Park2/";
        var format = '.jpg';
        var urls = [
                path + 'posx' + format, path + 'negx' + format,
                path + 'posy' + format, path + 'negy' + format,
                path + 'posz' + format, path + 'negz' + format
            ];
        for ( var i = 0; i < materials.length; i ++ ) {
            var m = materials[ i ];
            m.skinning = true;
            m.morphTargets = true;
            m.specular.setHSL( 0, 0, 0.1 );
            m.color.setHSL( 0.6, 0, 0.6 );
        }
        var playerModel = new THREE.SkinnedMesh( geometry, new THREE.MultiMaterial( materials ) );
        playerModel.name = "Knight Mesh";
        playerModel.position.set( x, y - bb.min.y * s, z );
        playerModel.scale.set( s, s, s );
        playerModel.rotation.set(0, Math.PI, 0);
        this.player.add( playerModel );
        playerModel.castShadow = true;
        playerModel.receiveShadow = true;
        var mixer = new THREE.AnimationMixer( playerModel );
        var bonesClip = geometry.animations[0];
        var facesClip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'facialExpressions', playerModel.geometry.morphTargets, 3 );


        // var action = mixer.clipAction( bonesClip, null );
		// action.play();
    }


    removeTags(html) {
      var oldHtml;
      do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
      } while (html !== oldHtml);
      return html.replace(/</g, '&lt;');
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
        if (this.camControls)
            this.camControls.update(delta);
        this.physicsManager.update(delta);
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }

}

export default Game;
