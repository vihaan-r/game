export class CollisionManager {
    constructor() {
        this.aabbs = []; // Array of { id, minX, maxX, minZ, maxZ, type }
    }

    addAABB(id, minX, maxX, minZ, maxZ, type = 'wall') {
        this.aabbs.push({ id, minX, maxX, minZ, maxZ, type });
    }

    removeAABB(id) {
        this.aabbs = this.aabbs.filter(box => box.id !== id);
    }

    checkCollision(x, z, radius) {
        const pMinX = x - radius;
        const pMaxX = x + radius;
        const pMinZ = z - radius;
        const pMaxZ = z + radius;

        for (const box of this.aabbs) {
            if (pMinX < box.maxX && pMaxX > box.minX &&
                pMinZ < box.maxZ && pMaxZ > box.minZ) {
                return box; // Collision detected
            }
        }
        return null; // No collision
    }

    resolveCollision(oldX, oldZ, newX, newZ, radius) {
        let resolvedX = newX;
        let resolvedZ = newZ;

        // Check X axis movement
        if (this.checkCollision(newX, oldZ, radius)) {
            resolvedX = oldX; // Revert X
        }

        // Check Z axis movement
        if (this.checkCollision(resolvedX, newZ, radius)) {
            resolvedZ = oldZ; // Revert Z
        }

        return { x: resolvedX, z: resolvedZ };
    }
    
    clear() {
        this.aabbs = [];
    }
}
