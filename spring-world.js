// Spring World - OPTIMIZED to match Winter World size and performance
const SpringWorld = {
    trees: [],
    flowers: [],
    butterflies: [],
    petals: [],
    castle: null,
    collisionObjects: [],
    
    create(scene) {
        this.clearWorld(scene);
        
        // Beautiful spring sky - soft pastel blue
        scene.background = new THREE.Color(0xADD8E6);
        scene.fog = new THREE.Fog(0xE6F3FF, 15, 45); // Soft misty fog
        
        // Lush spring ground with gradient effect
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshBasicMaterial({
            color: 0x90EE90, // Softer spring green
            fog: true
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);
        window.ground = ground;
        
        // Create cherry blossom trees (match winter tree count - 20 trees)
        this.createCherryBlossomTrees(scene);
        
        // Create flower garden (reduced for performance)
        this.createFlowerGarden(scene);
        
        // Create spring castle (flower palace)
        this.createFlowerPalace(scene);
        
        // Create butterflies (reduced for performance)
        this.createButterflies(scene);
        
        // Falling cherry blossom petals (reduced to match snow)
        this.createFallingPetals(scene);
        
        // Update world indicator
        document.getElementById('world-indicator').innerHTML = 'World: Spring 🌸';
        document.getElementById('world-indicator').style.background = 'linear-gradient(135deg, #FF69B4, #FFB6C1)';
        
        return this.collisionObjects;
    },
    
    clearWorld(scene) {
        // Remove all existing objects except player, camera, lights
        const toRemove = [];
        scene.traverse((child) => {
            if (child !== window.player && 
                !(child instanceof THREE.Light) && 
                !(child instanceof THREE.Camera) &&
                child.parent === scene) {
                toRemove.push(child);
            }
        });
        toRemove.forEach(obj => scene.remove(obj));
        
        this.trees = [];
        this.flowers = [];
        this.butterflies = [];
        this.petals = [];
        this.collisionObjects = [];
    },
    
    createCherryBlossomTrees(scene) {
        // Match winter world tree distribution - 20 trees in rings
        const rings = [
            { radius: 15, count: 5 },
            { radius: 25, count: 6 },
            { radius: 35, count: 6 },
            { radius: 45, count: 3 }
        ];
        
        const treePositions = [];
        
        rings.forEach(ring => {
            for (let i = 0; i < ring.count; i++) {
                const angle = (i / ring.count) * Math.PI * 2;
                const radiusVariation = ring.radius + (Math.random() - 0.5) * 3;
                const angleVariation = angle + (Math.random() - 0.5) * 0.3;
                
                const x = Math.cos(angleVariation) * radiusVariation;
                const z = Math.sin(angleVariation) * radiusVariation;
                
                // Avoid castle area (same as winter)
                if (z > -20 && !(x > 10 && x < 20 && z > 10 && z < 20)) {
                    treePositions.push({ x, z });
                }
            }
        });
        
        treePositions.forEach(pos => {
            const tree = this.createCherryBlossom(pos.x, pos.z);
            tree.userData.distanceFromPlayer = 0;
            this.trees.push(tree);
            scene.add(tree);
            this.collisionObjects.push(tree);
        });
    },
    
    createCherryBlossom(x, z) {
        const treeGroup = new THREE.Group();
        
        // Elegant dark brown trunk with slight taper
        const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.3, 2.5, 8);
        const trunkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4A2511, // Darker, richer brown
            fog: true
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.25;
        treeGroup.add(trunk);
        
        // Beautiful pink-to-white gradient blossoms
        const blossomColors = [0xFFC0CB, 0xFFB6D9, 0xFFD4E5];
        
        // Main crown - larger and fluffier
        for (let i = 0; i < 6; i++) {
            const blossom = new THREE.Mesh(
                new THREE.SphereGeometry(1, 10, 10),
                new THREE.MeshBasicMaterial({ 
                    color: blossomColors[i % 3],
                    fog: true
                })
            );
            const angle = (i / 6) * Math.PI * 2;
            const radius = 0.7;
            blossom.position.set(
                Math.cos(angle) * radius,
                2.8 + Math.sin(i * 2) * 0.2,
                Math.sin(angle) * radius
            );
            treeGroup.add(blossom);
        }
        
        // Large center crown
        const centerBlossom = new THREE.Mesh(
            new THREE.SphereGeometry(1.3, 10, 10),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFE4E1, // Misty rose
                fog: true
            })
        );
        centerBlossom.position.y = 3.2;
        treeGroup.add(centerBlossom);
        
        // Top accent blossoms for volume
        for (let i = 0; i < 4; i++) {
            const topBlossom = new THREE.Mesh(
                new THREE.SphereGeometry(0.6, 8, 8),
                new THREE.MeshBasicMaterial({ 
                    color: 0xFFF0F5, // Lavender blush
                    fog: true
                })
            );
            const angle = (i / 4) * Math.PI * 2;
            topBlossom.position.set(
                Math.cos(angle) * 0.4,
                3.8,
                Math.sin(angle) * 0.4
            );
            treeGroup.add(topBlossom);
        }
        
        treeGroup.position.set(x, 0, z);
        
        // Collision data
        treeGroup.userData.collision = {
            type: 'circle',
            radius: 1.6,
            x: x,
            z: z
        };
        
        return treeGroup;
    },
    
    createFlowerGarden(scene) {
        const flowerTypes = [
            { color: 0xFF1493, center: 0xFFD700 }, // Deep pink with gold
            { color: 0xFF69B4, center: 0xFFA500 }, // Hot pink with orange
            { color: 0x9370DB, center: 0xFFFF00 }, // Purple with yellow
            { color: 0xFF6347, center: 0xFFE4B5 }, // Tomato with moccasin
            { color: 0x00CED1, center: 0xFFFFE0 }, // Turquoise with light yellow
            { color: 0xFFB6C1, center: 0xFFF8DC }  // Light pink with cornsilk
        ];
        
        // 30 flowers with better distribution
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 8 + Math.random() * 20;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Avoid castle area
            if (z > -20) {
                const flowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
                const flower = this.createFlower(x, z, flowerType.color, flowerType.center);
                this.flowers.push(flower);
                scene.add(flower);
            }
        }
    },
    
    createFlower(x, z, petalColor, centerColor) {
        const flowerGroup = new THREE.Group();
        
        // Elegant green stem
        const stemGeometry = new THREE.CylinderGeometry(0.025, 0.03, 0.6, 6);
        const stemMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x2E8B57, // Sea green
            fog: true
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.3;
        flowerGroup.add(stem);
        
        // Beautiful petals with better shape
        const petalMaterial = new THREE.MeshBasicMaterial({ 
            color: petalColor,
            fog: true
        });
        
        for (let i = 0; i < 8; i++) {
            const petal = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 8, 8),
                petalMaterial
            );
            const angle = (i / 8) * Math.PI * 2;
            petal.position.set(
                Math.cos(angle) * 0.15,
                0.6,
                Math.sin(angle) * 0.15
            );
            petal.scale.set(1, 0.4, 1.8);
            petal.rotation.y = angle;
            flowerGroup.add(petal);
        }
        
        // Prominent center
        const center = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: centerColor,
                fog: true
            })
        );
        center.position.y = 0.6;
        flowerGroup.add(center);
        
        flowerGroup.position.set(x, 0, z);
        flowerGroup.userData.swayOffset = Math.random() * Math.PI * 2;
        
        return flowerGroup;
    },
    
    createFlowerPalace(scene) {
        const castleGroup = new THREE.Group();
        
        // Elegant tiered base
        const baseMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFE4E1, // Misty rose
            fog: true
        });
        
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(7, 9, 3, 16),
            baseMaterial
        );
        base.position.y = 1.5;
        castleGroup.add(base);
        
        // Second tier
        const tier2 = new THREE.Mesh(
            new THREE.CylinderGeometry(6, 7, 2, 16),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFC0CB,
                fog: true
            })
        );
        tier2.position.y = 3.5;
        castleGroup.add(tier2);
        
        // Large petal walls in a beautiful spiral pattern
        const petalConfigs = [
            { color: 0xFF1493, scale: [1, 1.8, 0.6] },
            { color: 0xFF69B4, scale: [1, 1.6, 0.7] },
            { color: 0xFFB6D9, scale: [1, 1.7, 0.65] }
        ];
        
        for (let i = 0; i < 12; i++) {
            const config = petalConfigs[i % 3];
            const petal = new THREE.Mesh(
                new THREE.SphereGeometry(3, 12, 12),
                new THREE.MeshBasicMaterial({ 
                    color: config.color,
                    fog: true
                })
            );
            const angle = (i / 12) * Math.PI * 2;
            const radius = 6.5;
            petal.position.set(
                Math.cos(angle) * radius,
                5 + Math.sin(i * 0.5) * 0.5,
                Math.sin(angle) * radius
            );
            petal.scale.set(...config.scale);
            petal.rotation.y = angle;
            castleGroup.add(petal);
        }
        
        // Majestic golden tower
        const towerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700, // Gold
            fog: true
        });
        
        const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 3.5, 12, 12),
            towerMaterial
        );
        tower.position.y = 10;
        castleGroup.add(tower);
        
        // Tower accent rings
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(2.2 + i * 0.3, 0.15, 8, 16),
                new THREE.MeshBasicMaterial({
                    color: 0xFFA500, // Orange accent
                    fog: true
                })
            );
            ring.position.y = 5 + i * 3;
            ring.rotation.x = Math.PI / 2;
            castleGroup.add(ring);
        }
        
        // Flower crown with large elegant petals
        const crownColors = [0xFF1493, 0xFF69B4, 0xFFB6D9];
        
        for (let i = 0; i < 8; i++) {
            const crownPetal = new THREE.Mesh(
                new THREE.ConeGeometry(1.2, 3, 6),
                new THREE.MeshBasicMaterial({
                    color: crownColors[i % 3],
                    fog: true
                })
            );
            const angle = (i / 8) * Math.PI * 2;
            crownPetal.position.set(
                Math.cos(angle) * 2.5,
                16,
                Math.sin(angle) * 2.5
            );
            crownPetal.rotation.z = Math.PI / 5;
            crownPetal.rotation.y = angle;
            castleGroup.add(crownPetal);
        }
        
        // Central crown jewel
        const jewel = new THREE.Mesh(
            new THREE.SphereGeometry(1, 12, 12),
            new THREE.MeshBasicMaterial({
                color: 0xFFD700,
                fog: true
            })
        );
        jewel.position.y = 17.5;
        castleGroup.add(jewel);
        
        castleGroup.position.set(0, 0, -30);
        
        // Collision
        castleGroup.userData.collision = {
            type: 'circle',
            radius: 10,
            x: 0,
            z: -30
        };
        
        scene.add(castleGroup);
        this.castle = castleGroup;
        this.collisionObjects.push(castleGroup);
        
        return castleGroup;
    },
    
    createButterflies(scene) {
        // Reduced from 10 to 6 for performance
        for (let i = 0; i < 6; i++) {
            const butterfly = this.createButterfly();
            butterfly.position.set(
                (Math.random() - 0.5) * 50,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * 50
            );
            butterfly.userData.speed = 0.02 + Math.random() * 0.02;
            butterfly.userData.angle = Math.random() * Math.PI * 2;
            butterfly.userData.distanceFromPlayer = 0;
            this.butterflies.push(butterfly);
            scene.add(butterfly);
        }
    },
    
    createButterfly() {
        const butterflyGroup = new THREE.Group();
        
        // Vibrant gradient wings
        const wingColors = [
            0xFF1493, // Deep pink
            0xFF69B4, // Hot pink
            0xFFB6D9, // Light pink
            0xFFD700, // Gold
            0x9370DB  // Purple
        ];
        
        const wingColor = wingColors[Math.floor(Math.random() * wingColors.length)];
        
        const wingMaterial = new THREE.MeshBasicMaterial({ 
            color: wingColor,
            side: THREE.DoubleSide,
            fog: true
        });
        
        // Left wing - more detailed shape
        const leftWingOuter = new THREE.Mesh(
            new THREE.CircleGeometry(0.18, 12),
            wingMaterial
        );
        leftWingOuter.position.set(-0.1, 0.05, 0);
        leftWingOuter.rotation.y = Math.PI / 4;
        butterflyGroup.add(leftWingOuter);
        
        const leftWingInner = new THREE.Mesh(
            new THREE.CircleGeometry(0.12, 12),
            new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xFFD700 : 0xFFFFFF,
                side: THREE.DoubleSide,
                fog: true
            })
        );
        leftWingInner.position.set(-0.1, -0.08, 0);
        leftWingInner.rotation.y = Math.PI / 6;
        butterflyGroup.add(leftWingInner);
        
        // Right wing
        const rightWingOuter = new THREE.Mesh(
            new THREE.CircleGeometry(0.18, 12),
            wingMaterial
        );
        rightWingOuter.position.set(0.1, 0.05, 0);
        rightWingOuter.rotation.y = -Math.PI / 4;
        butterflyGroup.add(rightWingOuter);
        
        const rightWingInner = new THREE.Mesh(
            new THREE.CircleGeometry(0.12, 12),
            new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xFFD700 : 0xFFFFFF,
                side: THREE.DoubleSide,
                fog: true
            })
        );
        rightWingInner.position.set(0.1, -0.08, 0);
        rightWingInner.rotation.y = -Math.PI / 6;
        butterflyGroup.add(rightWingInner);
        
        // Body with segments
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.25, 6),
            new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                fog: true
            })
        );
        body.rotation.z = Math.PI / 2;
        butterflyGroup.add(body);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                fog: true
            })
        );
        head.position.x = 0.13;
        butterflyGroup.add(head);
        
        return butterflyGroup;
    },
    
    createFallingPetals(scene) {
        const petalMaterials = [
            new THREE.MeshBasicMaterial({ 
                color: 0xFFB6C1,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide,
                fog: true
            }),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFC0CB,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                fog: true
            }),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFE4E1,
                transparent: true,
                opacity: 0.75,
                side: THREE.DoubleSide,
                fog: true
            })
        ];
        
        // 30 beautiful petals with varied shapes
        for (let i = 0; i < 30; i++) {
            const petalShape = Math.random() > 0.5 ? 
                new THREE.CircleGeometry(0.12, 5) : 
                new THREE.CircleGeometry(0.1, 4);
            
            const petal = new THREE.Mesh(
                petalShape,
                petalMaterials[Math.floor(Math.random() * petalMaterials.length)]
            );
            
            petal.position.x = (Math.random() - 0.5) * 50;
            petal.position.y = Math.random() * 20 + 5;
            petal.position.z = (Math.random() - 0.5) * 50;
            
            petal.userData = {
                fallSpeed: 0.015 + Math.random() * 0.02,
                swaySpeed: (Math.random() - 0.5) * 0.025,
                rotateSpeed: (Math.random() - 0.5) * 0.06
            };
            
            this.petals.push(petal);
            scene.add(petal);
        }
    },
    
    update(playerPosition) {
        const time = Date.now() * 0.001;
        
        // Update visibility for trees (match winter culling)
        if (window.frameCount % 20 === 0) {
            const px = playerPosition.x;
            const pz = playerPosition.z;
            const RENDER_DISTANCE_SQ = 35 * 35;
            
            this.trees.forEach(tree => {
                const dx = tree.position.x - px;
                const dz = tree.position.z - pz;
                const distSq = dx * dx + dz * dz;
                tree.visible = distSq < RENDER_DISTANCE_SQ;
            });
            
            // Cull butterflies too
            this.butterflies.forEach(butterfly => {
                const dx = butterfly.position.x - px;
                const dz = butterfly.position.z - pz;
                const distSq = dx * dx + dz * dz;
                butterfly.visible = distSq < (40 * 40);
            });
        }
        
        // Animate flowers swaying - every 4th frame like snow
        if (window.frameCount % 4 === 0) {
            this.flowers.forEach(flower => {
                flower.rotation.z = Math.sin(time * 2 + flower.userData.swayOffset) * 0.1;
            });
        }
        
        // Animate butterflies - simplified
        this.butterflies.forEach(butterfly => {
            if (!butterfly.visible) return; // Skip if culled
            
            butterfly.userData.angle += butterfly.userData.speed;
            butterfly.position.x += Math.cos(butterfly.userData.angle) * 0.1;
            butterfly.position.z += Math.sin(butterfly.userData.angle) * 0.1;
            butterfly.position.y += Math.sin(time * 3) * 0.01;
            
            // Flap wings - need to update all 4 wing parts
            if (butterfly.children.length >= 4) {
                const flapAngle = Math.sin(time * 10) * 0.5;
                butterfly.children[0].rotation.z = flapAngle; // Left outer
                butterfly.children[1].rotation.z = flapAngle; // Left inner
                butterfly.children[2].rotation.z = -flapAngle; // Right outer
                butterfly.children[3].rotation.z = -flapAngle; // Right inner
            }
            
            // Keep in bounds
            if (Math.abs(butterfly.position.x) > 40) butterfly.userData.angle += Math.PI;
            if (Math.abs(butterfly.position.z) > 40) butterfly.userData.angle += Math.PI;
        });
        
        // Animate falling petals - every 4th frame like snow
        if (window.frameCount % 4 === 0) {
            const px = playerPosition.x;
            const pz = playerPosition.z;
            
            this.petals.forEach(petal => {
                petal.position.y -= petal.userData.fallSpeed;
                petal.position.x += petal.userData.swaySpeed;
                petal.rotation.z += petal.userData.rotateSpeed;
                
                // Reset to top
                if (petal.position.y < 0) {
                    petal.position.y = 25;
                    petal.position.x = px + (Math.random() - 0.5) * 40;
                    petal.position.z = pz + (Math.random() - 0.5) * 40;
                }
            });
        }
        
        // Castle breathing effect - subtle
        if (this.castle && window.frameCount % 2 === 0) {
            const breathe = Math.sin(time * 0.5) * 0.01;
            this.castle.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
        }
    }
};

// Make SpringWorld globally accessible
window.SpringWorld = SpringWorld;