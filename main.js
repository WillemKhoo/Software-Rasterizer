// main.js

const c = document.getElementById("game")
const ctx = c.getContext("2d")

let width = c.width;
let height = c.height;

const RADIAN = (Math.PI / 180)
const FOV = 90 * (RADIAN)
const ASPECT_RATIO = height / width; 
const fFar = 1000
const fNear = 0.1

const MATRIX3D = [
    [ASPECT_RATIO * (1 / Math.tan(FOV / 2)), 0, 0, 0], // X output
    [0, 1 / Math.tan(FOV / 2), 0, 0], // Y output
    [0, 0, -1 * ((fFar + fNear) / (fFar - fNear)), -2 * ((fFar + fNear) / (fFar - fNear))], // Z output
    [0, 0, 1, 0] // W!!! -> Z depth information
]

const LIGHT = {x: 0.6, y: 0.9, z: 0.5}

let camera = {x: 0, y: 0, z:0, vx: 0, vy: 0, vz: 0, ax: 0, ay: 0, az: 0}
let move = {north: false, south: false, east: false, west: false, up: false, down: false, rot_left: false, rot_right: false, rot_up: false, rot_down: false}

let renderList = []; // stores triangles to be rendered
let targetList = [];
let projectileList = [];

// Calculates the direction of the camera in its x, y, and z components rather than angle
function calculateDirection(cam) {
    let direct = {x: 0, y: 0, z: 0}
    
    direct.x = Math.sin(cam.ay * RADIAN) * Math.cos(cam.ax * RADIAN)
    direct.y = -Math.sin(cam.ax * RADIAN)
    direct.z = Math.cos(cam.ay * RADIAN) * Math.cos(cam.ax * RADIAN)

    const len = Math.sqrt((direct.x * direct.x) + (direct.y * direct.y) + (direct.z * direct.z))

    direct.x /= len
    direct.y /= len
    direct.z /= len

    return direct;
}

class Target {
    constructor (x = 0, y = 0, z = 0, size = 0.2) {
        this.x = x
        this.y = y
        this.z = z
        this.size = size
    }

    randomLocation() {
        let newX = Math.random() * 2 - 1
        let newY = Math.random() * 0.2
        let newZ = Math.random() * 2 - 1

        const len = Math.sqrt(newX * newX + newY * newY + newZ * newZ)
        const dist = (Math.random() + 1) * 5

        newX /= len
        newY /= len
        newZ /= len

        this.size = (Math.random() + 0.3) * 0.4
        this.x = newX * dist
        this.y = newY * dist
        this.z = newZ * dist
    }


    bufferTargetFaces(mesh, isComplex) {
        if (isComplex) {
            for (let i = 0; i < mesh.length; i++) {
                renderList.push({
                    x1: mesh[i].x1 * this.size + this.x, y1: mesh[i].y1 * this.size - this.y, z1: mesh[i].z1 * this.size + this.z, w1: 0, 
                    x2: mesh[i].x2 * this.size + this.x, y2: mesh[i].y2 * this.size - this.y, z2: mesh[i].z2 * this.size + this.z, w2: 0,
                    x3: mesh[i].x3 * this.size + this.x, y3: mesh[i].y3 * this.size - this.y, z3: mesh[i].z3 * this.size + this.z, w3: 0,
                    color: {r: 200, g: 50, b: 50},
                    original: {x1: mesh[i].x1 * this.size + this.x, y1: mesh[i].y1 * this.size - this.y, z1: mesh[i].z1 * this.size + this.z, 
                               x2: mesh[i].x2 * this.size + this.x, y2: mesh[i].y2 * this.size - this.y, z2: mesh[i].z2 * this.size + this.z,
                               x3: mesh[i].x3 * this.size + this.x, y3: mesh[i].y3 * this.size - this.y, z3: mesh[i].z3 * this.size + this.z}
                })
            }

            return
        }
        
        for (let i = 0; i < mesh.length; i++) {
            const p1 = structuredClone(VERTICES[mesh[i].v1]);
            const p2 = structuredClone(VERTICES[mesh[i].v2]);
            const p3 = structuredClone(VERTICES[mesh[i].v3]);
            renderList.push({
                x1: p1.x * this.size / 2 + this.x, y1: -p1.y * this.size / 2 + this.y, z1: p1.z * this.size / 2 + this.z, w1: 0, 
                x2: p2.x * this.size / 2 + this.x, y2: -p2.y * this.size / 2 + this.y, z2: p2.z * this.size / 2 + this.z, w2: 0,
                x3: p3.x * this.size / 2 + this.x, y3: -p3.y * this.size / 2 + this.y, z3: p3.z * this.size / 2 + this.z, w3: 0,
                color: {r: 200, g: 50, b: 50},
                original: {x1: p1.x * this.size / 2 + this.x, y1: -p1.y * this.size / 2 + this.y, z1: p1.z * this.size / 2 + this.z, 
                           x2: p2.x * this.size / 2 + this.x, y2: -p2.y * this.size / 2 + this.y, z2: p2.z * this.size / 2 + this.z,
                           x3: p3.x * this.size / 2 + this.x, y3: -p3.y * this.size / 2 + this.y, z3: p3.z * this.size / 2 + this.z}
            })
        }
    }
}

let TARGET1 = new Target(10, 10, 10, 0.3)

for (let i = 0; i < 10; i++) {
    targetList.push(new Target)
}
for (let i = 0; i < targetList.length; i++) {
    targetList[i].randomLocation()
}

class Projectile {
    constructor (x, y, z, xVel, yVel, zVel, size) {
        this.x = x
        this.y = y
        this.z = z
        this.xVel = xVel
        this.yVel = yVel
        this.zVel = zVel
        this.size = size
    }

    bufferProjectileFaces(mesh, isComplex) {
        if (isComplex) {
            for (let i = 0; i < mesh.length; i++) {
                renderList.push({
                    x1: mesh[i].x1 * this.size + this.x, y1: mesh[i].y1 * this.size - this.y, z1: mesh[i].z1 * this.size + this.z, w1: 0, 
                    x2: mesh[i].x2 * this.size + this.x, y2: mesh[i].y2 * this.size - this.y, z2: mesh[i].z2 * this.size + this.z, w2: 0,
                    x3: mesh[i].x3 * this.size + this.x, y3: mesh[i].y3 * this.size - this.y, z3: mesh[i].z3 * this.size + this.z, w3: 0,
                    color: {r: 50, g: 50, b: 200},
                    original: {x1: mesh[i].x1 * this.size + this.x, y1: mesh[i].y1 * this.size - this.y, z1: mesh[i].z1 * this.size + this.z, 
                               x2: mesh[i].x2 * this.size + this.x, y2: mesh[i].y2 * this.size - this.y, z2: mesh[i].z2 * this.size + this.z,
                               x3: mesh[i].x3 * this.size + this.x, y3: mesh[i].y3 * this.size - this.y, z3: mesh[i].z3 * this.size + this.z}
                })
            }

            return
        }
        
        for (let i = 0; i < mesh.length; i++) {
            const p1 = structuredClone(VERTICES[mesh[i].v1]);
            const p2 = structuredClone(VERTICES[mesh[i].v2]);
            const p3 = structuredClone(VERTICES[mesh[i].v3]);
            renderList.push({
                x1: p1.x * this.size / 2 + this.x, y1: -p1.y * this.size / 2 - this.y, z1: p1.z * this.size / 2 + this.z, w1: 0, 
                x2: p2.x * this.size / 2 + this.x, y2: -p2.y * this.size / 2 - this.y, z2: p2.z * this.size / 2 + this.z, w2: 0,
                x3: p3.x * this.size / 2 + this.x, y3: -p3.y * this.size / 2 - this.y, z3: p3.z * this.size / 2 + this.z, w3: 0,
                color: {r: 50, g: 50, b: 200},
                original: {x1: p1.x * this.size / 2 + this.x, y1: -p1.y * this.size / 2 - this.y, z1: p1.z * this.size / 2 + this.z, 
                           x2: p2.x * this.size / 2 + this.x, y2: -p2.y * this.size / 2 - this.y, z2: p2.z * this.size / 2 + this.z,
                           x3: p3.x * this.size / 2 + this.x, y3: -p3.y * this.size / 2 - this.y, z3: p3.z * this.size / 2 + this.z}
            })
        }
    }

    updateProjectile() {
        this.x += this.xVel
        this.y += this.yVel
        this.z += this.zVel

        this.yVel -= 0.003

        return this;
    }
}

document.addEventListener("keydown", (event) => {
    const keyName = event.key

    switch (keyName) {
        case "w":
            move.north = true;
            break;
        case "s":
            move.south = true;
            break;
        case "a":
            move.west = true;
            break;
        case "d":
            move.east = true;
            break;
        case "ArrowLeft":
            move.rot_left = true;
            break;
        case "ArrowRight":
            move.rot_right = true;
            break;
        case "ArrowUp":
            move.rot_up = true;
            break;
        case "ArrowDown":
            move.rot_down = true;
            break;
        case " ":
            const direct = calculateDirection(camera)
            projectileList.push(new Projectile(camera.x, -camera.y, camera.z, direct.x * 0.5, -direct.y * 0.5, direct.z * 0.5, 0.1))
            break;
    }
}
)

document.addEventListener("keyup", (event) => {
    const keyName = event.key

    switch (keyName) {
        case "w":
            move.north = false;
            break;
        case "s":
            move.south = false;
            break;
        case "a":
            move.west = false;
            break;
        case "d":
            move.east = false;
            break;
        case " ":
            move.up = false;
            break;
        case "x":
            move.down = false;
            break;
        case "ArrowLeft":
            move.rot_left = false;
            break;
        case "ArrowRight":
            move.rot_right = false;
            break;
        case "ArrowUp":
            move.rot_up = false;
            break;
        case "ArrowDown":
            move.rot_down = false;
            break;
    }
}
)

// For movement
function moveCamera() {
    camera.vx = 0
    camera.vy = 0
    camera.vz = 0

    if (move.north) {
        camera.vz += 0.1
    }
    if (move.south) {
        camera.vz -= 0.1
    }
    if (move.east) {
        camera.vx += 0.1
    }
    if (move.west) {
        camera.vx -= 0.1
    }
    if (move.up) {
        camera.vy -= 0.1
    }
    if (move.down) {
        camera.vy += 0.1
    }
    if (move.rot_left) {
        camera.ay -= 0.75
    }
    if (move.rot_right) {
        camera.ay += 0.75
    }
    if (move.rot_up && camera.ax < 90) {
        camera.ax += 0.75
    }
    if (move.rot_down && camera.ax > -90) {
        camera.ax -= 0.75
    }

    camera.ay = camera.ay % 360
}

// Moves the camera with respect to the angle as well
function moveAngledCamera() {
    let velX = camera.vz * Math.sin(camera.ay * RADIAN) + camera.vx * Math.cos((camera.ay) * RADIAN)
    let velZ = camera.vz * Math.cos(camera.ay * RADIAN) - camera.vx * Math.sin((camera.ay) * RADIAN)
    let velY = camera.vy
    
    // Restricts movement
    if (camera.x + velX > 4.9) {
        velX = 0;
        camera.x = 4.9
    }
    if (camera.x + velX < -4.9) {
        velX = 0;
        camera.x = -4.9
    }
    if (camera.z + velZ > 4.9) {
        velZ = 0;
        camera.z = 4.9
    }
    if (camera.z + velZ < -4.9) {
        velZ = 0;
        camera.z = -4.9
    }
    

    camera.x += velX
    camera.y += velY
    camera.z += velZ
}

//  Clears renderList, puts the faces into the render list
function bufferFaces(vertices, faces) {
    renderList = [];

    for (let i = 0; i < faces.length; i++) {
        const p1 = structuredClone(vertices[faces[i].v1]);
        const p2 = structuredClone(vertices[faces[i].v2]);
        const p3 = structuredClone(vertices[faces[i].v3]);
        renderList.push({
            x1: p1.x, y1: -p1.y, z1: p1.z, w1: 0, 
            x2: p2.x, y2: -p2.y, z2: p2.z, w2: 0,
            x3: p3.x, y3: -p3.y, z3: p3.z, w3: 0,
            color: structuredClone(faces[i].color),
            original: {x1: p1.x, y1: -p1.y, z1: p1.z, 
                x2: p2.x, y2: -p2.y, z2: p2.z,
                x3: p3.x, y3: -p3.y, z3: p3.z}
        })
    }
}

// Adds more vertices onto the renderList based on a mesh
function addMesh(list) {
    renderList = renderList.concat(structuredClone(list))
}

// Butters the projectile list
function bufferProjectiles(list, isComplex) {
    if (!isComplex) {
        for (let i = 0; i < list.length; i++) {
            list[i].bufferProjectileFaces(CUBE, false)
        }
    } else {
        for (let i = 0; i < list.length; i++) {
            list[i].bufferProjectileFaces(sphere, true)
        }
    }
}

// Buffers the target faces
function bufferTargets(list, isComplex) {
    if (isComplex) {
        for (let i = 0; i < list.length; i++) {
            list[i].bufferTargetFaces(sphere, true)
        }
    } else {
        for (let i = 0; i < list.length; i++) {
            list[i].bufferTargetFaces(CUBE, false)
        }
    }
}

//  Updates the projectile list
function updateProjectiles(projList) {
    const newList = []
    
    for (let i = 0; i < projList.length; i++) {
        if (projList[i].y < -20) {
            continue;
        }
         newList.push(projList[i].updateProjectile());
    }

    return newList;
}

// Gives the index of the colliding target number, else return -1
function checkProjectileCollision(proj, list) {
    for (let i = 0; i < list.length; i++) {
        const dist = Math.sqrt(Math.pow(proj.x - list[i].x, 2) + Math.pow(proj.y - list[i].y, 2) + Math.pow(proj.z - list[i].z, 2))
        
        if (dist < proj.size + list[i].size) {
            return i;
        }
    } 

    return -1;
}

// Filters out the projectiles if it comes into collision with a target
function filterProjectilesCollision(projList, targList) {
    let newList = [];
    let filterList = []
    
    for (let i = 0; i < projList.length; i++) {
        const check = checkProjectileCollision(projList[i], targList)

        if (check == -1) {
            newList.push(projList[i])
            continue;
        }
        filterList.push(check)
    }

    return {proj: newList, filter: filterList}
}

function targetCollision(targList, filterList) {
    let newList = []

    for (let i = 0; i < targList.length; i++) {
        if (i == filterList[0]) {
            filterList.shift()
            targList[i].randomLocation();
        }

        newList.push(targList[i])
    }

    return newList;
}

// Translates a triangle based on the camera
function translateTriangle(face) {
    let translateFace = face
    translateFace.x1 -= camera.x
    translateFace.x2 -= camera.x
    translateFace.x3 -= camera.x
    
    translateFace.y1 -= camera.y
    translateFace.y2 -= camera.y
    translateFace.y3 -= camera.y

    translateFace.z1 -= camera.z
    translateFace.z2 -= camera.z
    translateFace.z3 -= camera.z
    return translateFace;
}

// Translates the entire list
function translateList() {
    for (let i = 0; i < renderList.length; i++) {
        renderList[i] = translateTriangle(renderList[i])
    }
}

// Applies the rotation transformation on a single point
function rotatePoint(x, y, z) {
    const rx = (camera.ax * Math.PI) / 180
    const ry = (camera.ay * Math.PI) / 180
    const rz = (camera.az * Math.PI) / 180
    
    return {
        x: Math.cos(ry) * ((Math.sin(rz) * y) + (Math.cos(rz) * x)) - (Math.sin(ry) * z),
        y: Math.sin(rx) * (Math.cos(ry) * z + Math.sin(ry) * ((Math.sin(rz) * y) + (Math.cos(rz) * x))) + Math.cos(rx) * ((Math.cos(rz) * y) - (Math.sin(rz) * x)),
        z: Math.cos(rx) * (Math.cos(ry) * z + Math.sin(ry) * ((Math.sin(rz) * y) + (Math.cos(rz) * x))) - Math.sin(rx) * ((Math.cos(rz) * y) - (Math.sin(rz) * x)),
    };
}

// Applies the rotation transformation on a single triangle
function rotateTri(tri) {
    const rotV1 = rotatePoint(tri.x1, tri.y1, tri.z1)
    const rotV2 = rotatePoint(tri.x2, tri.y2, tri.z2)
    const rotV3 = rotatePoint(tri.x3, tri.y3, tri.z3)

    return {
        x1: rotV1.x,
        y1: rotV1.y,
        z1: rotV1.z,

        x2: rotV2.x,
        y2: rotV2.y,
        z2: rotV2.z,

        x3: rotV3.x,
        y3: rotV3.y,
        z3: rotV3.z,

        color: tri.color,
        original: tri.original
    }
}

// Applies the rotation transformation on the entire list
function rotateList() {
    for (let i = 0; i < renderList.length; i++) {
        renderList[i] = rotateTri(renderList[i])
    }
}

// Finding finding the normal
// 1) Starts with cross product
// 2) Uses dot product to make sure it accounts for the position of the camera
function calcNormal(tri) {
    const line1 = {x: tri.x2 - tri.x1, y: tri.y2 - tri.y1, z: tri.z2 - tri.z1}
    const line2 = {x: tri.x3 - tri.x1, y: tri.y3 - tri.y1, z: tri.z3 - tri.z1}

    let xNormal = line1.y * line2.z - line1.z * line2.y 
    let yNormal = line1.z * line2.x - line1.x * line2.z 
    let zNormal = line1.x * line2.y - line1.y * line2.x

    const len = Math.sqrt((xNormal * xNormal) + (yNormal * yNormal) + (zNormal * zNormal))

    return {
        x: xNormal / len,
        y: yNormal / len,
        z: zNormal / len
    };
}

// Gets how similar two vectors are, dot product
function dotProduct(x1, y1, z1, x2, y2, z2) {
    return (x1 * x2 + y1 * y2 + z1 * z2);
}

// Filters out the entire list based on if the normal is facing away
function backfaceCulling(list) {
    const newList = []
    
    for (let i = 0; i < list.length; i++) {
        const normal = calcNormal(list[i])

        if ((
            normal.x * (list[i].x1) +
            normal.y * (list[i].y1) +
            normal.z * (list[i].z1)) > 0) {
            newList.push(list[i])
        }
    }
    
    return newList;
}

// Projects a single point
function projectPoint(x, y, z) {
    let projX = x * MATRIX3D[0][0]
    let projY = y * MATRIX3D[1][1]
    let projZ = z * MATRIX3D[2][2] + z * MATRIX3D[2][3]

    if (z != 0) {
        projX /= z
        projY /= z
    }

    return {x: projX, y: projY, z: projZ, w: z};
}

// Projects a single triangle
function projectTriangle(tri) {
    const projV1 = projectPoint(tri.x1, tri.y1, tri.z1)
    const projV2 = projectPoint(tri.x2, tri.y2, tri.z2)
    const projV3 = projectPoint(tri.x3, tri.y3, tri.z3)

    return {
        x1: projV1.x,
        y1: projV1.y,
        z1: projV1.z,

        x2: projV2.x,
        y2: projV2.y,
        z2: projV2.z,
        
        x3: projV3.x,
        y3: projV3.y,
        z3: projV3.z,

        color: tri.color,
        original: tri.original
    };
}

// Checks for the amount of outside points based on a plane
function checkOutsidePoints(tri, side) {
    switch (side) {
        case "zNear":
            let outPoints = 0
            if (tri.z1 < fNear) {
                outPoints += 1
            }
            if (tri.z2 < fNear) {
                outPoints += 1
            }
            if (tri.z3 < fNear) {
                outPoints += 1
            }
            return outPoints;
    }
}

// Clips based on a certain plane (assume first point is the one that is not clipping)
function clipLine(x1, z1, x2, z2, plane) {
    let slope = (x1 - x2) / (z1 - z2)
    let dist = z1 - plane

    return {x1: x1, z1: z1, x2: x1 - dist * slope, z2: plane}
}

// Clips with 1 point outside (creates a quad, or two triangles in a list)
function clipDepth1Outside(tri) {
    let tri1 = structuredClone(tri)
    let tri2 = structuredClone(tri)

    if (tri.z3 < fNear) {
        const line1x = clipLine(tri.x1, tri.z1, tri.x3, tri.z3, fNear)
        const line1y = clipLine(tri.y1, tri.z1, tri.y3, tri.z3, fNear)
        const line2x = clipLine(tri.x2, tri.z2, tri.x3, tri.z3, fNear)
        const line2y = clipLine(tri.y2, tri.z2, tri.y3, tri.z3, fNear)

        tri1.x3 = line1x.x2
        tri1.y3 = line1y.x2
        tri1.z3 = line1x.z2

        tri2.x1 = line1x.x2
        tri2.y1 = line1y.x2
        tri2.z1 = line1x.z2

        tri2.x3 = line2x.x2 
        tri2.y3 = line2y.x2
        tri2.z3 = line2x.z2
    } else if (tri.z2 < fNear) {
        const line1x = clipLine(tri.x1, tri.z1, tri.x2, tri.z2, fNear)
        const line1y = clipLine(tri.y1, tri.z1, tri.y2, tri.z2, fNear)
        const line2x = clipLine(tri.x3, tri.z3, tri.x2, tri.z2, fNear)
        const line2y = clipLine(tri.y3, tri.z3, tri.y2, tri.z2, fNear)

        tri1.x2 = line1x.x2
        tri1.y2 = line1y.x2
        tri1.z2 = line1x.z2

        tri2.x1 = line1x.x2
        tri2.y1 = line1y.x2
        tri2.z1 = line1x.z2

        tri2.x2 = line2x.x2 
        tri2.y2 = line2y.x2
        tri2.z2 = line2x.z2
    } else if (tri.z1 < fNear) {
        const line1x = clipLine(tri.x2, tri.z2, tri.x1, tri.z1, fNear)
        const line1y = clipLine(tri.y2, tri.z2, tri.y1, tri.z1, fNear)
        const line2x = clipLine(tri.x3, tri.z3, tri.x1, tri.z1, fNear)
        const line2y = clipLine(tri.y3, tri.z3, tri.y1, tri.z1, fNear)

        tri1.x1 = line1x.x2
        tri1.y1 = line1y.x2
        tri1.z1 = line1x.z2

        tri2.x1 = line2x.x2
        tri2.y1 = line2y.x2
        tri2.z1 = line2x.z2

        tri2.x2 = line1x.x2 
        tri2.y2 = line1y.x2
        tri2.z2 = line1x.z2
    } 

    return [tri1, tri2]
}

// Clips with 2 points outside
function clipDepth2Outside(tri) {
    if (tri.z1 >= fNear) {
        const line1x = clipLine(tri.x1, tri.z1, tri.x2, tri.z2, fNear)
        const line1y = clipLine(tri.y1, tri.z1, tri.y2, tri.z2, fNear)
        const line2x = clipLine(tri.x1, tri.z1, tri.x3, tri.z3, fNear)
        const line2y = clipLine(tri.y1, tri.z1, tri.y3, tri.z3, fNear)

        tri.x2 = line1x.x2
        tri.y2 = line1y.x2
        tri.z2 = line1x.z2

        tri.x3 = line2x.x2
        tri.y3 = line2y.x2
        tri.z3 = line2x.z2
    } else if (tri.z2 >= fNear) {
        const line1x = clipLine(tri.x2, tri.z2, tri.x1, tri.z1, fNear)
        const line1y = clipLine(tri.y2, tri.z2, tri.y1, tri.z1, fNear)
        const line2x = clipLine(tri.x2, tri.z2, tri.x3, tri.z3, fNear)
        const line2y = clipLine(tri.y2, tri.z2, tri.y3, tri.z3, fNear)

        tri.x1 = line1x.x2
        tri.y1 = line1y.x2
        tri.z1 = line1x.z2

        tri.x3 = line2x.x2
        tri.y3 = line2y.x2
        tri.z3 = line2x.z2
    } else if (tri.z3 >= fNear) {
        const line1x = clipLine(tri.x3, tri.z3, tri.x1, tri.z1, fNear)
        const line1y = clipLine(tri.y3, tri.z3, tri.y1, tri.z1, fNear)
        const line2x = clipLine(tri.x3, tri.z3, tri.x2, tri.z2, fNear)
        const line2y = clipLine(tri.y3, tri.z3, tri.y2, tri.z2, fNear)

        tri.x1 = line1x.x2
        tri.y1 = line1y.x2
        tri.z1 = line1x.z2

        tri.x2 = line2x.x2
        tri.y2 = line2y.x2
        tri.z2 = line2x.z2
    }

    return tri;
}

// Clips on the Z depth
function depthClip() {
    let newList = []

    for (let i = 0; i < renderList.length; i++) {
        const outPoints = checkOutsidePoints(renderList[i], "zNear")
        
        switch (outPoints) {
            case 0:
                newList.push(renderList[i]);
                break;
            case 1:
                newList = newList.concat(clipDepth1Outside(renderList[i]));
                break;
            case 2: 
                newList.push(clipDepth2Outside(renderList[i]));
                break;
            case 3:
                break;
        }
    }

    renderList = newList;
    return newList;
}

// Projeccts every single triangle
function projectAll() {
    for (let i = 0; i < renderList.length; i++) {
        renderList[i] = projectTriangle(renderList[i])
    }
}

// Scales the transformed points
function scaleFaces() {
    for (let i = 0; i < renderList.length; i++) {
        renderList[i].x1 *= width
        renderList[i].x2 *= width
        renderList[i].x3 *= width

        renderList[i].y1 *= height
        renderList[i].y2 *= height
        renderList[i].y3 *= height

        renderList[i].x1 += width * 1/2
        renderList[i].x2 += width * 1/2
        renderList[i].x3 += width * 1/2

        renderList[i].y1 += height * 1/2
        renderList[i].y2 += height * 1/2
        renderList[i].y3 += height * 1/2
    }
}

const BRIGHTNESS = 90

// Changes the triangle's color to what color it should be based on the lighting
function calcLighting(tri, light) {
    const normal = calcNormal(tri.original)
    let similarity = dotProduct(normal.x, normal.y, normal.z, light.x, light.y, light.z) / 1.5

    if (similarity < 0.2) {
        similarity = 0.2
    }

    tri.color.r += (BRIGHTNESS)
    tri.color.g += (BRIGHTNESS)
    tri.color.b += (BRIGHTNESS)

    tri.color.r *= (similarity)
    tri.color.g *= (similarity)
    tri.color.b *= (similarity)

    return tri;
}

// Changes the the entire lists's lighting
function lightingList(light) {
    for (let i = 0; i < renderList.length; i++) {
        renderList[i] = calcLighting(renderList[i], light)
    }
}

// Takes in two triangle informations, outputs a number based on how to sort them
function compareZInformation(tri1, tri2) {
    const avgTri1 = (tri1.z1 + tri1.z2 + tri1.z3) / 3
    const avgTri2 = (tri2.z1 + tri2.z2 + tri2.z3) / 3

    if (avgTri1 > avgTri2) {
        return -1;
    } else if (avgTri1 < avgTri2) {
        return 1;
    } else {
        return 0;
    }
}

// Gets a new list based on the average X component of the list
function sortDepthList() {
    renderList.sort(compareZInformation)
}

// Draws a single triangle
function drawTriangle(tri) {
    ctx.beginPath();
    ctx.moveTo(tri.x1, tri.y1);
    ctx.lineTo(tri.x2, tri.y2);
    ctx.lineTo(tri.x3, tri.y3);
    ctx.lineTo(tri.x1, tri.y1);
    ctx.fillStyle = `rgb(${tri.color.r},${tri.color.g},${tri.color.b})`;
    ctx.strokeStyle = `rgb(${tri.color.r},${tri.color.g},${tri.color.b})`;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

// Draws the 3D environment
function drawFaces() {
    for (let i = 0; i < renderList.length; i++) {
        drawTriangle(renderList[i])
    }
}

// Draws the hud 
function drawHUD() {
    ctx.beginPath()
    ctx.strokeStyle = "#00aa00"
    ctx.arc(width / 2, height / 2, 4, 0, 2 * Math.PI)
    ctx.stroke();
    ctx.closePath()
}

// Goes through the entire rendering process
function renderScene() {
    bufferFaces(VERTICES, FACES);
    bufferProjectiles(projectileList, true);
    bufferTargets(targetList, true);
    translateList();
    rotateList();
    renderList = backfaceCulling(renderList)
    depthClip();
    sortDepthList();
    projectAll();
    scaleFaces();
    lightingList(LIGHT);
    drawFaces();
}

// Goes through all the drawing functions
function draw() {
    renderScene();
    drawHUD();
}

// Runs through all input functions
function runInputs() {
    moveCamera();
    moveAngledCamera();
}

// Updates everything
function update() {    
    projectileList = updateProjectiles(projectileList)

    let out = filterProjectilesCollision(projectileList, targetList)
    projectileList = out.proj
    targetList = targetCollision(targetList, out.filter)
}

// Main loop
function main() {
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillStyle = `rgb(${255},${255},${255})`;
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = `rgb(${0},${0},${0})`;
    runInputs()
    update();
    draw();
}

setInterval(main, 16.667)