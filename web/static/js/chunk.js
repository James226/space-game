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

    constructor(scene: THREE.Scene, position: THREE.Vector2, worker: Worker, texture: THREE.Texture, heightmap) {
        this.scene = scene;
        this.position = position;
       // this.material = new THREE.MeshLambertMaterial({ color: 0xff0000 });

        this.texture = texture;
        this.state = ChunkState.Pending;
        this.worker = worker;
        this.voxels = [];

        var currentStatus = 0xffffffff;
        for (var x = 0; x <= ChunkSize; x++) {
            this.voxels[x] = [];

            for (var y = 0; y <= ChunkSize; y++) {
                this.voxels[x][y] = [];

                for (var z = 0; z <= ChunkSize; z++) {
                    this.voxels[x][y][z] = true; // new Voxel();
                    var heightPos = ((((x + position.x * ChunkSize)) + ((z + (position.y * ChunkSize)) * heightmap.width)) * 4);
                    window.heightmap = heightmap;
                    if (heightPos > heightmap.data.length) {
                        if (Math.abs(ChunkSize / 2 - x) > ChunkSize - y && Math.abs(ChunkSize / 2 - z) > ChunkSize - y) this.voxels[x][y][z] = false; //this.voxels[x][y][z].setActive(false);
                    } else {
                        if ((heightmap.data[heightPos] * (32/255)) < y) this.voxels[x][y][z] = false;
                    }
                }
            }
        }
    }

    regenerateMesh(): void {
        this.state = ChunkState.Loading;
        var self = this;
        this.worker.onmessage = e => {
            this.state = ChunkState.Loaded;
            this.scene.remove(this.mesh);
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute("position", new THREE.BufferAttribute(e.data.vertices, 3));
            geometry.addAttribute("normal", new THREE.BufferAttribute(e.data.normals, 3));
            geometry.addAttribute("uv", new THREE.BufferAttribute(e.data.uvs, 2));
            geometry.setIndex(new THREE.BufferAttribute(e.data.indices, 1));
            this.material = new THREE.MeshLambertMaterial({ map: self.texture }),
            this.mesh = new THREE.Mesh(geometry, this.material);
            this.mesh.position.x = this.position.x * (ChunkSize * BlockSize);
            this.mesh.position.z = this.position.y * (ChunkSize * BlockSize);
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

    generateBlock(geometry: THREE.Geometry, x: number, y: number, z: number) {
        var xPos = x * Chunk.BlockSize;
        var yPos = y * Chunk.BlockSize;
        var zPos = z * Chunk.BlockSize;
        var halfBlock = Chunk.BlockSize / 2;

        var v0 = geometry.vertices.push(new THREE.Vector3(xPos - halfBlock, yPos - halfBlock, zPos + halfBlock)) - 1;
        var v1 = geometry.vertices.push(new THREE.Vector3(xPos + halfBlock, yPos - halfBlock, zPos + halfBlock)) - 1;
        var v2 = geometry.vertices.push(new THREE.Vector3(xPos + halfBlock, yPos + halfBlock, zPos + halfBlock)) - 1;
        var v3 = geometry.vertices.push(new THREE.Vector3(xPos - halfBlock, yPos + halfBlock, zPos + halfBlock)) - 1;
        var v4 = geometry.vertices.push(new THREE.Vector3(xPos + halfBlock, yPos - halfBlock, zPos - halfBlock)) - 1;
        var v5 = geometry.vertices.push(new THREE.Vector3(xPos - halfBlock, yPos - halfBlock, zPos - halfBlock)) - 1;
        var v6 = geometry.vertices.push(new THREE.Vector3(xPos - halfBlock, yPos + halfBlock, zPos - halfBlock)) - 1;
        var v7 = geometry.vertices.push(new THREE.Vector3(xPos + halfBlock, yPos + halfBlock, zPos - halfBlock)) - 1;

        var normal: THREE.Vector3;
        var color = new THREE.Color(0xffaa00);

        // Front
        if (z >= ChunkSize - 1 || !this.voxels[x][y][z + 1]) {//.isActive()) {
            normal = new THREE.Vector3(0, 0, 1);
            geometry.faces.push(new THREE.Face3(v0, v1, v2, normal, color));
            geometry.faces.push(new THREE.Face3(v0, v2, v3, normal, color));
        }

        // Back
        if (z <= 0 || !this.voxels[x][y][z - 1]) {//.isActive()) {
            normal = new THREE.Vector3(0, 0, -1);
            geometry.faces.push(new THREE.Face3(v4, v5, v6, normal, color));
            geometry.faces.push(new THREE.Face3(v4, v6, v7, normal, color));
        }

        // Right
        if (x >= ChunkSize - 1 || !this.voxels[x + 1][y][z]) {//.isActive()) {
            normal = new THREE.Vector3(1, 0, 0);
            geometry.faces.push(new THREE.Face3(v1, v4, v7, normal, color));
            geometry.faces.push(new THREE.Face3(v1, v7, v2, normal, color));
        }

        // Left
        if (x <= 0 || !this.voxels[x - 1][y][z]) {//.isActive()) {
            normal = new THREE.Vector3(-1, 0, 0);
            geometry.faces.push(new THREE.Face3(v5, v0, v3, normal, color));
            geometry.faces.push(new THREE.Face3(v5, v3, v6, normal, color));
        }

        // Top
        if (y >= ChunkSize - 1 || !this.voxels[x][y + 1][z]) {//.isActive()) {
            normal = new THREE.Vector3(0, 1, 0);
            geometry.faces.push(new THREE.Face3(v3, v2, v7, normal, color));
            geometry.faces.push(new THREE.Face3(v3, v7, v6, normal, color));
        }

        // Bottom
        if (y <= 0 || !this.voxels[x][y - 1][z]) {//.isActive()) {
            normal = new THREE.Vector3(0, -1, 0);
            geometry.faces.push(new THREE.Face3(v5, v4, v1, normal, color));
            geometry.faces.push(new THREE.Face3(v5, v1, v0, normal, color));
        }
    }
}

export default Chunk;
