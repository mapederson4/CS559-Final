// Olaf Character Creator
const OlafCharacter = {
    group: null,
    bottomSnowball: null,
    middleSnowball: null,
    topSnowball: null,
    head: null,
    leftArm: null,
    rightArm: null,
    hair: null,
    carrotNose: null,
    isDancing: false,
    
    create(scene, x = -8, z = 3) {
        // Main group to hold all Olaf parts
        this.group = new THREE.Group();
        
        // Create each part
        this.createSnowballs();
        this.createFace();
        this.createArms();
        this.createButtons();
        this.createHair();
        this.createFeet();
        
        // Position Olaf in the world
        this.group.position.set(x, 0, z);
        scene.add(this.group);
        
        return this.group;
    },
    
    createSnowballs() {
        const snowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFAFA, // Snow white
            shininess: 40,
            specular: 0xCCCCCC
        });
        
        // Bottom snowball (biggest)
        const bottomGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        this.bottomSnowball = new THREE.Mesh(bottomGeometry, snowMaterial);
        this.bottomSnowball.position.y = 0.5;
        this.bottomSnowball.scale.set(1, 0.9, 1); // Slightly squished
        this.group.add(this.bottomSnowball);
        
        // Middle snowball (medium)
        const middleGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        this.middleSnowball = new THREE.Mesh(middleGeometry, snowMaterial);
        this.middleSnowball.position.y = 1.2;
        this.middleSnowball.scale.set(1, 0.95, 1);
        this.group.add(this.middleSnowball);
        
        // Head/top snowball (smallest)
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        this.head = new THREE.Mesh(headGeometry, snowMaterial);
        this.head.position.y = 1.8;
        this.head.scale.set(1, 1.05, 1); // Slightly egg-shaped
        this.group.add(this.head);
        
        // Add snow texture details (little bumps)
        this.addSnowTexture(this.bottomSnowball, 0.5);
        this.addSnowTexture(this.middleSnowball, 0.4);
        this.addSnowTexture(this.head, 0.35);
    },
    
    addSnowTexture(snowball, radius) {
        const bumpMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xF5F5F5,
            shininess: 50
        });
        
        for (let i = 0; i < 8; i++) {
            const bumpGeometry = new THREE.SphereGeometry(0.03, 6, 6);
            const bump = new THREE.Mesh(bumpGeometry, bumpMaterial);
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            bump.position.set(
                snowball.position.x + Math.sin(phi) * Math.cos(theta) * radius * 0.95,
                snowball.position.y + Math.cos(phi) * radius * 0.95,
                snowball.position.z + Math.sin(phi) * Math.sin(theta) * radius * 0.95
            );
            this.group.add(bump);
        }
    },
    
    createFace() {
        // Big googly eyes
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const eyeWhiteMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            shininess: 80
        });
        
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(0.1, 1.85, 0.3);
        leftEyeWhite.scale.set(1, 1.1, 0.6);
        this.group.add(leftEyeWhite);
        
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(-0.1, 1.85, 0.3);
        rightEyeWhite.scale.set(1, 1.1, 0.6);
        this.group.add(rightEyeWhite);
        
        // Pupils (coal)
        const pupilGeometry = new THREE.SphereGeometry(0.06, 10, 10);
        const coalMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            shininess: 20
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, coalMaterial);
        leftPupil.position.set(0.1, 1.85, 0.36);
        this.group.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, coalMaterial);
        rightPupil.position.set(-0.1, 1.85, 0.36);
        this.group.add(rightPupil);
        
        // Eye highlights (make them sparkle)
        const highlightGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const highlightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 1
        });
        
        const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        leftHighlight.position.set(0.12, 1.88, 0.38);
        this.group.add(leftHighlight);
        
        const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        rightHighlight.position.set(-0.08, 1.88, 0.38);
        this.group.add(rightHighlight);
        
        // Carrot nose (iconic!)
        const carrotGeometry = new THREE.ConeGeometry(0.06, 0.35, 8);
        const carrotMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF8C00, // Orange
            shininess: 30
        });
        this.carrotNose = new THREE.Mesh(carrotGeometry, carrotMaterial);
        this.carrotNose.rotation.x = Math.PI / 2;
        this.carrotNose.position.set(0, 1.75, 0.4);
        this.group.add(this.carrotNose);
        
        // Carrot details (ridges)
        for (let i = 0; i < 4; i++) {
            const ridgeGeometry = new THREE.TorusGeometry(0.062 - i * 0.01, 0.008, 6, 8);
            const ridgeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xE67300
            });
            const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
            ridge.rotation.x = Math.PI / 2;
            ridge.position.set(0, 1.75, 0.42 + i * 0.08);
            this.group.add(ridge);
        }
        
        // Buck teeth (adorable)
        const toothGeometry = new THREE.BoxGeometry(0.05, 0.08, 0.03);
        const toothMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFAF0,
            shininess: 50
        });
        
        const leftTooth = new THREE.Mesh(toothGeometry, toothMaterial);
        leftTooth.position.set(0.04, 1.65, 0.32);
        this.group.add(leftTooth);
        
        const rightTooth = new THREE.Mesh(toothGeometry, toothMaterial);
        rightTooth.position.set(-0.04, 1.65, 0.32);
        this.group.add(rightTooth);
        
        // Big goofy smile (coal pieces)
        const mouthCoals = [
            { x: 0.15, y: 1.62, z: 0.28 },
            { x: 0.1, y: 1.58, z: 0.3 },
            { x: 0, y: 1.56, z: 0.32 },
            { x: -0.1, y: 1.58, z: 0.3 },
            { x: -0.15, y: 1.62, z: 0.28 }
        ];
        
        mouthCoals.forEach(pos => {
            const coalPiece = new THREE.Mesh(
                new THREE.SphereGeometry(0.025, 8, 8),
                coalMaterial
            );
            coalPiece.position.set(pos.x, pos.y, pos.z);
            this.group.add(coalPiece);
        });
        
        // Eyebrows (coal)
        const browGeometry = new THREE.BoxGeometry(0.12, 0.02, 0.02);
        
        const leftBrow = new THREE.Mesh(browGeometry, coalMaterial);
        leftBrow.position.set(0.1, 1.98, 0.32);
        leftBrow.rotation.z = -0.2;
        this.group.add(leftBrow);
        
        const rightBrow = new THREE.Mesh(browGeometry, coalMaterial);
        rightBrow.position.set(-0.1, 1.98, 0.32);
        rightBrow.rotation.z = 0.2;
        this.group.add(rightBrow);
    },
    
    createArms() {
        // Stick arms!
        const stickMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4A2511, // Dark brown
            shininess: 10
        });
        
        // Left arm
        this.leftArm = new THREE.Group();
        
        const leftUpperArm = this.createStickSegment(stickMaterial, 0.3);
        leftUpperArm.rotation.z = Math.PI / 3;
        leftUpperArm.position.set(0.15, 0, 0);
        this.leftArm.add(leftUpperArm);
        
        const leftForearm = this.createStickSegment(stickMaterial, 0.25);
        leftForearm.rotation.z = -Math.PI / 6;
        leftForearm.position.set(0.26, 0.15, 0);
        this.leftArm.add(leftForearm);
        
        // Fingers (3 little twigs)
        for (let i = 0; i < 3; i++) {
            const finger = this.createStickSegment(stickMaterial, 0.1, 0.01);
            finger.rotation.z = (i - 1) * 0.4;
            finger.position.set(0.36, 0.22 + i * 0.03, 0);
            this.leftArm.add(finger);
        }
        
        this.leftArm.position.set(0.3, 1.3, 0);
        this.group.add(this.leftArm);
        
        // Right arm
        this.rightArm = new THREE.Group();
        
        const rightUpperArm = this.createStickSegment(stickMaterial, 0.3);
        rightUpperArm.rotation.z = -Math.PI / 3;
        rightUpperArm.position.set(-0.15, 0, 0);
        this.rightArm.add(rightUpperArm);
        
        const rightForearm = this.createStickSegment(stickMaterial, 0.25);
        rightForearm.rotation.z = Math.PI / 6;
        rightForearm.position.set(-0.26, 0.15, 0);
        this.rightArm.add(rightForearm);
        
        // Fingers
        for (let i = 0; i < 3; i++) {
            const finger = this.createStickSegment(stickMaterial, 0.1, 0.01);
            finger.rotation.z = -(i - 1) * 0.4;
            finger.position.set(-0.36, 0.22 + i * 0.03, 0);
            this.rightArm.add(finger);
        }
        
        this.rightArm.position.set(-0.3, 1.3, 0);
        this.group.add(this.rightArm);
    },
    
    createStickSegment(material, length, radius = 0.02) {
        const geometry = new THREE.CylinderGeometry(radius, radius * 0.8, length, 6);
        const stick = new THREE.Mesh(geometry, material);
        stick.position.y = length / 2;
        return stick;
    },
    
    createButtons() {
        // Three coal buttons down the middle snowball
        const buttonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            shininess: 30
        });
        
        const buttonPositions = [
            { y: 1.35 },
            { y: 1.2 },
            { y: 1.05 }
        ];
        
        buttonPositions.forEach(pos => {
            const buttonGeometry = new THREE.SphereGeometry(0.05, 10, 10);
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(0, pos.y, 0.38);
            button.scale.set(1, 1, 0.6);
            this.group.add(button);
        });
    },
    
    createHair() {
        // Three stick hairs on top of head
        const hairMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4A2511,
            shininess: 10
        });
        
        this.hair = new THREE.Group();
        
        const hair1 = this.createStickSegment(hairMaterial, 0.15, 0.015);
        hair1.position.set(-0.08, 0, 0);
        hair1.rotation.z = -0.3;
        this.hair.add(hair1);
        
        const hair2 = this.createStickSegment(hairMaterial, 0.18, 0.015);
        hair2.position.set(0, 0, 0);
        this.hair.add(hair2);
        
        const hair3 = this.createStickSegment(hairMaterial, 0.14, 0.015);
        hair3.position.set(0.08, 0, 0);
        hair3.rotation.z = 0.3;
        this.hair.add(hair3);
        
        this.hair.position.set(0, 2.15, 0);
        this.group.add(this.hair);
    },
    
    createFeet() {
        // Little snow lumps for feet
        const footMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFAFA,
            shininess: 40
        });
        
        const leftFoot = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 10, 10),
            footMaterial
        );
        leftFoot.position.set(0.2, 0.08, 0.15);
        leftFoot.scale.set(1.2, 0.6, 1.5);
        this.group.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 10, 10),
            footMaterial
        );
        rightFoot.position.set(-0.2, 0.08, 0.15);
        rightFoot.scale.set(1.2, 0.6, 1.5);
        this.group.add(rightFoot);
    },
    
    update() {
        // Gentle bobbing (like he's happy)
        const bob = Math.sin(Date.now() * 0.002) * 0.03;
        this.group.position.y = bob;
        
        // Head tilt (curious look)
        this.head.rotation.z = Math.sin(Date.now() * 0.0015) * 0.05;
        this.head.rotation.x = Math.sin(Date.now() * 0.001) * 0.03;
        
        // Arms sway slightly
        this.leftArm.rotation.z = Math.sin(Date.now() * 0.0018) * 0.1;
        this.rightArm.rotation.z = -Math.sin(Date.now() * 0.002) * 0.1;
        
        // Hair sway in breeze
        this.hair.rotation.z = Math.sin(Date.now() * 0.003) * 0.08;
        
        // Carrot nose wiggle (very subtle)
        this.carrotNose.rotation.y = Math.sin(Date.now() * 0.005) * 0.02;
    },
    
    wave() {
        // Make Olaf wave!
        if (this.isDancing) return;
        
        this.isDancing = true;
        let waveCount = 0;
        const maxWaves = 6;
        
        const waveInterval = setInterval(() => {
            const up = (waveCount % 2 === 0);
            this.rightArm.rotation.z = up ? -Math.PI / 2 : -Math.PI / 4;
            this.rightArm.rotation.x = up ? -0.5 : 0;
            
            waveCount++;
            if (waveCount >= maxWaves) {
                clearInterval(waveInterval);
                this.rightArm.rotation.z = 0;
                this.rightArm.rotation.x = 0;
                this.isDancing = false;
            }
        }, 300);
    },
    
    dance() {
        // Full body dance!
        if (this.isDancing) return;
        
        this.isDancing = true;
        let danceTime = 0;
        
        const danceInterval = setInterval(() => {
            danceTime += 0.1;
            
            // Bounce up and down
            this.group.position.y = Math.abs(Math.sin(danceTime * 3)) * 0.2;
            
            // Rotate side to side
            this.group.rotation.y = Math.sin(danceTime * 2) * 0.3;
            
            // Arms up!
            this.leftArm.rotation.z = Math.PI / 3 + Math.sin(danceTime * 4) * 0.3;
            this.rightArm.rotation.z = -Math.PI / 3 - Math.sin(danceTime * 4) * 0.3;
            
            if (danceTime > 6) {
                clearInterval(danceInterval);
                this.group.position.y = 0;
                this.group.rotation.y = 0;
                this.leftArm.rotation.z = 0;
                this.rightArm.rotation.z = 0;
                this.isDancing = false;
            }
        }, 50);
    }
};

// Make Olaf react to Elsa!
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
        if (window.olaf && !window.olaf.isDancing) {
            // Olaf gets excited by the ice magic!
            setTimeout(() => {
                window.olaf.wave();
            }, 500);
        }
    }
    
    // Press 'O' to make Olaf dance!
    if (e.key === 'o' || e.key === 'O') {
        if (window.olaf) {
            window.olaf.dance();
        }
    }
});