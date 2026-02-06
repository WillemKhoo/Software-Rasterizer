class Projectile {
    constructor(x, y, z, xVel, yVel, zVel, size) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.xVel = xVel;
        this.yVel = yVel;
        this.zVel = zVel;
        this.size = size;
    }

    bufferProjectileFaces(mesh, isComplex, renderList) {
        if (isComplex) {
            for (let i = 0; i < mesh.length; i++) {
                renderList.push({
                    x1: mesh[i].x1 * this.size + this.x,
                    y1: mesh[i].y1 * this.size - this.y,
                    z1: mesh[i].z1 * this.size + this.z,
                    w1: 0,
                    x2: mesh[i].x2 * this.size + this.x,
                    y2: mesh[i].y2 * this.size - this.y,
                    z2: mesh[i].z2 * this.size + this.z,
                    w2: 0,
                    x3: mesh[i].x3 * this.size + this.x,
                    y3: mesh[i].y3 * this.size - this.y,
                    z3: mesh[i].z3 * this.size + this.z,
                    w3: 0,
                    color: { r: 50, g: 50, b: 200 },
                    original: {
                        x1: mesh[i].x1 * this.size + this.x,
                        y1: mesh[i].y1 * this.size - this.y,
                        z1: mesh[i].z1 * this.size + this.z,
                        x2: mesh[i].x2 * this.size + this.x,
                        y2: mesh[i].y2 * this.size - this.y,
                        z2: mesh[i].z2 * this.size + this.z,
                        x3: mesh[i].x3 * this.size + this.x,
                        y3: mesh[i].y3 * this.size - this.y,
                        z3: mesh[i].z3 * this.size + this.z,
                    },
                });
            }

            return;
        }

        for (let i = 0; i < mesh.length; i++) {
            const p1 = structuredClone(VERTICES[mesh[i].v1]);
            const p2 = structuredClone(VERTICES[mesh[i].v2]);
            const p3 = structuredClone(VERTICES[mesh[i].v3]);
            renderList.push({
                x1: (p1.x * this.size) / 2 + this.x,
                y1: (-p1.y * this.size) / 2 - this.y,
                z1: (p1.z * this.size) / 2 + this.z,
                w1: 0,
                x2: (p2.x * this.size) / 2 + this.x,
                y2: (-p2.y * this.size) / 2 - this.y,
                z2: (p2.z * this.size) / 2 + this.z,
                w2: 0,
                x3: (p3.x * this.size) / 2 + this.x,
                y3: (-p3.y * this.size) / 2 - this.y,
                z3: (p3.z * this.size) / 2 + this.z,
                w3: 0,
                color: { r: 50, g: 50, b: 200 },
                original: {
                    x1: (p1.x * this.size) / 2 + this.x,
                    y1: (-p1.y * this.size) / 2 - this.y,
                    z1: (p1.z * this.size) / 2 + this.z,
                    x2: (p2.x * this.size) / 2 + this.x,
                    y2: (-p2.y * this.size) / 2 - this.y,
                    z2: (p2.z * this.size) / 2 + this.z,
                    x3: (p3.x * this.size) / 2 + this.x,
                    y3: (-p3.y * this.size) / 2 - this.y,
                    z3: (p3.z * this.size) / 2 + this.z,
                },
            });
        }
    }

    updateProjectile() {
        this.x += this.xVel;
        this.y += this.yVel;
        this.z += this.zVel;

        this.yVel -= 0.003;

        return this;
    }
}

class Target {
    constructor(x = 0, y = 0, z = 0, size = 0.2) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
    }

    randomLocation() {
        let newX = Math.random() * 2 - 1;
        let newY = Math.random() * 0.2;
        let newZ = Math.random() * 2 - 1;

        const len = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
        const dist = (Math.random() + 1) * 5;

        newX /= len;
        newY /= len;
        newZ /= len;

        this.size = (Math.random() + 0.3) * 0.4;
        this.x = newX * dist;
        this.y = newY * dist;
        this.z = newZ * dist;
    }

    bufferTargetFaces(mesh, isComplex, renderList) {
        if (isComplex) {
            for (let i = 0; i < mesh.length; i++) {
                renderList.push({
                    x1: mesh[i].x1 * this.size + this.x,
                    y1: mesh[i].y1 * this.size - this.y,
                    z1: mesh[i].z1 * this.size + this.z,
                    w1: 0,
                    x2: mesh[i].x2 * this.size + this.x,
                    y2: mesh[i].y2 * this.size - this.y,
                    z2: mesh[i].z2 * this.size + this.z,
                    w2: 0,
                    x3: mesh[i].x3 * this.size + this.x,
                    y3: mesh[i].y3 * this.size - this.y,
                    z3: mesh[i].z3 * this.size + this.z,
                    w3: 0,
                    color: { r: 200, g: 50, b: 50 },
                    original: {
                        x1: mesh[i].x1 * this.size + this.x,
                        y1: mesh[i].y1 * this.size - this.y,
                        z1: mesh[i].z1 * this.size + this.z,
                        x2: mesh[i].x2 * this.size + this.x,
                        y2: mesh[i].y2 * this.size - this.y,
                        z2: mesh[i].z2 * this.size + this.z,
                        x3: mesh[i].x3 * this.size + this.x,
                        y3: mesh[i].y3 * this.size - this.y,
                        z3: mesh[i].z3 * this.size + this.z,
                    },
                });
            }

            return;
        }

        for (let i = 0; i < mesh.length; i++) {
            const p1 = structuredClone(VERTICES[mesh[i].v1]);
            const p2 = structuredClone(VERTICES[mesh[i].v2]);
            const p3 = structuredClone(VERTICES[mesh[i].v3]);
            renderList.push({
                x1: (p1.x * this.size) / 2 + this.x,
                y1: (-p1.y * this.size) / 2 + this.y,
                z1: (p1.z * this.size) / 2 + this.z,
                w1: 0,
                x2: (p2.x * this.size) / 2 + this.x,
                y2: (-p2.y * this.size) / 2 + this.y,
                z2: (p2.z * this.size) / 2 + this.z,
                w2: 0,
                x3: (p3.x * this.size) / 2 + this.x,
                y3: (-p3.y * this.size) / 2 + this.y,
                z3: (p3.z * this.size) / 2 + this.z,
                w3: 0,
                color: { r: 200, g: 50, b: 50 },
                original: {
                    x1: (p1.x * this.size) / 2 + this.x,
                    y1: (-p1.y * this.size) / 2 + this.y,
                    z1: (p1.z * this.size) / 2 + this.z,
                    x2: (p2.x * this.size) / 2 + this.x,
                    y2: (-p2.y * this.size) / 2 + this.y,
                    z2: (p2.z * this.size) / 2 + this.z,
                    x3: (p3.x * this.size) / 2 + this.x,
                    y3: (-p3.y * this.size) / 2 + this.y,
                    z3: (p3.z * this.size) / 2 + this.z,
                },
            });
        }
    }
}