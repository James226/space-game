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
            // if (!this.voxelCollisionCheck(new THREE.Vector3(this.objects[i].position.x, this.objects[i].position.y - 1, this.objects[i].position.z))) {
            //     this.objects[i].position.y -= 10 * deltaTime;
            // } else if(this.voxelCollisionCheck(new THREE.Vector3(this.objects[i].position.x, this.objects[i].position.y - 0.9, this.objects[i].position.z))) {
            //     this.objects[i].position.y += 20 * deltaTime;
            // }
            var velocity = new THREE.Vector3(this.objects[i].velocity.x, this.objects[i].velocity.y, this.objects[i].velocity.z)
            if (!this.voxelCollisionCheck(new THREE.Vector3(this.objects[i].position.x, this.objects[i].position.y - 1, this.objects[i].position.z))) {
                velocity.y = -10;
            } else {
                var space = this.voxelCollisionCheck(new THREE.Vector3(this.objects[i].position.x, this.objects[i].position.y - 0.5, this.objects[i].position.z));
                if (!space) {
                    velocity.y = 0;
                    this.objects[i].position.y = Math.round(this.objects[i].position.y)  - 0.01;
                } else {
                    velocity.y = 20;
                }
            }
            this.objects[i].position.add(velocity.multiplyScalar(deltaTime))
        }
    }
}

export default PhysicsManager;
