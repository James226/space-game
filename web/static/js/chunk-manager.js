import Chunk from './chunk'

var ChunkState = {
    Pending: 0,
    Loading: 1,
    Loaded: 2
}

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
                for (var x = 0; x < 50; x++) {
                    for (var z = 0; z < 50; z++) {
                        this.chunks.push(new Chunk(this.scene, new THREE.Vector2(x, z), worker, texture, heightmapData));
                    }
                }
            });
        });

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

        //if (this.timeSinceLast > 10) {
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
        //}
    }
}

export default ChunkManager;
