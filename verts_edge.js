const VERTICES = [
    // For a cube
    {x: -0.5, y: -0.5, z: -0.5}, // 0
    {x: 0.5, y: -0.5, z: -0.5}, // 1
    {x: -0.5, y: 0.5, z: -0.5}, // 2
    {x: 0.5, y: 0.5, z: -0.5}, // 3
    {x: -0.5, y: -0.5, z: 0.5}, // 4
    {x: 0.5, y: -0.5, z: 0.5}, // 5
    {x: -0.5, y: 0.5, z: 0.5}, // 6
    {x: 0.5, y: 0.5, z: 0.5}, // 7
    
    // For the floor
    {x: -5, y: -1, z: -5}, // 8
    {x: 5, y: -1, z: -5}, // 9
    {x: -5, y: -1, z: 5}, // 10
    {x: 5, y: -1, z: 5}, // 11

    // For a wall
    {x: -5, y: -1, z: -5}, // 12
    {x: 5, y: -1, z: -5}, // 13
    {x: 5, y: -0.5, z: -5}, // 14
    {x: -5, y: -0.5, z: -5}, // 15

    // For a wall
    {x: -5, y: -1, z: -5}, // 16
    {x: -5, y: -1, z: 5}, // 17
    {x: -5, y: -0.5, z: 5}, // 18
    {x: -5, y: -0.5, z: -5}, // 19

    // For a wall
    {x: 5, y: -1, z: 5}, // 20
    {x: -5, y: -1, z: 5}, // 21
    {x: -5, y: -0.5, z: 5}, // 22
    {x: 5, y: -0.5, z: 5}, // 23

    // For a wall
    {x: 5, y: -1, z: 5}, // 24
    {x: 5, y: -1, z: -5}, // 25
    {x: 5, y: -0.5, z: -5}, // 26
    {x: 5, y: -0.5, z: 5}, // 27
]

const CUBE = [
    // FOR CUBE
    // Front Face
    {v1: 0, v2: 3, v3: 1, color: {r: 200, g: 0, b: 0}},
    {v1: 0, v2: 2, v3: 3, color: {r: 200, g: 0, b: 0}},
    // Left Face
    {v1: 4, v2: 6, v3: 2, color: {r: 200, g: 0, b: 0}},
    {v1: 4, v2: 2, v3: 0, color: {r: 200, g: 0, b: 0}},
    // Right Face
    {v1: 1, v2: 7, v3: 5, color: {r: 200, g: 0, b: 0}},
    {v1: 1, v2: 3, v3: 7, color: {r: 200, g: 0, b: 0}},
    // Back Face
    {v1: 5, v2: 6, v3: 4, color: {r: 200, g: 0, b: 0}},
    {v1: 5, v2: 7, v3: 6, color: {r: 200, g: 0, b: 0}},
    // Top Face
    {v1: 2, v2: 7, v3: 3, color: {r: 200, g: 0, b: 0}},
    {v1: 2, v2: 6, v3: 7, color: {r: 200, g: 0, b: 0}},
    // Bottom Face
    {v1: 1, v2: 4, v3: 0, color: {r: 200, g: 0, b: 0}},
    {v1: 1, v2: 5, v3: 4, color: {r: 200, g: 0, b: 0}},
]

const FACES = [
    // FOR A PLANE
    {v1: 8, v2: 10, v3: 11, color: {r: 200, g: 200, b: 200}},
    {v1: 8, v2: 11, v3: 9, color: {r: 200, g: 200, b: 200}},
    // FOR A PLANE
    {v1: 12, v2: 13, v3: 14, color: {r: 200, g: 200, b: 200}},
    {v1: 12, v2: 14, v3: 15, color: {r: 200, g: 200, b: 200}},
    // FOR A PLANE
    {v1: 16, v2: 18, v3: 17, color: {r: 200, g: 200, b: 200}},
    {v1: 16, v2: 19, v3: 18, color: {r: 200, g: 200, b: 200}},
    // FOR A PLANE
    {v1: 20, v2: 21, v3: 22, color: {r: 200, g: 200, b: 200}},
    {v1: 20, v2: 22, v3: 23, color: {r: 200, g: 200, b: 200}},
    // FOR A PLANE
    {v1: 24, v2: 26, v3: 25, color: {r: 200, g: 200, b: 200}},
    {v1: 24, v2: 27, v3: 26, color: {r: 200, g: 200, b: 200}},
]

//  Converts a list from face points to precise vertices
function faceToVerts(faces, vertices) {
    let newList = [];

    for (let i = 0; i < faces.length; i++) {
        const p1 = structuredClone(vertices[faces[i].v1]);
        const p2 = structuredClone(vertices[faces[i].v2]);
        const p3 = structuredClone(vertices[faces[i].v3]);
        newList.push({
            x1: p1.x, y1: -p1.y, z1: p1.z, w1: 0, 
            x2: p2.x, y2: -p2.y, z2: p2.z, w2: 0,
            x3: p3.x, y3: -p3.y, z3: p3.z, w3: 0,
            color: structuredClone(faces[i].color),
            original: {x1: p1.x, y1: -p1.y, z1: p1.z, 
                x2: p2.x, y2: -p2.y, z2: p2.z,
                x3: p3.x, y3: -p3.y, z3: p3.z}
        })
    }

    return newList;
}

// Inputs a list of faces with the vertices, subdivides to create an object with more vertices / higher resolution
function subdivide(vertices) {
    let newList = []

    for (let i = 0; i < vertices.length; i++) {
    const p1 = {
        x: (vertices[i].x1 + vertices[i].x2) / 2,
        y: (vertices[i].y1 + vertices[i].y2) / 2,
        z: (vertices[i].z1 + vertices[i].z2) / 2
    }
        
    const p2 = {
        x: (vertices[i].x1 + vertices[i].x3) / 2,
        y: (vertices[i].y1 + vertices[i].y3) / 2,
        z: (vertices[i].z1 + vertices[i].z3) / 2
    }

    const p3 = {
        x: (vertices[i].x2 + vertices[i].x3) / 2,
        y: (vertices[i].y2 + vertices[i].y3) / 2,
        z: (vertices[i].z2 + vertices[i].z3) / 2
    }

    const tri1 = {
        x1: vertices[i].x1, y1: vertices[i].y1, z1: vertices[i].z1, w1: 0,
        x2: p1.x, y2: p1.y, z2: p1.z, w2: 0,
        x3: p2.x, y3: p2.y, z3: p2.z, w3: 0,
        color: structuredClone(vertices[i].color),
        original: {
            x1: vertices[i].x1, y1: vertices[i].y1, z1: vertices[i].z1,
            x2: p1.x, y2: p1.y, z2: p1.z,
            x3: p2.x, y3: p2.y, z3: p2.z,}
    }

    const tri2 = {
        x1: vertices[i].x2, y1: vertices[i].y2, z1: vertices[i].z2, w1: 0,
        x2: p3.x, y2: p3.y, z2: p3.z, w2: 0,
        x3: p1.x, y3: p1.y, z3: p1.z, w3: 0,
        color: structuredClone(vertices[i].color),
        original: {
            x1: vertices[i].x2, y1: vertices[i].y2, z1: vertices[i].z2,
            x2: p3.x, y2: p3.y, z2: p3.z,
            x3: p1.x, y3: p1.y, z3: p1.z,
        }
    }

    const tri3 = {
        x1: vertices[i].x3, y1: vertices[i].y3, z1: vertices[i].z3, w1: 0,
        x2: p2.x, y2: p2.y, z2: p2.z, w2: 0,
        x3: p3.x, y3: p3.y, z3: p3.z, w3: 0,
        color: structuredClone(vertices[i].color),
        original: {
            x1: vertices[i].x3, y1: vertices[i].y3, z1: vertices[i].z3,
            x2: p2.x, y2: p2.y, z2: p2.z,
            x3: p3.x, y3: p3.y, z3: p3.z,
        }
    }

    const tri4 = {
        x1: p1.x, y1: p1.y, z1: p1.z, w1: 0,
        x2: p3.x, y2: p3.y, z2: p3.z, w2: 0,
        x3: p2.x, y3: p2.y, z3: p2.z, w3: 0,
        color: structuredClone(vertices[i].color),
        original: {
            x1: p1.x, y1: p1.y, z1: p1.z,
            x2: p3.x, y2: p3.y, z2: p3.z,
            x3: p2.x, y3: p2.y, z3: p2.z,
        }
    }

    newList.push(tri1, tri2, tri3, tri4)
    }

    return newList;
}

// Converts points to a radius on a sphere
function pointToRadius(x, y, z, ox, oy, oz, r = 1) {
    const dist = Math.sqrt(Math.pow(x - ox, 2) + Math.pow(y - oy, 2) + Math.pow(z - oz, 2))

    return {x: x / dist, y: y / dist, z: z / dist}
}

// Converts a mesh (square) to a sphere
function toSphere(mesh, origin) {
    for (let i = 0; i < mesh.length; i++) {
        const p1 = pointToRadius(mesh[i].x1, mesh[i].y1, mesh[i].z1, origin.x, origin.y, origin.z)
        const p2 = pointToRadius(mesh[i].x2, mesh[i].y2, mesh[i].z2, origin.x, origin.y, origin.z)
        const p3 = pointToRadius(mesh[i].x3, mesh[i].y3, mesh[i].z3, origin.x, origin.y, origin.z)

        mesh[i].x1 = p1.x
        mesh[i].y1 = p1.y
        mesh[i].z1 = p1.z

        mesh[i].x2 = p2.x
        mesh[i].y2 = p2.y
        mesh[i].z2 = p2.z
        
        mesh[i].x3 = p3.x
        mesh[i].y3 = p3.y
        mesh[i].z3 = p3.z

        mesh[i].original = {
            x1: p1.x, x2: p2.x, x3: p3.x, 
            y1: p1.y, y2: p2.y, y3: p3.y, 
            z1: p1.z, z2: p2.z, z3: p3.z}
    }

    return mesh;
}

const sphere = toSphere(subdivide(faceToVerts(CUBE, VERTICES)), {x: 0, y: 0, z: 0})