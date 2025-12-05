// Collectibles System - Health, Power-ups, and Gift Boxes
const Collectibles = {
    collectibles: [],
    scene: null,
    player: null,
    lastSpawnTime: 0,
    spawnInterval: 5000,
    giftBoxesCollected: 0,
    giftBoxesNeeded: 3,
    specialAbilityActive: false,
    powerUpActive: false,
    powerUpEndTime: 0,
    
    init(scene, player) {
        this.scene = scene;
        this.player = player;
        this.giftBoxesCollected = 0;
        this.specialAbilityActive = false;
        this.powerUpActive = false;
        this.powerUpEndTime = 0;
        this.lastSpawnTime = Date.now();
    },
    
    createHealthPickup(position) {
        const collectibleGroup = new THREE.Group();
        
        // Health pickup - red heart with glow
        const heartMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF4444,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5,
            shininess: 80
        });
        
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
        heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
        heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
        heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
        
        const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 };
        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        heart.rotation.x = Math.PI;
        heart.scale.set(0.3, 0.3, 0.3);
        collectibleGroup.add(heart);
        
        // Glow ring
        const ringGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 16);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF8888,
            transparent: true,
            opacity: 0.5,
            emissive: 0xFF4444,
            emissiveIntensity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        collectibleGroup.add(ring);
        
        collectibleGroup.position.copy(position);
        collectibleGroup.position.y = 0.5;
        
        return collectibleGroup;
    },
    
    createPowerUp(position) {
        const collectibleGroup = new THREE.Group();
        
        // Power-up - star with electric effect
        const starMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.8,
            shininess: 100
        });
        
        // Create star shape
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const radius = i % 2 === 0 ? 0.4 : 0.2;
            starPoints.push(new THREE.Vector2(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            ));
        }
        const starShape = new THREE.Shape(starPoints);
        const starGeometry = new THREE.ExtrudeGeometry(starShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        collectibleGroup.add(star);
        
        // Electric particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sparkle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 6, 6),
                new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    emissive: 0xFFFF00,
                    emissiveIntensity: 1
                })
            );
            sparkle.position.set(
                Math.cos(angle) * 0.5,
                Math.sin(angle) * 0.5,
                0
            );
            collectibleGroup.add(sparkle);
        }
        
        collectibleGroup.position.copy(position);
        collectibleGroup.position.y = 0.5;
        
        return collectibleGroup;
    },
    
    createGiftBox(position) {
        const collectibleGroup = new THREE.Group();
        
        // Special gift box - wrapped present
        const giftMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF1493,
            emissive: 0xFF1493,
            emissiveIntensity: 0.4,
            shininess: 100
        });
        
        const ribbonMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.6,
            shininess: 100
        });
        
        // Gift box
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            giftMaterial
        );
        collectibleGroup.add(box);
        
        // Ribbon horizontal
        const ribbonH = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.1, 0.52),
            ribbonMaterial
        );
        collectibleGroup.add(ribbonH);
        
        // Ribbon vertical
        const ribbonV = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.52, 0.52),
            ribbonMaterial
        );
        collectibleGroup.add(ribbonV);
        
        // Bow on top
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const bowPart = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 8, 8),
                ribbonMaterial
            );
            bowPart.position.set(
                Math.cos(angle) * 0.15,
                0.35,
                Math.sin(angle) * 0.15
            );
            bowPart.scale.set(1, 0.6, 1);
            collectibleGroup.add(bowPart);
        }
        
        // Center of bow
        const bowCenter = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            ribbonMaterial
        );
        bowCenter.position.y = 0.35;
        collectibleGroup.add(bowCenter);
        
        // Sparkles around gift
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const sparkle = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 6, 6),
                new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    emissive: 0xFFFFFF,
                    emissiveIntensity: 1
                })
            );
            sparkle.position.set(
                Math.cos(angle) * 0.6,
                Math.sin(i * 0.5) * 0.3,
                Math.sin(angle) * 0.6
            );
            collectibleGroup.add(sparkle);
        }
        
        collectibleGroup.position.copy(position);
        collectibleGroup.position.y = 0.5;
        
        return collectibleGroup;
    },
    
    createCollectible(type, position) {
        let collectibleGroup;
        
        if (type === 'health') {
            collectibleGroup = this.createHealthPickup(position);
        } else if (type === 'power') {
            collectibleGroup = this.createPowerUp(position);
        } else if (type === 'gift') {
            collectibleGroup = this.createGiftBox(position);
        }
        
        const collectibleData = {
            group: collectibleGroup,
            type: type,
            createdAt: Date.now(),
            rotationSpeed: type === 'gift' ? 0.03 : 0.02
        };
        
        this.collectibles.push(collectibleData);
        this.scene.add(collectibleGroup);
        
        return collectibleData;
    },

    spawnRandomCollectible() {
        if (!this.player) return;
        
        // Define safe boundaries
        const worldBound = 22;
        
        // Spawn CLOSE to player within visible range (3-6 units away for easier collection)
        const angle = Math.random() * Math.PI * 2;
        const distance = 3 + Math.random() * 3; // Closer range: 3-6 units
        let position = new THREE.Vector3(
            this.player.position.x + Math.cos(angle) * distance,
            0,
            this.player.position.z + Math.sin(angle) * distance
        );
        
        // Clamp position to stay within bounds
        position.x = Math.max(-worldBound, Math.min(worldBound, position.x));
        position.z = Math.max(-worldBound, Math.min(worldBound, position.z));
        
        // If clamping moved the collectible too close to player, try opposite side
        const dx = position.x - this.player.position.x;
        const dz = position.z - this.player.position.z;
        const actualDistance = Math.sqrt(dx * dx + dz * dz);
        
        if (actualDistance < 2) {
            const oppositeAngle = angle + Math.PI;
            position = new THREE.Vector3(
                this.player.position.x + Math.cos(oppositeAngle) * distance,
                0,
                this.player.position.z + Math.sin(oppositeAngle) * distance
            );
            position.x = Math.max(-worldBound, Math.min(worldBound, position.x));
            position.z = Math.max(-worldBound, Math.min(worldBound, position.z));
        }
        
        // INCREASED GIFT BOX SPAWN RATE
        let type;
        if (!this.specialAbilityActive && this.giftBoxesCollected < this.giftBoxesNeeded) {
            const rand = Math.random();
            if (rand < 0.5) {  // 50% chance for gift box (was 0.3)
                type = 'gift';
            } else if (rand < 0.8) {  // 30% health
                type = 'health';
            } else {  // 20% power
                type = 'power';
            }
        } else {
            type = Math.random() < 0.6 ? 'health' : 'power';
        }
        
        this.createCollectible(type, position);
    },
    
    checkCollision(playerPosition, onHealthCollect, onPowerCollect, onGiftCollect) {
        const currentTime = Date.now();
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            // Check collision with player (increased from 4 to 2 for easier collection)
            const dx = collectible.group.position.x - playerPosition.x;
            const dz = collectible.group.position.z - playerPosition.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 2) {
                if (collectible.type === 'health') {
                    onHealthCollect();
                } else if (collectible.type === 'power') {
                    this.powerUpActive = true;
                    this.powerUpEndTime = currentTime + 10000; // 10 seconds
                    onPowerCollect();
                } else if (collectible.type === 'gift') {
                    this.giftBoxesCollected++;
                    
                    if (this.giftBoxesCollected >= this.giftBoxesNeeded) {
                        this.specialAbilityActive = true;
                    }
                    
                    onGiftCollect(this.giftBoxesCollected, this.specialAbilityActive);
                }
                
                // Remove collectible
                this.scene.remove(collectible.group);
                this.collectibles.splice(i, 1);
                continue;
            }
            
            // Remove old collectibles (30 seconds)
            if (currentTime - collectible.createdAt > 30000) {
                this.scene.remove(collectible.group);
                this.collectibles.splice(i, 1);
            }
        }
    },
    
    update() {
        const currentTime = Date.now();
        
        // Update power-up status
        if (this.powerUpActive && currentTime > this.powerUpEndTime) {
            this.powerUpActive = false;
        }
        
        // Spawn new collectibles
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnRandomCollectible();
            this.lastSpawnTime = currentTime;
        }
        
        // Update collectible animations
        for (let i = 0; i < this.collectibles.length; i++) {
            const collectible = this.collectibles[i];
            
            // Rotate and float
            collectible.group.rotation.y += collectible.rotationSpeed;
            collectible.group.position.y = 0.5 + Math.sin(currentTime * 0.003 + i) * 0.2;
        }
    },
    
    reset() {
        this.collectibles.forEach(collectible => {
            this.scene.remove(collectible.group);
        });
        this.collectibles = [];
        this.giftBoxesCollected = 0;
        this.specialAbilityActive = false;
        this.powerUpActive = false;
        this.powerUpEndTime = 0;
        this.lastSpawnTime = Date.now();
    },
    
    getPowerUpActive() {
        return this.powerUpActive;
    },
    
    getSpecialAbilityActive() {
        return this.specialAbilityActive;
    },
    
    getGiftBoxProgress() {
        return {
            collected: this.giftBoxesCollected,
            needed: this.giftBoxesNeeded,
            unlocked: this.specialAbilityActive
        };
    }
};