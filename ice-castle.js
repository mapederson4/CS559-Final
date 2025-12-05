// Elsa's Whimsical Ice Castle Creator
// Disney-inspired magical ice palace with flowing, organic shapes
const IceCastle = {
    group: null,
    crystalGlows: [],
    
    create(scene, x = 0, z = -30) {
        this.group = new THREE.Group();
        this.crystalGlows = [];
        
        // Magical ice materials - ethereal and dreamy
        const iceMaterial = new THREE.MeshPhongMaterial({
            color: 0xC0E8FF,
            transparent: true,
            opacity: 0.75,
            shininess: 120,
            specular: 0xFFFFFF,
            emissive: 0x6BB6FF,
            emissiveIntensity: 0.3
        });
        
        const accentIceMaterial = new THREE.MeshPhongMaterial({
            color: 0xA0D8FF,
            transparent: true,
            opacity: 0.8,
            shininess: 130,
            specular: 0xFFFFFF,
            emissive: 0x4DA6FF,
            emissiveIntensity: 0.25
        });
        
        const deepIceMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.85,
            shininess: 100,
            specular: 0xCCEEFF,
            emissive: 0x3380FF,
            emissiveIntensity: 0.2
        });
        
        // Build the whimsical castle
        this.createFlowingBase(iceMaterial, deepIceMaterial);
        this.createOrganicTowers(iceMaterial, accentIceMaterial, deepIceMaterial);
        this.createCrystalFormations(iceMaterial, accentIceMaterial);
        this.createFrozenArches(iceMaterial);
        this.createMagicalSpires(iceMaterial, accentIceMaterial);
        this.createSnowSwirls();
        this.createSparkles();
        this.createDreamyWindows(accentIceMaterial);
        this.createFrozenWaterfall(iceMaterial);
        
        this.group.position.set(x, 0, z);
        scene.add(this.group);
        
        return this.group;
    },
    
    createFlowingBase(iceMaterial, deepIceMaterial) {
        // Organic, flowing foundation that looks like frozen water
        const baseGroup = new THREE.Group();
        
        // Multiple overlapping rounded platforms
        for (let i = 0; i < 4; i++) {
            const radius = 10 - i * 1.5;
            const height = 1.5 - i * 0.3;
            const segments = 32; // More segments for smooth curves
            
            const platformGeometry = new THREE.CylinderGeometry(
                radius, 
                radius + 0.5, 
                height, 
                segments
            );
            const platform = new THREE.Mesh(
                platformGeometry, 
                i % 2 === 0 ? deepIceMaterial : iceMaterial
            );
            platform.position.y = 0.5 + i * 0.8;
            baseGroup.add(platform);
            
            // Add wavy edge details
            for (let j = 0; j < 8; j++) {
                const angle = (j / 8) * Math.PI * 2;
                const wave = new THREE.Mesh(
                    new THREE.SphereGeometry(0.4, 12, 12),
                    iceMaterial
                );
                wave.position.set(
                    Math.cos(angle) * (radius + 0.3),
                    0.5 + i * 0.8,
                    Math.sin(angle) * (radius + 0.3)
                );
                wave.scale.set(1.2, 0.7, 1.5);
                baseGroup.add(wave);
            }
        }
        
        this.group.add(baseGroup);
    },
    
    createOrganicTowers(iceMaterial, accentIceMaterial, deepIceMaterial) {
        // Main central tower - shorter and more balanced
        const centerTower = new THREE.Group();
        
        // Build tower in flowing segments (reduced from 8 to 5)
        const segments = 5;
        for (let i = 0; i < segments; i++) {
            const baseRadius = 4 - i * 0.5;
            const topRadius = 3.7 - i * 0.5;
            const segmentHeight = 2.5;
            const yPos = 3 + i * 2.2;
            
            // Slightly twisted segments for organic feel
            const towerSegment = new THREE.Mesh(
                new THREE.CylinderGeometry(topRadius, baseRadius, segmentHeight, 16),
                i % 2 === 0 ? iceMaterial : accentIceMaterial
            );
            towerSegment.position.y = yPos;
            towerSegment.rotation.y = i * 0.15;
            centerTower.add(towerSegment);
            
            // Add bulbous protrusions for Disney whimsy
            if (i % 2 === 0) {
                for (let j = 0; j < 4; j++) {
                    const angle = (j / 4) * Math.PI * 2 + i * 0.3;
                    const bulb = new THREE.Mesh(
                        new THREE.SphereGeometry(0.4, 12, 12),
                        deepIceMaterial
                    );
                    bulb.position.set(
                        Math.cos(angle) * (baseRadius + 0.2),
                        yPos,
                        Math.sin(angle) * (baseRadius + 0.2)
                    );
                    bulb.scale.set(1, 1.2, 1);
                    centerTower.add(bulb);
                }
            }
        }
        
        this.group.add(centerTower);
        
        // Side towers - smaller and lower
        this.createSideTower(-6, 2, 3.5, iceMaterial, accentIceMaterial);
        this.createSideTower(5, -1, 3, accentIceMaterial, deepIceMaterial);
        this.createSideTower(3, -5, 2.5, iceMaterial, deepIceMaterial);
        this.createSideTower(-4, -4, 2.5, deepIceMaterial, accentIceMaterial);
    },
    
    createSideTower(x, z, height, mat1, mat2) {
        const tower = new THREE.Group();
        const numSegments = Math.floor(height);
        
        for (let i = 0; i < numSegments; i++) {
            const radius = 2 - i * 0.2;
            const segment = new THREE.Mesh(
                new THREE.CylinderGeometry(radius * 0.9, radius, 2.5, 12),
                i % 2 === 0 ? mat1 : mat2
            );
            segment.position.y = 2 + i * 2.3;
            tower.add(segment);
            
            // Add decorative rings
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(radius * 1.1, 0.15, 8, 16),
                mat2
            );
            ring.position.y = 3 + i * 2.3;
            ring.rotation.x = Math.PI / 2;
            tower.add(ring);
        }
        
        tower.position.set(x, 0, z);
        this.group.add(tower);
    },
    
    createCrystalFormations(iceMaterial, accentMaterial) {
        // Dramatic flowing ice crystals shooting upward - shorter
        const crystalPositions = [
            { x: 0, y: 16, z: 0, height: 5, twist: true }, // Main spire - much shorter
            { x: -6, y: 10, z: 2, height: 3, twist: false },
            { x: 5, y: 9, z: -1, height: 2.5, twist: false },
            { x: 3, y: 8, z: -5, height: 2.5, twist: false },
            { x: -4, y: 7, z: -4, height: 2, twist: true }
        ];
        
        crystalPositions.forEach(pos => {
            const crystal = this.createWhimsicalCrystal(
                pos.height, 
                pos.twist ? accentMaterial : iceMaterial
            );
            crystal.position.set(pos.x, pos.y, pos.z);
            if (pos.twist) {
                crystal.rotation.z = Math.sin(pos.x) * 0.2;
            }
            this.group.add(crystal);
        });
        
        // Ground crystals - like frozen grass (fewer and smaller)
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 6 + Math.random() * 3;
            const height = 0.5 + Math.random() * 1.2;
            
            const crystal = this.createWhimsicalCrystal(height, iceMaterial);
            crystal.position.set(
                Math.cos(angle) * radius,
                height * 0.3,
                Math.sin(angle) * radius
            );
            crystal.rotation.z = (Math.random() - 0.5) * 0.6;
            crystal.rotation.y = angle + (Math.random() - 0.5);
            crystal.scale.set(0.5, 1, 0.5);
            this.group.add(crystal);
        }
    },
    
    createWhimsicalCrystal(height, material) {
        const group = new THREE.Group();
        
        // Main crystal body - elongated and elegant
        const mainCrystal = new THREE.Mesh(
            new THREE.ConeGeometry(height * 0.15, height, 6),
            material
        );
        mainCrystal.position.y = height / 2;
        group.add(mainCrystal);
        
        // Add smaller crystals branching off
        for (let i = 0; i < 3; i++) {
            const branchHeight = height * (0.3 + Math.random() * 0.2);
            const branch = new THREE.Mesh(
                new THREE.ConeGeometry(branchHeight * 0.1, branchHeight, 4),
                material
            );
            const angle = (i / 3) * Math.PI * 2;
            const yPos = height * (0.4 + i * 0.15);
            branch.position.set(
                Math.cos(angle) * height * 0.1,
                yPos,
                Math.sin(angle) * height * 0.1
            );
            branch.rotation.z = Math.PI / 4;
            branch.rotation.y = angle;
            group.add(branch);
        }
        
        return group;
    },
    
    createFrozenArches(iceMaterial) {
        // Beautiful curved archways
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const arch = new THREE.Group();
            
            // Create arch using multiple small segments
            const numSegments = 12;
            for (let j = 0; j < numSegments; j++) {
                const t = j / numSegments;
                const archAngle = t * Math.PI;
                
                const segment = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 8, 8),
                    iceMaterial
                );
                segment.position.set(
                    Math.cos(archAngle) * 2,
                    3 + Math.sin(archAngle) * 2,
                    0
                );
                segment.scale.set(1.2, 0.8, 0.8);
                arch.add(segment);
            }
            
            arch.position.set(
                Math.cos(angle) * 7,
                0,
                Math.sin(angle) * 7
            );
            arch.rotation.y = angle + Math.PI / 2;
            this.group.add(arch);
        }
    },
    
    createMagicalSpires(iceMaterial, accentMaterial) {
        // Crown of delicate spires - lower position
        const crownRadius = 2.5;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spire = this.createWhimsicalCrystal(2 + Math.random() * 0.5, accentMaterial);
            spire.position.set(
                Math.cos(angle) * crownRadius,
                14, // Lower from 24 to 14
                Math.sin(angle) * crownRadius
            );
            spire.rotation.z = Math.PI / 12;
            spire.rotation.y = angle;
            this.group.add(spire);
        }
        
        // Decorative mini crystals - fewer and lower
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.5 + Math.random() * 4;
            const height = 4 + Math.random() * 12; // Lower heights
            
            const miniCrystal = new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.4 + Math.random() * 0.3, 4),
                Math.random() > 0.5 ? iceMaterial : accentMaterial
            );
            miniCrystal.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            miniCrystal.rotation.z = (Math.random() - 0.5) * 0.8;
            this.group.add(miniCrystal);
        }
    },
    
    createSnowSwirls() {
        // Magical snow swirls around the castle - lower and fewer
        const snowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9,
            shininess: 80
        });
        
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 4;
            const radius = 5 + (i / 30) * 5;
            const height = (i / 30) * 10; // Lower max height
            
            const snowball = new THREE.Mesh(
                new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 8, 8),
                snowMaterial
            );
            snowball.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            this.group.add(snowball);
        }
    },
    
    createSparkles() {
        // Magical glowing points
        const sparkleMaterial = new THREE.MeshBasicMaterial({
            color: 0xDDEEFF,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 60; i++) {
            const sparkle = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 6),
                sparkleMaterial
            );
            
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 10;
            const height = Math.random() * 30;
            
            sparkle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            this.crystalGlows.push(sparkle);
            this.group.add(sparkle);
        }
    },
    
    createDreamyWindows(accentMaterial) {
        // Organic, flowing window shapes - fewer levels
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.5,
            emissive: 0xAADDFF,
            emissiveIntensity: 0.8
        });
        
        for (let level = 0; level < 4; level++) { // Reduced from 6 to 4
            const numWindows = 5 - level;
            const yPos = 5 + level * 2.5;
            const radius = 3.5 - level * 0.4;
            
            for (let i = 0; i < numWindows; i++) {
                const angle = (i / numWindows) * Math.PI * 2;
                
                const windowGroup = new THREE.Group();
                
                const windowBase = new THREE.Mesh(
                    new THREE.SphereGeometry(0.4, 12, 12),
                    windowMaterial
                );
                windowBase.scale.set(0.8, 1.2, 0.5);
                windowGroup.add(windowBase);
                
                const frame = new THREE.Mesh(
                    new THREE.TorusGeometry(0.4, 0.06, 8, 12),
                    accentMaterial
                );
                frame.scale.set(0.8, 1.2, 1);
                windowGroup.add(frame);
                
                windowGroup.position.set(
                    Math.cos(angle) * radius,
                    yPos,
                    Math.sin(angle) * radius
                );
                windowGroup.lookAt(new THREE.Vector3(0, yPos, 0));
                this.group.add(windowGroup);
            }
        }
    },
    
    createFrozenWaterfall(iceMaterial) {
        // Cascading frozen water effect on one side - shorter
        const waterfallGroup = new THREE.Group();
        
        for (let i = 0; i < 10; i++) { // Reduced from 15 to 10
            const width = 1.5 - i * 0.08;
            const flow = new THREE.Mesh(
                new THREE.SphereGeometry(width * 0.5, 10, 10),
                iceMaterial
            );
            flow.position.set(
                -5 + (i % 3) * 0.3,
                11 - i * 1.1, // Lower starting height
                -2.5 + Math.sin(i * 0.5) * 0.5
            );
            flow.scale.set(1.3, 1.8, 0.7);
            waterfallGroup.add(flow);
        }
        
        this.group.add(waterfallGroup);
    },
    
    update() {
        if (!this.group) return;
        
        const time = Date.now() * 0.001;
        
        // Gentle breathing effect
        const breathe = Math.sin(time * 0.5) * 0.015;
        this.group.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
        
        // Magical rotation
        this.group.rotation.y = Math.sin(time * 0.15) * 0.02;
        
        // Sparkle animation
        this.crystalGlows.forEach((sparkle, i) => {
            const pulse = Math.sin(time * 2 + i * 0.5) * 0.5 + 0.5;
            sparkle.material.opacity = 0.4 + pulse * 0.6;
            sparkle.scale.set(pulse + 0.5, pulse + 0.5, pulse + 0.5);
        });
    }
};

// Make castle react to Elsa's magic
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
            if (window.iceCastleInstance) {
                // Magical pulse effect
                const pulseScale = 1.08;
                window.iceCastleInstance.scale.set(pulseScale, pulseScale, pulseScale);
                setTimeout(() => {
                    if (window.iceCastleInstance) {
                        window.iceCastleInstance.scale.set(1, 1, 1);
                    }
                }, 400);
            }
        }
    });
}