var ChunkSize = 32;
var BlockSize = 1;

var ChunkState = {
    Pending: 0,
    Loading: 1,
    Loaded: 2
}
class Chunk {
    voxels;
    mesh: THREE.Mesh;
    worker: Worker;
    material: THREE.Material;
    state: ChunkState;
    texture: THREE.Texture;
    scene: THREE.Scene;

    constructor(scene: THREE.Scene, position: THREE.Vector3, worker: Worker, texture: THREE.Texture, heightmap) {
        this.scene = scene;
        this.position = position;
       // this.material = new THREE.MeshLambertMaterial({ color: 0xff0000 });

        this.texture = texture;
        this.state = ChunkState.Loaded;
        this.worker = worker;
        this.voxels = [];
        this.pristine = this.position.y !== 0;

        var currentStatus = 0xffffffff;
        for (var x = 0; x <= ChunkSize; x++) {
            this.voxels[x] = [];

            for (var y = 0; y <= ChunkSize; y++) {
                this.voxels[x][y] = [];

                for (var z = 0; z <= ChunkSize; z++) {
                    // this.voxels[x][y][z] = this.position.y < 1;
                    // if (this.position.y === 0) {
                    //     var heightPos = ((((x + position.x * ChunkSize)) + ((z + (position.z * ChunkSize)) * heightmap.width)) * 4);
                    //     window.heightmap = heightmap;
                    //     if (heightPos > heightmap.data.length) {
                    //         if (Math.abs(ChunkSize / 2 - x) > ChunkSize - y && Math.abs(ChunkSize / 2 - z) > ChunkSize - y) this.voxels[x][y][z] = false; //this.voxels[x][y][z].setActive(false);
                    //     } else {
                    //         if ((heightmap.data[heightPos] * (32/255)) < y) this.voxels[x][y][z] = false;
                    //     }
                    // }
                }
            }
        }
        this.position.multiplyScalar(ChunkSize * BlockSize);
    }

    set(list) {
        for (var x = 0; x <= ChunkSize; x++)
        for (var y = 0; y <= ChunkSize; y++)
        for (var z = 0; z <= ChunkSize; z++) {
            this.voxels[x][y][z] = list[x + y * ChunkSize + z * ChunkSize * ChunkSize];

        }
        this.state = ChunkState.Pending;
    }

    voxelActive(position) {
        if (this.voxels[Math.floor(position.x)] && this.voxels[Math.floor(position.x)][Math.floor(position.y)]) {
            return this.voxels[Math.floor(position.x)][Math.floor(position.y)][Math.floor(position.z)];
        }
    }

    create(position) {
        if (this.voxels[Math.floor(position.x)] &&
            this.voxels[Math.floor(position.x)][Math.floor(position.y)] &&
            !this.voxels[Math.floor(position.x)][Math.floor(position.y)][Math.floor(position.z)]) {
                this.pristine = false;
                this.voxels[Math.floor(position.x)][Math.floor(position.y)][Math.floor(position.z)] = true;
                this.regenerateMesh();
                return true;
        }
        return false;
    }

    destroy(position) {
        if (this.voxels[Math.floor(position.x)] &&
            this.voxels[Math.floor(position.x)][Math.floor(position.y)] &&
            this.voxels[Math.floor(position.x)][Math.floor(position.y)][Math.floor(position.z)]) {
                this.pristine = false;
                this.voxels[Math.floor(position.x)][Math.floor(position.y)][Math.floor(position.z)] = false;
                this.regenerateMesh();
                return true;
        }
        return false;
    }

    regenerateMesh(): void {
        if (this.pristine) {
            this.state = ChunkState.Loaded;
            return;
        }
        this.state = ChunkState.Loading;
        var self = this;
        this.worker.onmessage = e => {
            this.state = ChunkState.Loaded;
            this.scene.remove(this.mesh);
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute("position", new THREE.BufferAttribute(e.data.vertices, 3));
            //geometry.addAttribute("normal", new THREE.BufferAttribute(e.data.normals, 3));
            geometry.addAttribute("uv", new THREE.BufferAttribute(e.data.uvs, 2));
            geometry.setIndex(new THREE.BufferAttribute(e.data.indices, 1));
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
            this.material = new THREE.MeshLambertMaterial({ map: self.texture, side: THREE.BackSide});
            this.mesh = new THREE.Mesh(geometry, this.material);
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
            this.scene.add(this.mesh);
        };
        var lodPercent = (Math.min(400, new THREE.Vector2(0, 0).sub(this.position).length()) / 400);
        var lod = Math.max(1, Math.pow(2, Math.ceil(Math.log(64 * lodPercent) / Math.log(2))));
        this.worker.postMessage({
            chunkSize: ChunkSize,
            blockSize: BlockSize,
            voxels: this.voxels,
            Lod: lod
        });
    }
}

export default Chunk;
