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
            if (!this.voxelCollisionCheck(this.objects[i].position)) {
                this.objects[i].position.y -= 3 * deltaTime;
            }
        }
    }
}

export default PhysicsManager;
