var chunkSize = 32;
var message = {
    vertices: new Float32Array(chunkSize * chunkSize * chunkSize * 12),
    normals: new Float32Array(chunkSize * chunkSize * chunkSize * 12),
    indices: new Uint16Array(chunkSize * chunkSize * chunkSize * 6),
    uvs: new Float32Array(chunkSize * chunkSize * chunkSize * 8)
};

onmessage = e => {
    importScripts("/js/three.js");

    var chunkSize = e.data.chunkSize;
    var lod = e.data.Lod;

    var currentPos = 0;
    var geometry = new THREE.Geometry();
    for (var x = 0; x < chunkSize; x+=lod) {
        for (var y = 0; y < chunkSize; y+=lod) {
            for (var z = 0; z < chunkSize; z+=lod) {
                if (!e.data.voxels[x][y][z]) {//.active === false) {
                    continue;
                }

                currentPos = this.generateBlock(geometry, x, y, z, chunkSize, e.data.blockSize, e.data.voxels, message, lod, currentPos);
            }
        }
    }

    var msg = {
        vertices: message.vertices.slice(0, currentPos * 12),
        normals: message.normals.slice(0, currentPos * 12),
        indices: message.indices.slice(0, currentPos * 6),
        uvs: message.uvs.slice(0, currentPos * 8),
    }
    postMessage(msg, [msg.vertices.buffer, msg.normals.buffer, msg.indices.buffer, msg.uvs.buffer]);
    //delete message;
};

function generateBlock(geometry, x, y, z, chunkSize, blockSize, voxels, message, lod, currentPos) {
    var xPos = x * blockSize;
    var yPos = y * blockSize;
    var zPos = z * blockSize;
    var halfBlock = (blockSize / 2);
    var lodAdjustment = (blockSize / 2) + (blockSize * lod);

    // Front
    if (z + lod > chunkSize - 1 || !voxels[x][y][z + lod]) {//.active) {
        message.vertices.set([
            xPos - halfBlock, yPos - halfBlock, zPos + lodAdjustment,
            xPos + lodAdjustment, yPos - halfBlock, zPos + lodAdjustment,
            xPos + lodAdjustment, yPos + lodAdjustment, zPos + lodAdjustment,
            xPos - halfBlock, yPos + lodAdjustment, zPos + lodAdjustment
        ], currentPos * 12);
        message.normals.set([
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ], currentPos * 12);
        message.indices.set([
            currentPos * 4, currentPos * 4 + 1, currentPos * 4  + 2,
            currentPos * 4, currentPos * 4 + 2, currentPos * 4 + 3
        ], currentPos * 6);
        message.uvs.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ], currentPos * 8);
        currentPos++;
    }

    // Back
    if (z - lod < 0 || !voxels[x][y][z - lod]) {//.active) {
        message.vertices.set([
            xPos + lodAdjustment, yPos - halfBlock, zPos - halfBlock,
            xPos - halfBlock, yPos - halfBlock, zPos - halfBlock,
            xPos - halfBlock, yPos + lodAdjustment, zPos - halfBlock,
            xPos + lodAdjustment, yPos + lodAdjustment, zPos - halfBlock
        ], currentPos * 12);
        message.normals.set([
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
        ], currentPos * 12);
        message.indices.set([
            currentPos * 4, currentPos * 4 + 1, currentPos * 4 + 2,
            currentPos * 4, currentPos * 4 + 2, currentPos * 4 + 3
        ], currentPos * 6);
        message.uvs.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ], currentPos * 8);
        currentPos++;
    }

    // Right
    if (x + lod > chunkSize - 1 || !voxels[x + lod][y][z]) {//.active) {
        message.vertices.set([
            xPos + lodAdjustment, yPos - halfBlock, zPos + lodAdjustment,
            xPos + lodAdjustment, yPos - halfBlock, zPos - halfBlock,
            xPos + lodAdjustment, yPos + lodAdjustment, zPos - halfBlock,
            xPos + lodAdjustment, yPos + lodAdjustment, zPos + lodAdjustment,
        ], currentPos * 12);
        message.normals.set([
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0
        ], currentPos * 12);
        message.indices.set([
            currentPos * 4, currentPos * 4 + 1, currentPos * 4 + 2,
            currentPos * 4, currentPos * 4 + 2, currentPos * 4 + 3
        ], currentPos * 6);
        message.uvs.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ], currentPos * 8);
        currentPos++;
    }

    // Left
    if (x - lod < 0 || !voxels[x - lod][y][z]) {//.active) {
        message.vertices.set([
            xPos - halfBlock, yPos - halfBlock, zPos - halfBlock,
            xPos - halfBlock, yPos - halfBlock, zPos + lodAdjustment,
            xPos - halfBlock, yPos + lodAdjustment, zPos + lodAdjustment,
            xPos - halfBlock, yPos + lodAdjustment, zPos - halfBlock,
        ], currentPos * 12);
        message.normals.set([
                -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0
        ], currentPos * 12);
        message.indices.set([
            currentPos * 4, currentPos * 4 + 1, currentPos * 4 + 2,
            currentPos * 4, currentPos * 4 + 2, currentPos * 4 + 3
        ], currentPos * 6);
        message.uvs.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ], currentPos * 8);
        currentPos++;
    }

    // Top
    if (y + lod > chunkSize - 1 || !voxels[x][y + lod][z]) {//.active) {
        message.vertices.set([
            xPos + lodAdjustment, yPos + lodAdjustment, zPos - halfBlock,
            xPos - halfBlock, yPos + lodAdjustment, zPos - halfBlock,
            xPos - halfBlock, yPos + lodAdjustment, zPos + lodAdjustment,
            xPos + lodAdjustment, yPos + lodAdjustment, zPos + lodAdjustment
        ], currentPos * 12);
        message.normals.set([
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0
        ], currentPos * 12);
        message.indices.set([
            currentPos * 4, currentPos * 4 + 1, currentPos * 4 + 2,
            currentPos * 4, currentPos * 4 + 2, currentPos * 4 + 3
        ], currentPos * 6);
        message.uvs.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ], currentPos * 8);
        currentPos++;
    }

    // Bottom
    if (y - lod < 0 || !voxels[x][y - lod][z]) {//.active) {
        message.vertices.set([
            xPos - halfBlock, yPos - halfBlock, zPos - halfBlock,
            xPos + lodAdjustment, yPos - halfBlock, zPos - halfBlock,
            xPos + lodAdjustment, yPos - halfBlock, zPos + lodAdjustment,
            xPos - halfBlock, yPos - halfBlock, zPos + lodAdjustment
        ], currentPos * 12);
        message.normals.set([
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0
        ], currentPos * 12);
        message.indices.set([
            currentPos * 4, currentPos * 4 + 1, currentPos * 4 + 2,
            currentPos * 4, currentPos * 4 + 2, currentPos * 4 + 3
        ], currentPos * 6);
        message.uvs.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ], currentPos * 8);
        currentPos++;
    }
    return currentPos;
}
