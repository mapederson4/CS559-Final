// Penguin on Snowboarding Hill
const PenguinHill = {
    hillGroup: null,
    penguin: null,
    snowboard: null,
    penguinGroup: null,
    animationProgress: 0,
    hillPath: [],
    
    create(scene, x = 15, z = 15) {
        this.hillGroup = new THREE.Group();
        
        this.createHill();
        this.createPenguin();
        this.generateHillPath();
        
        this.hillGroup.position.set(x, 0, z);
        scene.add(this.hillGroup);
        
        return this.hillGroup;
    },
    
    createHill() {
        // Create a smooth, curved hill - taller version
        const hillMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFAFA,
            shininess: 60
        });
        
        // Main hill slope (increased height)
        const hillGeometry = new THREE.SphereGeometry(5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const hill = new THREE.Mesh(hillGeometry, hillMaterial);
        hill.rotation.x = -Math.PI / 2;
        hill.position.y = 0;
        this.hillGroup.add(hill);
        
        // Upper slope extension (taller)
        const upperSlopeGeometry = new THREE.CylinderGeometry(2.5, 5, 4, 32);
        const upperSlope = new THREE.Mesh(upperSlopeGeometry, hillMaterial);
        upperSlope.position.y = 2;
        this.hillGroup.add(upperSlope);
        
        // Summit cap (higher)
        const summitGeometry = new THREE.SphereGeometry(2.5, 16, 16);
        const summit = new THREE.Mesh(summitGeometry, hillMaterial);
        summit.position.y = 4;
        summit.scale.set(1, 0.7, 1);
        this.hillGroup.add(summit);
        
        // Add snow texture bumps
        for (let i = 0; i < 30; i++) {
            const bump = new THREE.Mesh(
                new THREE.SphereGeometry(0.08 + Math.random() * 0.12, 8, 8),
                hillMaterial
            );
            const angle = Math.random() * Math.PI * 2;
            const radius = 1 + Math.random() * 4;
            const height = Math.random() * 5;
            
            bump.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            this.hillGroup.add(bump);
        }
        
        // Snow drift at bottom (adjusted for taller hill)
        const driftGeometry = new THREE.SphereGeometry(3.5, 16, 16);
        const drift = new THREE.Mesh(driftGeometry, hillMaterial);
        drift.position.set(0, -0.3, 5);
        drift.scale.set(1.5, 0.4, 1.2);
        this.hillGroup.add(drift);
    },
    
    createPenguin() {
        this.penguinGroup = new THREE.Group();
        
        // Penguin body materials
        const blackMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            shininess: 40
        });
        
        const whiteMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFAFA,
            shininess: 50
        });
        
        const orangeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF8C00,
            shininess: 30
        });
        
        const yellowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            shininess: 40
        });
        
        // Body (main)
        const bodyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const body = new THREE.Mesh(bodyGeometry, blackMaterial);
        body.scale.set(1, 1.3, 0.9);
        body.position.y = 0.5;
        this.penguinGroup.add(body);
        
        // White belly
        const bellyGeometry = new THREE.SphereGeometry(0.32, 16, 16);
        const belly = new THREE.Mesh(bellyGeometry, whiteMaterial);
        belly.scale.set(0.8, 1.1, 0.95);
        belly.position.set(0, 0.5, 0.25);
        this.penguinGroup.add(belly);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const head = new THREE.Mesh(headGeometry, blackMaterial);
        head.position.y = 1;
        this.penguinGroup.add(head);
        
        // Face patch (white)
        const faceGeometry = new THREE.SphereGeometry(0.2, 12, 12);
        const face = new THREE.Mesh(faceGeometry, whiteMaterial);
        face.position.set(0, 1, 0.15);
        face.scale.set(1, 0.9, 0.8);
        this.penguinGroup.add(face);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.06, 10, 10);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 80
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.08, 1.05, 0.2);
        this.penguinGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(-0.08, 1.05, 0.2);
        this.penguinGroup.add(rightEye);
        
        // Eye highlights
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });
        
        const leftHighlight = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 6, 6),
            highlightMaterial
        );
        leftHighlight.position.set(0.09, 1.07, 0.24);
        this.penguinGroup.add(leftHighlight);
        
        const rightHighlight = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 6, 6),
            highlightMaterial
        );
        rightHighlight.position.set(-0.07, 1.07, 0.24);
        this.penguinGroup.add(rightHighlight);
        
        // Beak
        const beakGeometry = new THREE.ConeGeometry(0.06, 0.15, 8);
        const beak = new THREE.Mesh(beakGeometry, orangeMaterial);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 0.98, 0.28);
        this.penguinGroup.add(beak);
        
        // Wings (flippers)
        const wingGeometry = new THREE.SphereGeometry(0.18, 12, 12);
        
        const leftWing = new THREE.Mesh(wingGeometry, blackMaterial);
        leftWing.scale.set(0.4, 1, 0.6);
        leftWing.position.set(0.35, 0.6, 0);
        leftWing.rotation.z = -0.6;
        this.penguinGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, blackMaterial);
        rightWing.scale.set(0.4, 1, 0.6);
        rightWing.position.set(-0.35, 0.6, 0);
        rightWing.rotation.z = 0.6;
        this.penguinGroup.add(rightWing);
        
        // Feet
        const footGeometry = new THREE.SphereGeometry(0.1, 10, 10);
        
        const leftFoot = new THREE.Mesh(footGeometry, orangeMaterial);
        leftFoot.position.set(0.15, 0.05, 0.15);
        leftFoot.scale.set(1.2, 0.4, 1.5);
        this.penguinGroup.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, orangeMaterial);
        rightFoot.position.set(-0.15, 0.05, 0.15);
        rightFoot.scale.set(1.2, 0.4, 1.5);
        this.penguinGroup.add(rightFoot);
        
        // Create snowboard
        this.createSnowboard();
        
        // Position penguin at top of hill
        this.penguinGroup.position.set(0, 5, 0); // Start at taller summit height
        this.penguinGroup.rotation.x = -0.3; // Leaning forward
        this.hillGroup.add(this.penguinGroup);
        
        this.penguin = this.penguinGroup;
    },
    
    createSnowboard() {
        // Cool snowboard with design
        const boardMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF1493, // Hot pink
            shininess: 60
        });
        
        const boardGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.8);
        this.snowboard = new THREE.Mesh(boardGeometry, boardMaterial);
        this.snowboard.position.set(0, 0, 0.1);
        
        // Curved tips
        const tipMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF69B4,
            shininess: 60
        });
        
        const frontTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 10, 10),
            tipMaterial
        );
        frontTip.position.set(0, 0, 0.5);
        frontTip.scale.set(1, 0.4, 0.8);
        this.snowboard.add(frontTip);
        
        const backTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 10, 10),
            tipMaterial
        );
        backTip.position.set(0, 0, -0.3);
        backTip.scale.set(1, 0.4, 0.8);
        this.snowboard.add(backTip);
        
        // Stripes
        for (let i = 0; i < 3; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(0.32, 0.06, 0.08),
                new THREE.MeshPhongMaterial({
                    color: 0xFFFF00,
                    shininess: 70
                })
            );
            stripe.position.z = -0.2 + i * 0.2;
            this.snowboard.add(stripe);
        }
        
        this.penguinGroup.add(this.snowboard);
    },
    
    generateHillPath() {
        // Generate a slalom path down the taller hill
        const numPoints = 100;
        for (let i = 0; i < numPoints; i++) {
            const t = i / numPoints;
            
            // Smooth S-curve carving pattern (like slalom skiing)
            const carveAmount = Math.sin(t * Math.PI * 4) * 1.5; // Side to side motion
            const height = 7 - t * 7; // Taller descent from 7 to 0
            const forward = 0 + t * 8; // Longer run down the hill
            
            // Calculate rotation based on carving direction
            const nextT = Math.min((i + 1) / numPoints, 1);
            const nextCarve = Math.sin(nextT * Math.PI * 4) * 1.5;
            const carveDirection = nextCarve - carveAmount;
            
            this.hillPath.push({
                x: carveAmount,
                y: height,
                z: forward,
                rotation: carveDirection * 0.5 // Subtle turning based on carve direction
            });
        }
    },
    
    update() {
        if (!this.penguin || !this.hillPath.length) return;
        
        // Animate penguin down the hill
        this.animationProgress += 0.003;
        if (this.animationProgress >= 1) {
            this.animationProgress = 0; // Loop back to top
        }
        
        const index = Math.floor(this.animationProgress * (this.hillPath.length - 1));
        const point = this.hillPath[index];
        
        // Update penguin position
        this.penguinGroup.position.set(point.x, point.y, point.z);
        
        // Update penguin rotation for turning
        this.penguinGroup.rotation.y = point.rotation + Math.PI / 2;
        
        // Lean into the turns
        const nextIndex = Math.min(index + 1, this.hillPath.length - 1);
        const nextPoint = this.hillPath[nextIndex];
        const turnAmount = (nextPoint.rotation - point.rotation) * 10;
        this.penguinGroup.rotation.z = turnAmount;
        
        // Tilt forward while moving
        this.penguinGroup.rotation.x = -0.3 - Math.abs(turnAmount) * 0.5;
        
        // Add wobble for fun
        const wobble = Math.sin(Date.now() * 0.01) * 0.05;
        this.penguinGroup.rotation.x += wobble;
        
        // Rotate snowboard slightly
        if (this.snowboard) {
            this.snowboard.rotation.y = Math.sin(Date.now() * 0.008) * 0.1;
        }
    }
};

// Add keyboard control to reset penguin to top
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            if (window.penguinHillInstance) {
                PenguinHill.animationProgress = 0;
            }
        }
    });
}