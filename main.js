// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xD4E8F7);
window.scene = scene;

// FOG FOR ATMOSPHERE
scene.fog = new THREE.Fog(0xA8D5F2, 30, 50);

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

// SOFT AMBIENT LIGHT with gentle directional light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFF4E6, 0.4);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// === SNOW GROUND TEXTURE ===
function createSnowGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#E5F2FA';
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
    color: 0xE0EFF8,
    fog: true
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
window.ground = ground;

// Apply texture immediately
ground.material.map = createSnowGroundTexture();
ground.material.needsUpdate = true;

// GENTLE SNOWFALL
const snowflakes = [];
const snowflakeCount = 50;

const snowGeometry = new THREE.SphereGeometry(0.12, 4, 4);
const snowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.9,
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

const olaf = OlafCharacter.create(scene, -6, 5);
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
    { x: 0, z: 0, radius: 4 },      // Player spawn
    { x: 0, z: -30, radius: 14 },   // Ice castle
    { x: 15, z: 15, radius: 7 },    // Penguin hill
    { x: 8, z: -6, radius: 4 },     // Reindeer
    { x: -6, z: 5, radius: 4 }      // Olaf
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

// Add several icicle clusters hanging above the scene
const icicleClusters = [
    { x: 0, z: 0, count: 12, spread: 10 },
    { x: -15, z: 5, count: 10, spread: 8 },
    { x: 10, z: -10, count: 15, spread: 12 },
    { x: -5, z: -15, count: 8, spread: 6 },
    { x: 12, z: 8, count: 10, spread: 7 }
];

// Loop through clusters and add to the scene
icicleClusters.forEach(cluster => {
    const icicleGroup = createIcicleCluster(cluster.x, cluster.z, cluster.count, cluster.spread);

    // Raise the group so icicles hang high above the ground
    icicleGroup.position.y = 10 + Math.random() * 5; // random Y between 10-15
    scene.add(icicleGroup);
});

// Optional: add a few individual icicles for variety
const extraIcicles = [
    { x: 5, z: 0, height: 0.4 },
    { x: -8, z: 7, height: 0.5 },
    { x: 3, z: -12, height: 0.35 }
];

extraIcicles.forEach(ic => {
    const single = createIcicle(ic.x, ic.z, ic.height, 0.03, 0.08);
    single.position.y = 12 + Math.random() * 3; // Y position above scene
    scene.add(single);
});


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

function createLampPost(x, z) {
    const lampGroup = new THREE.Group();

    // Post
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x3A3A3A });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.5, 8), postMaterial);
    post.position.y = 2.25;
    lampGroup.add(post);

    // Lamp housing
    const housingMaterial = new THREE.MeshStandardMaterial({ color: 0x2A2A2A });
    const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.6, 8), housingMaterial);
    lampHousing.position.y = 4.7;
    lampGroup.add(lampHousing);

    // Lamp glow sphere (emissive)
    const lampSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xFFF4AA,
            emissive: 0xFFF4AA,
            emissiveIntensity: 5,
        })
    );
    lampSphere.position.y = 4.7;
    lampGroup.add(lampSphere);

    // PointLight
    const pointLight = new THREE.PointLight(0xFFF4AA, 4, 30, 2);
    pointLight.position.y = 4.7;
    pointLight.castShadow = true;
    lampGroup.add(pointLight);

    // Soft halo around lamp
    const bulbGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0xFFF4AA,
            transparent: true,
            opacity: 0.3,
        })
    );
    bulbGlow.position.y = 4.7;
    lampGroup.add(bulbGlow);

    // Wider warm ground glow
    const groundGlow = new THREE.Mesh(
        new THREE.CircleGeometry(2.5, 64),
        new THREE.MeshBasicMaterial({
            color: 0xFFAA33,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
        })
    );
    groundGlow.rotation.x = -Math.PI / 2;
    groundGlow.position.y = 0.01;
    lampGroup.add(groundGlow);

    lampGroup.position.set(x, 0, z);
    lampGroup.userData.collision = { type: 'circle', radius: 0.5, x, z };

    return lampGroup;
}

// Gingerbread House (winter decoration)
function createCandyCane(x, z, scale = 1) {
    const houseGroup = new THREE.Group();
    
    // Helper function to create gingerbread texture
    function createGingerbreadTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Base gingerbread color
        ctx.fillStyle = '#A0623B';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add cookie texture with dark spots
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const brightness = Math.floor(Math.random() * 40 - 20);
            ctx.fillStyle = `rgb(${160 + brightness}, ${98 + brightness}, ${59 + brightness})`;
            ctx.fillRect(x, y, 2, 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // Materials
    const gingerbreadMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xA0623B,
        map: createGingerbreadTexture(),
        fog: true 
    });
    
    const icingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, fog: true });
    const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x654321, fog: true });
    
    // === MAIN HOUSE BODY ===
    const houseBody = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2, 2),
        gingerbreadMaterial
    );
    houseBody.position.y = 1;
    houseGroup.add(houseBody);
    
    // === PROPER A-FRAME ROOF ===
    // Left roof slope
    const roofLeft = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.12, 1.5),
        gingerbreadMaterial
    );
    roofLeft.position.set(0, 2.6, -0.6);
    roofLeft.rotation.x = -0.7;
    houseGroup.add(roofLeft);
    
    // Right roof slope
    const roofRight = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.12, 1.5),
        gingerbreadMaterial
    );
    roofRight.position.set(0, 2.6, 0.6);
    roofRight.rotation.x = 0.7;
    houseGroup.add(roofRight);
    
    // Front gable triangle
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-1, 0);
    gableShape.lineTo(1, 0);
    gableShape.lineTo(0, 1);
    gableShape.lineTo(-1, 0);
    
    const frontGable = new THREE.Mesh(
        new THREE.ShapeGeometry(gableShape),
        gingerbreadMaterial
    );
    frontGable.position.set(1.4, 2, 0);
    frontGable.rotation.y = Math.PI / 2;
    houseGroup.add(frontGable);
    
    // Back gable triangle
    const backGable = new THREE.Mesh(
        new THREE.ShapeGeometry(gableShape),
        gingerbreadMaterial
    );
    backGable.position.set(-1.4, 2, 0);
    backGable.rotation.y = -Math.PI / 2;
    houseGroup.add(backGable);
    
    // === WHITE ICING DRIPS ON ROOF EDGES ===
    // Left roof edge icing
    for (let i = 0; i < 12; i++) {
        const drip = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            icingMaterial
        );
        const xPos = -1.3 + (i * 0.24);
        drip.position.set(xPos, 2.0, -1.2);
        drip.scale.y = 1.5;
        houseGroup.add(drip);
    }
    
    // Right roof edge icing
    for (let i = 0; i < 12; i++) {
        const drip = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            icingMaterial
        );
        const xPos = -1.3 + (i * 0.24);
        drip.position.set(xPos, 2.0, 1.2);
        drip.scale.y = 1.5;
        houseGroup.add(drip);
    }
    
    // Roof ridge icing line
    const ridgeLine = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 0.15, 0.15),
        icingMaterial
    );
    ridgeLine.position.set(0, 3.0, 0);
    houseGroup.add(ridgeLine);
    
    // === DOOR ===
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.9, 0.08),
        doorMaterial
    );
    door.position.set(1.26, 0.45, 0);
    houseGroup.add(door);
    
    // Door icing outline
    const doorOutline = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.98, 0.09),
        icingMaterial
    );
    doorOutline.position.set(1.255, 0.45, 0);
    houseGroup.add(doorOutline);
    
    // Door candy buttons
    const doorCandyColors = [0xFF0000, 0x00FF00, 0x0000FF];
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.MeshBasicMaterial({ color: doorCandyColors[i], fog: true })
        );
        button.position.set(1.3, 0.7 - (i * 0.2), 0);
        houseGroup.add(button);
    }
    
    // === WINDOWS ===
    const windowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7,
        fog: true 
    });
    
    // Front left window
    const windowFL = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.05),
        windowMaterial
    );
    windowFL.position.set(1.26, 1.3, -0.6);
    houseGroup.add(windowFL);
    
    // Front right window
    const windowFR = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.05),
        windowMaterial
    );
    windowFR.position.set(1.26, 1.3, 0.6);
    houseGroup.add(windowFR);
    
    // Window icing frames and crossbars
    [windowFL, windowFR].forEach(win => {
        // Frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.06),
            icingMaterial
        );
        frame.position.copy(win.position);
        frame.position.x -= 0.01;
        houseGroup.add(frame);
        
        // Cross bars
        const hBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.06, 0.07),
            icingMaterial
        );
        hBar.position.copy(win.position);
        houseGroup.add(hBar);
        
        const vBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.5, 0.07),
            icingMaterial
        );
        vBar.position.copy(win.position);
        houseGroup.add(vBar);
    });
    
    // === COLORFUL GUMDROP DECORATIONS ===
    const gumdropColors = [0xFF1493, 0xFF4500, 0xFFD700, 0x32CD32, 0x8A2BE2, 0xFF69B4];
    
    // Gumdrops along roof ridge
    for (let i = 0; i < 10; i++) {
        const gumdrop = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ color: gumdropColors[i % gumdropColors.length], fog: true })
        );
        gumdrop.position.set(-1.2 + (i * 0.26), 3.1, 0);
        gumdrop.scale.y = 0.8;
        houseGroup.add(gumdrop);
    }
    
    // Gumdrops on front wall
    for (let i = 0; i < 4; i++) {
        const gumdrop = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({ color: gumdropColors[(i + 2) % gumdropColors.length], fog: true })
        );
        gumdrop.position.set(1.28, 0.3, -0.8 + (i * 0.5));
        houseGroup.add(gumdrop);
    }
    
    // === CHIMNEY ===
    const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.6, 0.35),
        gingerbreadMaterial
    );
    chimney.position.set(-0.8, 2.7, 0.4);
    houseGroup.add(chimney);
    
    // Chimney snow cap
    const chimneySnow = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.12, 0.42),
        icingMaterial
    );
    chimneySnow.position.set(-0.8, 3.04, 0.4);
    houseGroup.add(chimneySnow);
    
    // === PEPPERMINT CANDIES ON WALLS ===
    for (let i = 0; i < 2; i++) {
        const peppermintBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16),
            new THREE.MeshBasicMaterial({ color: 0xFFFFFF, fog: true })
        );
        peppermintBase.rotation.z = Math.PI / 2;
        peppermintBase.position.set(1.28, 1.7, -0.6 + (i * 1.2));
        houseGroup.add(peppermintBase);
        
        // Red swirl segments
        for (let j = 0; j < 6; j++) {
            const segment = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.07, 0.25),
                new THREE.MeshBasicMaterial({ color: 0xFF0000, fog: true })
            );
            const angle = (j / 6) * Math.PI * 2;
            segment.position.copy(peppermintBase.position);
            segment.rotation.z = angle;
            houseGroup.add(segment);
        }
    }
    
    // === SNOW BASE ===
    const snowBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.6, 0.15, 32),
        icingMaterial
    );
    snowBase.position.y = 0.08;
    houseGroup.add(snowBase);
    
    // Small snow mounds around base
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const mound = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            icingMaterial
        );
        mound.position.set(
            Math.cos(angle) * 1.4,
            0.05,
            Math.sin(angle) * 1.4
        );
        houseGroup.add(mound);
    }
    
    houseGroup.position.set(x, 0, z);
    houseGroup.scale.multiplyScalar(scale);
    houseGroup.userData.collision = { type: 'circle', radius: 1.8 * scale, x, z };
    return houseGroup;
}

// Realistic Bare Winter Tree
function createStickTree(x, z, scale = 1) {
    const treeGroup = new THREE.Group();

    const barkMaterial = new THREE.MeshBasicMaterial({ color: 0x4A3728, fog: true });
    const darkBarkMaterial = new THREE.MeshBasicMaterial({ color: 0x362817, fog: true });

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.18, 3.5, 8),
        barkMaterial
    );
    trunk.position.y = 1.75;
    treeGroup.add(trunk);

    function createCurvedBranch(startX, startY, startZ, baseAngle, upAngle, length, thickness, depth = 0) {
        if (depth > 3 || length < 0.1) return null;

        const segments = Math.max(3, Math.floor(length * 8));
        const segmentLength = length / segments;
        const branchParts = [];
        
        let currentX = startX;
        let currentY = startY;
        let currentZ = startZ;
        let currentAngle = baseAngle;
        let currentUp = upAngle;
        
        for (let i = 0; i < segments; i++) {
            const segThickness = thickness * (1 - (i / segments) * 0.4);
            const segment = new THREE.Mesh(
                new THREE.CylinderGeometry(segThickness * 0.8, segThickness, segmentLength, 4),
                depth === 0 ? barkMaterial : darkBarkMaterial
            );
            
            const bendAmount = (Math.random() - 0.5) * 0.15;
            currentAngle += bendAmount;
            currentUp += (Math.random() - 0.7) * 0.1;
            
            const dx = Math.cos(currentAngle) * Math.cos(currentUp) * segmentLength;
            const dy = Math.sin(currentUp) * segmentLength;
            const dz = Math.sin(currentAngle) * Math.cos(currentUp) * segmentLength;
            
            segment.position.set(
                currentX + dx * 0.5,
                currentY + dy * 0.5,
                currentZ + dz * 0.5
            );
            
            segment.rotation.z = currentAngle;
            segment.rotation.x = currentUp;
            
            treeGroup.add(segment);
            branchParts.push({ x: currentX + dx, y: currentY + dy, z: currentZ + dz });
            
            currentX += dx;
            currentY += dy;
            currentZ += dz;
        }
        
        if (depth < 3 && segments > 2) {
            const numSubBranches = depth === 0 ? 3 : (depth === 1 ? 2 : 1);
            
            for (let i = 0; i < numSubBranches; i++) {
                const branchPoint = Math.floor(segments * 0.3) + Math.floor(Math.random() * Math.floor(segments * 0.5));
                if (branchPoint < branchParts.length) {
                    const point = branchParts[branchPoint];
                    const subLength = length * (0.4 + Math.random() * 0.3);
                    const subThickness = thickness * 0.55;
                    const subAngle = currentAngle + (Math.random() - 0.5) * 1.8;
                    const subUp = currentUp + (Math.random() - 0.5) * 0.6;
                    
                    createCurvedBranch(point.x, point.y, point.z, subAngle, subUp, subLength, subThickness, depth + 1);
                }
            }
        }
        
        if (depth >= 2 || (depth === 1 && Math.random() > 0.5)) {
            for (let t = 0; t < 2 + Math.floor(Math.random() * 2); t++) {
                const twig = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.008, 0.012, 0.2, 3),
                    darkBarkMaterial
                );
                const twigAngle = currentAngle + (Math.random() - 0.5) * 1.2;
                const twigUp = currentUp + (Math.random() - 0.5) * 0.8;
                
                const twigDx = Math.cos(twigAngle) * Math.cos(twigUp) * 0.1;
                const twigDy = Math.sin(twigUp) * 0.1;
                const twigDz = Math.sin(twigAngle) * Math.cos(twigUp) * 0.1;
                
                twig.position.set(
                    currentX + twigDx,
                    currentY + twigDy,
                    currentZ + twigDz
                );
                twig.rotation.z = twigAngle;
                twig.rotation.x = twigUp;
                
                treeGroup.add(twig);
            }
        }
        
        return { x: currentX, y: currentY, z: currentZ };
    }

    const branchLevels = 4;
    for (let level = 0; level < branchLevels; level++) {
        const yPos = 2.0 + level * 0.7;
        const numBranches = 2 + Math.floor(Math.random() * 2);
        const angleOffset = Math.random() * Math.PI * 2;

        for (let b = 0; b < numBranches; b++) {
            const angle = angleOffset + (b / numBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const upAngle = 0.2 + Math.random() * 0.5;
            const length = 1.0 - (level * 0.18) + Math.random() * 0.4;
            const thickness = 0.05 - (level * 0.008);

            createCurvedBranch(0, yPos, 0, angle, upAngle, length, thickness, 0);
        }
    }

    for (let i = 0; i < 2; i++) {
        const stub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.035, 0.12, 4),
            darkBarkMaterial
        );
        const angle = Math.random() * Math.PI * 2;
        const yPos = 1.2 + Math.random() * 1.8;
        stub.position.set(
            Math.cos(angle) * 0.12,
            yPos,
            Math.sin(angle) * 0.12
        );
        stub.rotation.z = angle + Math.PI / 2;
        stub.rotation.x = (Math.random() - 0.5) * 0.4;
        treeGroup.add(stub);
    }

    const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xF0F8FF, fog: true });
    const branchCount = treeGroup.children.length;
    for (let i = 0; i < branchCount; i++) {
        const child = treeGroup.children[i];
        if (child.isMesh && Math.random() > 0.85) {
            const snow = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 5, 5),
                snowMaterial
            );
            snow.position.copy(child.position);
            snow.position.y += 0.08;
            snow.scale.set(1.2, 0.5, 1);
            treeGroup.add(snow);
        }
    }

    treeGroup.position.set(x, 0, z);
    treeGroup.scale.multiplyScalar(scale);
    treeGroup.userData.collision = { type: 'circle', radius: 1.2 * scale, x, z };
    return treeGroup;
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

// Snow-covered Pine Tree
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
// Working Frozen Fountain with animated water
// High-Detail Frozen Fountain (modeled to resemble a real multi-tier stone fountain)
function createFrozenFountain(x, z) {
    const fountain = new THREE.Group();

    // -------- MATERIALS --------
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xD6D6D6,
        roughness: 0.8,
        metalness: 0.1
    });

    const iceMaterial = new THREE.MeshStandardMaterial({
        color: 0xE8F8FF,
        emissive: 0xA5C8FF,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.85
    });

    const snowMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 1,
        metalness: 0
    });

    // -------- BASE PLATFORM --------
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(2.8, 3.0, 0.5, 32),
        stoneMaterial
    );
    base.position.y = 0.25;
    fountain.add(base);

    const snowRim = new THREE.Mesh(
        new THREE.TorusGeometry(2.8, 0.15, 16, 100),
        snowMaterial
    );
    snowRim.position.y = 0.52;
    snowRim.rotation.x = Math.PI / 2;
    fountain.add(snowRim);

    // -------- PEDESTAL COLUMN --------
    const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.3, 1.4, 32),
        stoneMaterial
    );
    column.position.y = 1.2;
    fountain.add(column);

    // -------- LOWER BOWL --------
    const bowl1 = new THREE.Mesh(
        new THREE.LatheGeometry(
            [
                new THREE.Vector2(0.0, 0.0),
                new THREE.Vector2(1.2, 0.0),
                new THREE.Vector2(1.4, 0.3),
                new THREE.Vector2(1.45, 0.4),
                new THREE.Vector2(1.2, 0.55),
                new THREE.Vector2(0.8, 0.7)
            ],
            64
        ),
        stoneMaterial
    );
    bowl1.position.y = 1.9;
    fountain.add(bowl1);

    // Icicles on bowl 1
    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const icicle = new THREE.Mesh(
            new THREE.ConeGeometry(0.06, 0.7, 6),
            iceMaterial
        );
        icicle.position.set(Math.cos(angle) * 1.4, 1.9, Math.sin(angle) * 1.4);
        icicle.rotation.z = Math.PI;
        icicle.rotation.y = angle;
        fountain.add(icicle);
    }

    // -------- UPPER BOWL --------
    const bowl2 = new THREE.Mesh(
        new THREE.LatheGeometry(
            [
                new THREE.Vector2(0.0, 0.0),
                new THREE.Vector2(0.6, 0.0),
                new THREE.Vector2(0.75, 0.2),
                new THREE.Vector2(0.8, 0.3),
                new THREE.Vector2(0.6, 0.45),
                new THREE.Vector2(0.35, 0.55)
            ],
            64
        ),
        stoneMaterial
    );
    bowl2.position.y = 2.65;
    fountain.add(bowl2);

    // Icicles on bowl 2
    for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const icicle = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.5, 6),
            iceMaterial
        );
        icicle.position.set(Math.cos(angle) * 0.75, 2.65, Math.sin(angle) * 0.75);
        icicle.rotation.z = Math.PI;
        icicle.rotation.y = angle;
        fountain.add(icicle);
    }

    // -------- TOP FINIAL --------
    const finial = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        stoneMaterial
    );
    finial.position.y = 3.1;
    fountain.add(finial);

    // Snow cap
    const finialSnow = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 16, 16, 0, Math.PI),
        snowMaterial
    );
    finialSnow.position.y = 3.15;
    fountain.add(finialSnow);

    // -------- FROZEN DRIPS (animated) --------
    const drips = [];
    const dripMaterial = new THREE.MeshStandardMaterial({
        color: 0xCFEFFF,
        transparent: true,
        opacity: 0.9
    });

    for (let i = 0; i < 20; i++) {
        const drip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6),
            dripMaterial
        );
        drip.position.set(
            Math.cos(i) * 1.3,
            1.95,
            Math.sin(i) * 1.3
        );
        drip.material.opacity = 0.9;
        drips.push(drip);
        fountain.add(drip);
    }

    // -------- ANIMATION HANDLER --------
    fountain.userData.update = function () {
        drips.forEach((d, i) => {
            d.scale.y = 0.9 + Math.sin(Date.now() * 0.002 + i) * 0.1;
        });
    };

    fountain.position.set(x, 0, z);
    fountain.userData.collision = { type: 'circle', radius: 2.8, x, z };

    return fountain;
}


// OPTIMIZED CHRISTMAS TREE
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

// === PLACE ALL OBJECTS WITH ELEGANT SPACING ===
const trees = [];
const decorativeObjects = [];

// Place just 2-3 featured Christmas trees near spawn
const christmasTreePositions = [
    { x: -8, z: -5 },
    { x: 8, z: -7 }
];

christmasTreePositions.forEach(pos => {
    if (isPositionValid(pos.x, pos.z, 1.8, 5)) {
        const tree = createChristmasTree(pos.x, pos.z);
        scene.add(tree);
        trees.push(tree);
        collisionObjects.push(tree);
        placedPositions.push({ x: pos.x, z: pos.z });
    }
});

// Elegant ring of pines at a distance - sparse and majestic
const pineRing = { radius: 35, count: 12 };
const angleStep = (Math.PI * 2) / pineRing.count;

for (let i = 0; i < pineRing.count; i++) {
    const angle = i * angleStep;
    const x = Math.cos(angle) * pineRing.radius;
    const z = Math.sin(angle) * pineRing.radius;
    
    if (isPositionValid(x, z, 1.3, 4) && z > -22) {
        const scale = 1.0 + Math.random() * 0.3;
        const pine = createSnowPine(x, z, scale);
        scene.add(pine);
        trees.push(pine);
        collisionObjects.push(pine);
        placedPositions.push({ x, z });
    }
}

// Single elegant fountain as a centerpiece
const fountain = createFrozenFountain(-20, 8);
scene.add(fountain);
decorativeObjects.push(fountain);
collisionObjects.push(fountain);
placedPositions.push({ x: -20, z: 8 });

// 3 lamp posts for atmospheric lighting - strategic placement
const lampPositions = [
    { x: -12, z: 0 },
    { x: 12, z: 2 },
    { x: 0, z: 15 }
];

lampPositions.forEach(pos => {
    if (isPositionValid(pos.x, pos.z, 0.5, 4)) {
        const lamp = createLampPost(pos.x, pos.z);
        scene.add(lamp);
        decorativeObjects.push(lamp);
        collisionObjects.push(lamp);
        placedPositions.push({ x: pos.x, z: pos.z });
    }
});

// 2 cozy benches for rest spots
const benchPositions = [
    { x: -15, z: 10, rot: 2.0 },
    { x: 18, z: -5, rot: 4.5 }
];

benchPositions.forEach(pos => {
    if (isPositionValid(pos.x, pos.z, 1.2, 4)) {
        const bench = createBench(pos.x, pos.z, pos.rot);
        scene.add(bench);
        decorativeObjects.push(bench);
        collisionObjects.push(bench);
        placedPositions.push({ x: pos.x, z: pos.z });
    }
});

// Sparse magical ice crystals - just a few focal points
for (let i = 0; i < 5; i++) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 30) {
        const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 18 + Math.random() * 10;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isPositionValid(x, z, 0.5, 4)) {
            const crystal = createIceCrystal(x, z, 1.2 + Math.random() * 0.4);
            scene.add(crystal);
            decorativeObjects.push(crystal);
            collisionObjects.push(crystal);
            placedPositions.push({ x, z });
            placed = true;
        }
        attempts++;
    }
}

// 2 beautiful gingerbread houses
const housePositions = [
    { x: -18, z: -8 },
    { x: 20, z: 12 }
];

housePositions.forEach(pos => {
    if (isPositionValid(pos.x, pos.z, 1.8, 4)) {
        const house = createCandyCane(pos.x, pos.z, 1.0);
        scene.add(house);
        decorativeObjects.push(house);
        collisionObjects.push(house);
        placedPositions.push({ x: pos.x, z: pos.z });
    }
});

// A few bare winter trees for variety
for (let i = 0; i < 4; i++) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 30) {
        const angle = (i / 4) * Math.PI * 2;
        const distance = 25 + Math.random() * 8;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        if (isPositionValid(x, z, 1.2, 4)) {
            const bareTree = createStickTree(x, z, 1.0);
            scene.add(bareTree);
            decorativeObjects.push(bareTree);
            collisionObjects.push(bareTree);
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
        if (fountain && fountain.userData.update) fountain.userData.update();
        
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
    
        // WIND + SNOW CHAOS EFFECTS
    if (window.windEffect && window.snowflakes) {
        window.snowflakes.forEach(flake => {
            flake.position.x += flake.userData.driftSpeed * 0.2;

            if (flake.userData.stormShake) {
                flake.position.x += (Math.random() - 0.5) * 0.1;
                flake.position.z += (Math.random() - 0.5) * 0.1;
            }
        });
    }

    // EXTREME CAMERA SHAKE
    if (window.extremeCameraShake) {
        camera.position.x += (Math.random() - 0.5) * 0.12;
        camera.position.y += (Math.random() - 0.5) * 0.08;
    }

    // LIGHT FLICKER
    scene.traverse(obj => {
        if (obj.userData.flicker) {
            obj.intensity = 8 + Math.random() * 4; // flashing
        }
    });

    
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

function createIcicle(x, z, height = 1, radiusTop = 0.02, radiusBottom = 0.05) {
    const material = new THREE.MeshBasicMaterial({
        color: 0xB0E0E6,
        transparent: true,
        opacity: 0.8,
        fog: true
    });

    const geometry = new THREE.ConeGeometry(radiusBottom, height, 6);
    const icicle = new THREE.Mesh(geometry, material);
    icicle.rotation.x = Math.PI;

    icicle.position.set(x, 0, z);
    return icicle;
}

function createIcicleCluster(centerX, centerZ, count = 10, spread = 5) {
    const cluster = new THREE.Group();
    for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * spread;
        const offsetZ = (Math.random() - 0.5) * spread;
        const height = 2 + Math.random() * 3;
        const radiusBottom = 0.2 + Math.random() * 0.2;
        const radiusTop = 0.05 + Math.random() * 0.05;
        cluster.add(createIcicle(centerX + offsetX, centerZ + offsetZ, height, radiusTop, radiusBottom));
    }
    return cluster;
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
        const bgColor = window.gameManager && window.gameManager.currentWorld === 'spring' ? 0x87CEEB : 0xD4E8F7;
        scene.background = new THREE.Color(0xA8D5F2);
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