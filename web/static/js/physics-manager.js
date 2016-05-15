class PhysicsManager {
    constructor(voxelCollisionCheck) {
        this.voxelCollisionCheck = voxelCollisionCheck;
        this.objects = [];
    }

    add(object) {
        this.objects.push(object);
    }

    update(deltaTime) {
        for (var i in this.objects) {
            if (!this.voxelCollisionCheck(new THREE.Vector3(this.objects[i].position.x, this.objects[i].position.y - 1, this.objects[i].position.z))) {
                this.objects[i].position.y -= 3 * deltaTime;
            } else if(this.voxelCollisionCheck(this.objects[i].position)) {
                this.objects[i].position.y += 1 * deltaTime;
            }
        }
    }
}

export default PhysicsManager;
