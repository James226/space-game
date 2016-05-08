class Voxel {
    active: boolean;
    type: VoxelType;

    constructor() {
        this.active = true;
        this.type = 0;
    }

    isActive(): boolean {
        return this.active;
    }

    setActive(isActive: boolean): void {
        this.active = isActive;
    }
}

export default Voxel;
