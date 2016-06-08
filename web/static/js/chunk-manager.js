import Chunk from './chunk'

var ChunkState = {
    Pending: 0,
    Loading: 1,
    Loaded: 2
}

var NumChunks = 10;
var ChunkSize = 32;

class ChunkManager {
    chunks;
    maxLoading;
    timeSinceLast;
    scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.maxLoading = 1;
        this.chunks = [];
        this.timeSinceLast = 0;
        var worker = new Worker("js/chunk-worker.js");

        var textureLoader = new THREE.TextureLoader()
        textureLoader.load("images/rocks.jpg", (texture) => {
            textureLoader.load("images/heightmap.png", heightmap => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                var canvas = document.createElement('canvas');
                canvas.width = 256;
            	canvas.height = 256;
                var context = canvas.getContext('2d');
                var img = heightmap.image;
                context.drawImage(img, 0, 0 );
                var heightmapData = context.getImageData(0, 0, img.width, img.height);
                texture.repeat.set(2, 2);
                console.log(NumChunks / 2);
                for (var x = 0; x < NumChunks; x++)
                for (var y = -Math.floor(NumChunks/2); y < Math.floor(NumChunks/2); y++)
                for (var z = 0; z < NumChunks; z++) {
                    this.chunks[[x, y, z]] = new Chunk(this.scene, new THREE.Vector3(x, y, z), worker, texture, heightmapData);
                }
            });
        });
    }

    load(socket) {
        socket.lobby.on("world_state", ({state: state, position}) => {
            this.chunks[[position.x, position.y, position.z]].set(state);
        });
        for (var x = 0; x < NumChunks; x++)
        for (var y = -Math.floor(NumChunks/2); y < Math.floor(NumChunks/2); y++)
        for (var z = 0; z < NumChunks; z++) {
            socket.lobby.push("get_world_state", { x: x, y: y, z: z });
        }
    }

    update(delta: number) {
        var numLoading = 0;
        this.timeSinceLast += delta;
        var chunks = this.chunks;
        for (var i in chunks) {
            if (chunks.hasOwnProperty(i)) {
                if (chunks[i].state === ChunkState.Loading) {
                    numLoading++;
                }
            }
        }

        for (var j in chunks) {
            if (chunks.hasOwnProperty(j)) {
                if (numLoading >= this.maxLoading) break;
                if (this.chunks[j].state === ChunkState.Pending) {
                    this.chunks[j].regenerateMesh();
                    this.timeSinceLast = 0;
                    numLoading++;
                }
            }
        }
    }

    voxelActive(position) {
        var pos = position.clone().divideScalar(ChunkSize);
        pos.x = Math.floor(pos.x);
        pos.y = Math.floor(pos.y);
        pos.z = Math.floor(pos.z);

        if (this.chunks[[pos.x, pos.y, pos.z]])
            return this.chunks[[pos.x, pos.y, pos.z]].voxelActive(position.clone().sub(pos.multiplyScalar(ChunkSize)));
    }

    destroy(position) {
        var pos = position.clone().divideScalar(ChunkSize);
        pos.x = Math.floor(pos.x);
        pos.y = Math.floor(pos.y);
        pos.z = Math.floor(pos.z);

        if (this.chunks[[pos.x, pos.y, pos.z]])
            return this.chunks[[pos.x, pos.y, pos.z]].destroy(position.clone().sub(pos.multiplyScalar(ChunkSize)));
    }

    create(position) {
        var pos = position.clone().divideScalar(ChunkSize);
        pos.x = Math.floor(pos.x);
        pos.y = Math.floor(pos.y);
        pos.z = Math.floor(pos.z);

        if (this.chunks[[pos.x, pos.y, pos.z]])
            return this.chunks[[pos.x, pos.y, pos.z]].create(position.clone().sub(pos.multiplyScalar(ChunkSize)));
    }
}

export default ChunkManager;
