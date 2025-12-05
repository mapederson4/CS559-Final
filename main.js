// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6B8E9E);
window.scene = scene;

// FOG FOR PERFORMANCE
scene.fog = new THREE.Fog(0x6B8E9E, 15, 45);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer with performance settings
const renderer = new THREE.WebGLRenderer({ 
    antialias: false,
    powerPreference: "high-performance",
    precision: "lowp"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// SINGLE LIGHT ONLY
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.85);
scene.add(ambientLight);

// === SNOW GROUND TEXTURE ===
function createSnowGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add sparkles
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 2;
        const brightness = 240 + Math.random() * 15;
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 5})`;
        ctx.fillRect(x, y, size, size);
    }
    
    // Add shadows
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 8 + 2;
        ctx.fillStyle = `rgba(180, 200, 220, ${Math.random() * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
}

// Ground with texture
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xE0EBF5,
    fog: true
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
window.ground = ground;

// Apply texture immediately
ground.material.map = createSnowGroundTexture();
ground.material.needsUpdate = true;

// MINIMAL SNOWFALL
const snowflakes = [];
const snowflakeCount = 30;

const snowGeometry = new THREE.SphereGeometry(0.1, 3, 3);
const snowMaterial = new THREE.MeshBasicMaterial({
    color: 0xF0F8FF,
    transparent: true,
    opacity: 0.8,
    fog: true
});

for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = new THREE.Mesh(snowGeometry, snowMaterial);
    
    snowflake.position.x = Math.random() * 50 - 25;
    snowflake.position.y = Math.random() * 20 + 5;
    snowflake.position.z = Math.random() * 50 - 25;
    
    snowflake.userData = {
        fallSpeed: 0.05 + Math.random() * 0.02,
        driftSpeed: (Math.random() - 0.5) * 0.02
    };
    
    snowflakes.push(snowflake);
    scene.add(snowflake);
}

// Create characters and buildings
const player = ElsaCharacter.create(scene);
player.rotation.y = Math.PI;
window.player = player;
window.elsa = ElsaCharacter;

const reindeer = ReindeerCharacter.create(scene, 8, -6);
window.reindeer = ReindeerCharacter;

const olaf = OlafCharacter.create(scene, -8, 3);
window.olaf = OlafCharacter;

const iceCastle = IceCastle.create(scene, 0, -30);
window.iceCastleInstance = iceCastle;

const penguinHill = PenguinHill.create(scene, 15, 15);
window.penguinHillInstance = penguinHill;

Collectibles.init(scene, player);
window.collectibles = Collectibles;

IceMonsters.init(scene, player, { x: 0, z: -30 });
window.iceMonsters = IceMonsters;

let collisionObjects = [];
window.collisionObjects = collisionObjects;

// === IMPROVED COLLISION SYSTEM ===
const reservedZones = [
    { x: 0, z: 0, radius: 4 },      // Player spawn - larger
    { x: 0, z: -30, radius: 14 },   // Ice castle - larger
    { x: 15, z: 15, radius: 7 },    // Penguin hill - larger
    { x: 8, z: -6, radius: 4 },     // Reindeer - larger
    { x: -8, z: 3, radius: 4 }      // Olaf - larger
];

// Track all placed object positions for better spacing
const placedPositions = [];

function isPositionValid(x, z, radius, minDistanceToOthers = 3) {
    // Check reserved zones with extra padding
    for (const zone of reservedZones) {
        const dx = x - zone.x;
        const dz = z - zone.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < zone.radius + radius + 2) return false; // Extra 2 unit padding
    }
    
    // Check existing collision objects
    for (const obj of collisionObjects) {
        if (!obj.userData.collision) continue;
        const col = obj.userData.collision;
        const dx = x - col.x;
        const dz = z - col.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < col.radius + radius + minDistanceToOthers) return false;
    }
    
    // Check against all placed positions
    for (const pos of placedPositions) {
        const dx = x - pos.x;
        const dz = z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDistanceToOthers) return false;
    }
    
    return true;
}

// === DECORATIVE OBJECTS ===

// Ice Crystal
function createIceCrystal(x, z, scale = 1) {
    const crystalGroup = new THREE.Group();
    
    const crystalMaterial = new THREE.MeshBasicMaterial({
        color: 0xB0E0E6,
        transparent: true,
        opacity: 0.7,
        fog: true
    });

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.8, 6),
            crystalMaterial
        );
        spike.position.set(Math.cos(angle) * 0.3, 0.4, Math.sin(angle) * 0.3);
        spike.rotation.z = Math.PI / 3;
        const rotAxis = new THREE.Vector3(Math.cos(angle + Math.PI / 2), 0, Math.sin(angle + Math.PI / 2));
        spike.rotateOnAxis(rotAxis, Math.PI / 6);
        crystalGroup.add(spike);
    }

    const centerSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 1.2, 6),
        crystalMaterial
    );
    centerSpike.position.y = 0.6;
    crystalGroup.add(centerSpike);

    crystalGroup.position.set(x, 0, z);
    crystalGroup.scale.multiplyScalar(scale);
    crystalGroup.userData.collision = { type: 'circle', radius: 0.5 * scale, x, z };
    return crystalGroup;
}

// Lamp Post - Brighter and more visible
function createLampPost(x, z) {
    const lampGroup = new THREE.Group();

    const postMaterial = new THREE.MeshBasicMaterial({ color: 0x3A3A3A, fog: true });
    const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 4.5, 8),
        postMaterial
    );
    post.position.y = 2.25;
    lampGroup.add(post);

    const housingMaterial = new THREE.MeshBasicMaterial({ color: 0x2A2A2A, fog: true });
    const lampHousing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 0.6, 8),
        housingMaterial
    );
    lampHousing.position.y = 4.7;
    lampGroup.add(lampHousing);

    // Brighter lamp
    const lampMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFF4D6,
        fog: true
    });
    const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 12, 12),
        lampMaterial
    );
    lamp.position.y = 4.7;
    lampGroup.add(lamp);

    // Add glow effect with additional spheres
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFE4A0,
        transparent: true,
        opacity: 0.4,
        fog: true
    });
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 12, 12),
        glowMaterial
    );
    glow.position.y = 4.7;
    lampGroup.add(glow);

    lampGroup.position.set(x, 0, z);
    lampGroup.userData.collision = { type: 'circle', radius: 0.5, x, z };
    return lampGroup;
}

// Snow Rock
function createSnowRock(x, z, scale = 1) {
    const rockGroup = new THREE.Group();

    const rockMaterial = new THREE.MeshBasicMaterial({ color: 0x707070, fog: true });
    const rock = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 8, 6),
        rockMaterial
    );
    rock.scale.set(1, 0.6, 0.8);
    rockGroup.add(rock);

    const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFAFA, fog: true });
    const snowCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 8, 6),
        snowMaterial
    );
    snowCap.scale.set(1, 0.3, 0.8);
    snowCap.position.y = 0.3;
    rockGroup.add(snowCap);

    rockGroup.position.set(x, 0, z);
    rockGroup.scale.multiplyScalar(scale);
    rockGroup.userData.collision = { type: 'circle', radius: 0.7 * scale, x, z };
    return rockGroup;
}

// Wooden Bench
function createBench(x, z, rotation = 0) {
    const benchGroup = new THREE.Group();
    const woodMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, fog: true });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.4), woodMaterial);
    seat.position.y = 0.5;
    benchGroup.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 0.1), woodMaterial);
    backrest.position.set(0, 0.8, -0.15);
    benchGroup.add(backrest);

    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), woodMaterial);
        leg.position.set((i % 2) * 1.2 - 0.6, 0.25, Math.floor(i / 2) * 0.3 - 0.15);
        benchGroup.add(leg);
    }

    const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFAFA, fog: true });
    const snow = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.4), snowMaterial);
    snow.position.set(0, 0.55, 0);
    benchGroup.add(snow);

    benchGroup.position.set(x, 0, z);
    benchGroup.rotation.y = rotation;
    benchGroup.userData.collision = { type: 'circle', radius: 1.2, x, z };
    return benchGroup;
}

// Snow-covered Pine Tree (not Christmas tree)
function createSnowPine(x, z, scale = 1) {
    const pineGroup = new THREE.Group();
    
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x3D2817, fog: true });
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 2, 6),
        trunkMaterial
    );
    trunk.position.y = 1;
    pineGroup.add(trunk);
    
    const pineMaterial = new THREE.MeshBasicMaterial({ color: 0x1A4D2E, fog: true });
    const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xF0F8FF, fog: true });
    
    const layers = [
        { y: 2.2, pineR: 1.2, snowR: 1.25, h: 1.5 },
        { y: 3.3, pineR: 0.9, snowR: 0.95, h: 1.3 },
        { y: 4.2, pineR: 0.6, snowR: 0.65, h: 1.1 }
    ];
    
    layers.forEach(layer => {
        const branch = new THREE.Mesh(
            new THREE.ConeGeometry(layer.pineR, layer.h, 6),
            pineMaterial
        );
        branch.position.y = layer.y;
        pineGroup.add(branch);
        
        const snow = new THREE.Mesh(
            new THREE.ConeGeometry(layer.snowR, layer.h * 0.4, 6),
            snowMaterial
        );
        snow.position.y = layer.y + layer.h * 0.4;
        pineGroup.add(snow);
    });
    
    pineGroup.position.set(x, 0, z);
    pineGroup.scale.multiplyScalar(scale);
    pineGroup.userData.collision = { type: 'circle', radius: 1.3 * scale, x, z };
    return pineGroup;
}

// Frozen Fountain
function createFrozenFountain(x, z) {
    const fountainGroup = new THREE.Group();
    
    const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xB0C4DE, fog: true });
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.8, 0.4, 8),
        baseMaterial
    );
    base.position.y = 0.2;
    fountainGroup.add(base);
    
    const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.2, 1.5, 8),
        baseMaterial
    );
    pedestal.position.y = 1.15;
    fountainGroup.add(pedestal);
    
    const iceMaterial = new THREE.MeshBasicMaterial({
        color: 0xCCE7FF,
        transparent: true,
        opacity: 0.8,
        fog: true
    });
    
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const icicle = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.8, 6),
            iceMaterial
        );
        icicle.position.set(
            Math.cos(angle) * 0.7,
            1.5,
            Math.sin(angle) * 0.7
        );
        icicle.rotation.x = Math.PI;
        fountainGroup.add(icicle);
    }
    
    const topIce = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 8, 8),
        iceMaterial
    );
    topIce.position.y = 2;
    fountainGroup.add(topIce);
    
    fountainGroup.position.set(x, 0, z);
    fountainGroup.userData.collision = { type: 'circle', radius: 2, x, z };
    return fountainGroup;
}

// Snowman
function createSnowman(x, z) {
    const snowmanGroup = new THREE.Group();
    const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFAFA, fog: true });
    
    const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), snowMaterial);
    bottom.position.y = 0.6;
    bottom.scale.set(1, 0.9, 1);
    snowmanGroup.add(bottom);
    
    const middle = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), snowMaterial);
    middle.position.y = 1.35;
    middle.scale.set(1, 0.95, 1);
    snowmanGroup.add(middle);
    
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), snowMaterial);
    head.position.y = 1.95;
    snowmanGroup.add(head);
    
    const coalMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, fog: true });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), coalMaterial);
    eye1.position.set(-0.1, 2.05, 0.25);
    snowmanGroup.add(eye1);
    
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), coalMaterial);
    eye2.position.set(0.1, 2.05, 0.25);
    snowmanGroup.add(eye2);
    
    const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6347, fog: true });
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 6), noseMaterial);
    nose.position.set(0, 1.95, 0.3);
    nose.rotation.x = Math.PI / 2;
    snowmanGroup.add(nose);
    
    snowmanGroup.position.set(x, 0, z);
    snowmanGroup.userData.collision = { type: 'circle', radius: 0.7, x, z };
    return snowmanGroup;
}

// Ice Arch
function createIceArch(x, z, rotation = 0) {
    const archGroup = new THREE.Group();
    const iceMaterial = new THREE.MeshBasicMaterial({
        color: 0xB0E0E6,
        transparent: true,
        opacity: 0.85,
        fog: true
    });
    
    const leftPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 3.5, 0.6),
        iceMaterial
    );
    leftPillar.position.set(-1.5, 1.75, 0);
    archGroup.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 3.5, 0.6),
        iceMaterial
    );
    rightPillar.position.set(1.5, 1.75, 0);
    archGroup.add(rightPillar);
    
    const archTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 3.6, 8),
        iceMaterial
    );
    archTop.position.y = 3.5;
    archTop.rotation.z = Math.PI / 2;
    archGroup.add(archTop);
    
    const sparkles = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xE0FFFF, fog: true })
    );
    sparkles.position.y = 4.2;
    archGroup.add(sparkles);
    
    archGroup.position.set(x, 0, z);
    archGroup.rotation.y = rotation;
    archGroup.userData.collision = { type: 'circle', radius: 2.2, x, z };
    return archGroup;
}

// OPTIMIZED TREE
const sharedTrunkGeometry = new THREE.CylinderGeometry(0.18, 0.25, 1.5, 4);
const sharedTrunkMaterial = new THREE.MeshBasicMaterial({ color: 0x3D2817, fog: true });
const sharedTreeMaterial = new THREE.MeshBasicMaterial({ color: 0x14381E, fog: true });
const sharedStarGeometry = new THREE.SphereGeometry(0.22, 3, 3);
const sharedStarMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700, fog: true });

const sharedConeGeometries = [
    new THREE.ConeGeometry(1.6, 2.0, 4),
    new THREE.ConeGeometry(1.3, 1.7, 4),
    new THREE.ConeGeometry(1.0, 1.4, 4),
    new THREE.ConeGeometry(0.7, 1.1, 4)
];

function createChristmasTree(x, z) {
    const treeGroup = new THREE.Group();
    
    const trunk = new THREE.Mesh(sharedTrunkGeometry, sharedTrunkMaterial);
    trunk.position.y = 0.75;
    treeGroup.add(trunk);
    
    const conePositions = [2.0, 3.2, 4.3, 5.2];
    conePositions.forEach((y, index) => {
        const treeCone = new THREE.Mesh(sharedConeGeometries[index], sharedTreeMaterial);
        treeCone.position.y = y;
        treeGroup.add(treeCone);
    });
    
    const star = new THREE.Mesh(sharedStarGeometry, sharedStarMaterial);
    star.position.y = 6.2;
    treeGroup.add(star);
    
    treeGroup.position.set(x, 0, z);
    treeGroup.userData.collision = { type: 'circle', radius: 1.8, x, z };
    
    return treeGroup;
}

// === PLACE ALL OBJECTS WITH BETTER SPACING ===
const trees = [];
const decorativeObjects = [];

// Place Christmas trees in strategic locations (fewer, more special)
const christmasTreePositions = [
    { x: -10, z: -8 },
    { x: 10, z: -10 },
    { x: -12, z: 8 },
    { x: 12, z: 10 }
];

christmasTreePositions.forEach(pos => {
    if (isPositionValid(pos.x, pos.z, 1.8, 5)) {
        const tree = createChristmasTree(pos.x, pos.z);
        tree.userData.distanceFromPlayer = 0;
        scene.add(tree);
        trees.push(tree);
        collisionObjects.push(tree);
        placedPositions.push({ x: pos.x, z: pos.z });
    }
});

// Place snow-covered pine trees in rings (natural forest feel)
const pineRings = [
    { radius: 18, count: 8 },
    { radius: 28, count: 10 },
    { radius: 38, count: 9 }
];

pineRings.forEach(ring => {
    const angleStep = (Math.PI * 2) / ring.count;
    for (let i = 0; i < ring.count; i++) {
        const angle = i * angleStep + (Math.random() - 0.5) * 0.4;
        const distance = ring.radius + (Math.random() - 0.5) * 3;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        if (isPositionValid(x, z, 1.3, 4) && z > -22) {
            const scale = 0.8 + Math.random() * 0.5;
            const pine = createSnowPine(x, z, scale);
            pine.userData.distanceFromPlayer = 0;
            scene.add(pine);
            trees.push(pine);
            collisionObjects.push(pine);
            placedPositions.push({ x, z });
        }
    }
});

// Place frozen fountains (2 focal points)
const fountainPositions = [
    { x: -18, z: 5 },
    { x: 18, z: -8 }
];

fountainPositions.forEach(pos => {
    if (isPositionValid(pos.x, pos.z, 2, 5)) {
        const fountain = createFrozenFountain(pos.x, pos.z);
        scene.add(fountain);
        decorativeObjects.push(fountain);
        collisionObjects.push(fountain);
        placedPositions.push({ x: pos.x, z: pos.z });
    }
});

// Place ice arches (2 gateway-like structures)
const archPositions = [
    { x: 0, z: 18, rot: 0 },
    { x: -22, z: -12, rot: Math.PI / 3 }
];

archPositions.forEach(pos => {
    if (isPositionValid(pos.x, pos.z, 2.2, 5)) {
        const arch = createIceArch(pos.x, pos.z, pos.rot);
        scene.add(arch);
        decorativeObjects.push(arch);
        collisionObjects.push(arch);
        placedPositions.push({ x: pos.x, z: pos.z });
    }
});

// Place lamp posts strategically around the world
const lampPositions = [
    { angle: 0.3, dist: 20 },
    { angle: 1.8, dist: 22 },
    { angle: 3.2, dist: 25 },
    { angle: 4.7, dist: 23 },
    { angle: 5.5, dist: 21 }
];

lampPositions.forEach(pos => {
    const x = Math.cos(pos.angle) * pos.dist;
    const z = Math.sin(pos.angle) * pos.dist;
    
    if (isPositionValid(x, z, 0.5, 4)) {
        const lamp = createLampPost(x, z);
        scene.add(lamp);
        decorativeObjects.push(lamp);
        collisionObjects.push(lamp);
        placedPositions.push({ x, z });
    }
});

// Place benches in cozy spots
const benchPositions = [
    { angle: 0.8, dist: 24, rot: 2.4 },
    { angle: 2.5, dist: 26, rot: 5.5 },
    { angle: 4.2, dist: 25, rot: 1.2 },
    { angle: 5.8, dist: 23, rot: 3.0 }
];

benchPositions.forEach(pos => {
    const x = Math.cos(pos.angle) * pos.dist;
    const z = Math.sin(pos.angle) * pos.dist;
    
    if (isPositionValid(x, z, 1.2, 4)) {
        const bench = createBench(x, z, pos.rot);
        scene.add(bench);
        decorativeObjects.push(bench);
        collisionObjects.push(bench);
        placedPositions.push({ x, z });
    }
});

// Place snowmen scattered around (friendly winter characters)
for (let i = 0; i < 6; i++) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 40) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 14 + Math.random() * 26;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        if (isPositionValid(x, z, 0.7, 4)) {
            const snowman = createSnowman(x, z);
            scene.add(snowman);
            decorativeObjects.push(snowman);
            collisionObjects.push(snowman);
            placedPositions.push({ x, z });
            placed = true;
        }
        attempts++;
    }
}

// Place ice crystals scattered around (magical feel)
for (let i = 0; i < 12; i++) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 40) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 12 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        if (isPositionValid(x, z, 0.5, 3)) {
            const crystal = createIceCrystal(x, z, 0.9 + Math.random() * 0.3);
            scene.add(crystal);
            decorativeObjects.push(crystal);
            collisionObjects.push(crystal);
            placedPositions.push({ x, z });
            placed = true;
        }
        attempts++;
    }
}

// Place rocks for natural terrain variation
for (let i = 0; i < 10; i++) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 40) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 14 + Math.random() * 28;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        if (isPositionValid(x, z, 0.7, 3)) {
            const rock = createSnowRock(x, z, 0.9 + Math.random() * 0.4);
            scene.add(rock);
            decorativeObjects.push(rock);
            collisionObjects.push(rock);
            placedPositions.push({ x, z });
            placed = true;
        }
        attempts++;
    }
}

window.trees = trees;
window.decorativeObjects = decorativeObjects;

// Add main object collisions
if (penguinHill) {
    penguinHill.userData.collision = { type: 'circle', radius: 5, x: 15, z: 15 };
    window.collisionObjects.push(penguinHill);
}

if (iceCastle) {
    iceCastle.userData.collision = { type: 'circle', radius: 11, x: 0, z: -30 };
    window.collisionObjects.push(iceCastle);
}

// Optimized collision check
function checkCollision(newX, newZ) {
    const objects = window.collisionObjects;
    const len = objects.length;
    const playerRadius = 0.5;
    
    for (let i = 0; i < len; i++) {
        const obj = objects[i];
        if (!obj.userData.collision) continue;
        const collision = obj.userData.collision;
        if (collision.type === 'circle') {
            const dx = newX - collision.x;
            const dz = newZ - collision.z;
            const distSq = dx * dx + dz * dz;
            const minDistSq = (collision.radius + playerRadius) ** 2;
            if (distSq < minDistSq) return true;
        }
    }
    return false;
}

// Movement
const moveSpeed = 0.1;
const keys = {};
let cameraAngle = Math.PI;
const cameraDistance = 10;
const cameraHeight = 5;

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    const currentWorld = window.gameManager ? window.gameManager.currentWorld : 'winter';
    
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (currentWorld === 'spring' && window.SpringMonsters) {
            SpringMonsters.shootFlowerBlast();
        } else if (window.iceMonsters) {
            IceMonsters.shootIceBlast();
        }
    }
    
    if (e.key === 'j' || e.key === 'J') {
        if (currentWorld === 'winter' && window.iceMonsters) {
            IceMonsters.playerJump();
        }
    }
    
    if (e.key === 'r' || e.key === 'R') {
        if (currentWorld === 'winter' && window.iceMonsters && !IceMonsters.playerAlive) {
            IceMonsters.respawn();
        } else if (currentWorld === 'spring' && window.SpringMonsters && !SpringMonsters.playerAlive) {
            window.gameManager.restartWorld();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Touch controls
const buttons = {
    up: document.getElementById('up'),
    down: document.getElementById('down'),
    left: document.getElementById('left'),
    right: document.getElementById('right')
};

Object.entries(buttons).forEach(([dir, btn]) => {
    if (!btn) return;
    btn.addEventListener('mousedown', () => keys[dir] = true);
    btn.addEventListener('mouseup', () => keys[dir] = false);
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[dir] = true;
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[dir] = false;
    });
});

// AGGRESSIVE CULLING
const RENDER_DISTANCE = 35;
let frameCount = 0;

function updateVisibility() {
    if (frameCount % 20 !== 0) return;
    
    const px = player.position.x;
    const pz = player.position.z;
    const distSq = RENDER_DISTANCE * RENDER_DISTANCE;
    
    for (let i = 0; i < trees.length; i++) {
        const tree = trees[i];
        const dx = tree.position.x - px;
        const dz = tree.position.z - pz;
        tree.visible = (dx * dx + dz * dz) < distSq;
    }
    
    for (let i = 0; i < decorativeObjects.length; i++) {
        const obj = decorativeObjects[i];
        const dx = obj.position.x - px;
        const dz = obj.position.z - pz;
        obj.visible = (dx * dx + dz * dz) < distSq;
    }
}

function updatePlayer() {
    if (keys['q']) cameraAngle += 0.03;
    if (keys['e']) cameraAngle -= 0.03;
    
    const moveForward = new THREE.Vector3(Math.sin(cameraAngle), 0, Math.cos(cameraAngle));
    const moveRight = new THREE.Vector3(Math.cos(cameraAngle), 0, -Math.sin(cameraAngle));
    
    const currentX = player.position.x;
    const currentZ = player.position.z;
    let newX = currentX;
    let newZ = currentZ;
    
    if (keys['w'] || keys['arrowup'] || keys['up']) {
        newX += moveForward.x * moveSpeed;
        newZ += moveForward.z * moveSpeed;
        player.rotation.y = -cameraAngle;
    }
    if (keys['s'] || keys['arrowdown'] || keys['down']) {
        newX -= moveForward.x * moveSpeed;
        newZ -= moveForward.z * moveSpeed;
        player.rotation.y = -cameraAngle + Math.PI;
    }
    if (keys['a'] || keys['arrowleft'] || keys['left']) {
        newX += moveRight.x * moveSpeed;
        newZ += moveRight.z * moveSpeed;
        player.rotation.y = -cameraAngle + Math.PI / 2;
    }
    if (keys['d'] || keys['arrowright'] || keys['right']) {
        newX -= moveRight.x * moveSpeed;
        newZ -= moveRight.z * moveSpeed;
        player.rotation.y = -cameraAngle - Math.PI / 2;
    }

    if (!checkCollision(newX, newZ)) {
        player.position.x = newX;
        player.position.z = newZ;
    }
    
    player.position.x = Math.max(-48, Math.min(48, player.position.x));
    player.position.z = Math.max(-48, Math.min(48, player.position.z));

    camera.position.x = player.position.x - Math.sin(cameraAngle) * cameraDistance;
    camera.position.y = player.position.y + cameraHeight;
    camera.position.z = player.position.z - Math.cos(cameraAngle) * cameraDistance;
    camera.lookAt(player.position);
    
    if (window.gameManager && window.gameManager.currentWorld === 'spring') {
        if (window.SpringMonsters) SpringMonsters.update();
    } else {
        ElsaCharacter.update();
        ReindeerCharacter.update();
        OlafCharacter.update();
        IceCastle.update();
        PenguinHill.update();
        IceMonsters.update();
        Collectibles.update();
        
        Collectibles.checkCollision(
            player.position,
            () => {
                IceMonsters.playerHealth = Math.min(
                    IceMonsters.playerMaxHealth,
                    IceMonsters.playerHealth + 25
                );
                IceMonsters.updateHealthBar();
            },
            () => {
                player.speedBoost = true;
                setTimeout(() => { player.speedBoost = false; }, 10000);
            },
            (count, unlocked) => {
                IceMonsters.updateScore();
                if (unlocked) IceMonsters.specialAbilityActive = true;
            }
        );
    }
}

function animate() {
    requestAnimationFrame(animate);
    frameCount++;
    
    updatePlayer();
    updateVisibility();
    
    if (window.gameManager && window.gameManager.currentWorld === 'spring') {
        SpringWorld.update(player.position);
    } else {
        // Update snow every 4th frame only
        if (frameCount % 4 === 0) {
            const px = player.position.x;
            const pz = player.position.z;
            
            for (let i = 0; i < snowflakeCount; i++) {
                const snowflake = snowflakes[i];
                snowflake.position.y -= snowflake.userData.fallSpeed;
                snowflake.position.x += snowflake.userData.driftSpeed;
                
                if (snowflake.position.y < 0) {
                    snowflake.position.y = 25;
                    snowflake.position.x = px + (Math.random() * 40 - 20);
                    snowflake.position.z = pz + (Math.random() * 40 - 20);
                }
            }
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.currentMode = 'prototype';

function toggleMode() {
    const button = document.querySelector('#mode-toggle button');
    const indicator = document.getElementById('mode-indicator');
    
    if (window.currentMode === 'prototype') {
        window.currentMode = 'full';
        button.textContent = '🎮 Switch to Prototype Mode';
        indicator.textContent = 'Current: Full Mode (with textures)';
        applyFullModeTextures();
    } else {
        window.currentMode = 'prototype';
        button.textContent = '🎨 Switch to Full Mode';
        indicator.textContent = 'Current: Prototype Mode (no textures)';
        removeFullModeTextures();
    }
}

function applyFullModeTextures() {
    if (window.gameManager && window.gameManager.currentWorld === 'winter') {
        applyWinterTextures();
    } else if (window.gameManager && window.gameManager.currentWorld === 'spring') {
        applySpringTextures();
    } else {
        applyWinterTextures();
    }
}

function applyWinterTextures() {
    if (window.ground) {
        window.ground.material.map = createSnowGroundTexture();
        window.ground.material.needsUpdate = true;
    }
    
    if (window.TextureGenerator && window.scene) {
        window.scene.background = TextureGenerator.createSkyTexture(false);
    }
}

function applySpringTextures() {
    if (window.TextureGenerator) {
        if (window.ground) {
            window.ground.material.map = TextureGenerator.createGrassTexture();
            window.ground.material.needsUpdate = true;
        }
        
        if (window.scene) {
            window.scene.background = TextureGenerator.createSkyTexture(true);
        }
    }
}

function removeFullModeTextures() {
    if (window.ground) {
        window.ground.material.map = null;
        window.ground.material.needsUpdate = true;
    }
    
    if (window.scene) {
        const bgColor = window.gameManager && window.gameManager.currentWorld === 'spring' ? 0x87CEEB : 0x6B8E9E;
        window.scene.background = new THREE.Color(bgColor);
    }
    
    window.scene.traverse((child) => {
        if (child.isMesh && child.material && child.material.map) {
            child.material.map = null;
            child.material.needsUpdate = true;
        }
    });
}

window.toggleMode = toggleMode;

if (typeof IceMonsters !== 'undefined') {
    window.iceMonsters = IceMonsters;
}

animate();

if (window.olaf) {
    if (olaf.character) {
        olaf.character.userData.isOlaf = true;
    } else if (olaf instanceof THREE.Group || olaf instanceof THREE.Mesh) {
        olaf.userData.isOlaf = true;
    }
}

if (window.reindeer) {
    if (reindeer.character) {
        reindeer.character.userData.isReindeer = true;
    } else if (reindeer instanceof THREE.Group || reindeer instanceof THREE.Mesh) {
        reindeer.userData.isReindeer = true;
    }
}