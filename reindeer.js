// Reindeer Character Creator
const ReindeerCharacter = {
    group: null,
    body: null,
    head: null,
    antlers: null,
    legs: [],
    tail: null,
    isGrazing: false,
    isWalking: false,
    walkCycle: 0,
    targetPosition: null,
    currentPosition: { x: 8, z: -6 },
    walkSpeed: 0.05,
    hasSnorted: false,
    snortParticles: [],
    
    create(scene, x = 8, z = -6) {
        this.group = new THREE.Group();
        this.currentPosition = { x, z };
        
        this.createBody();
        this.createHead();
        this.createAntlers();
        this.createLegs();
        this.createTail();
        this.createFurDetails();
        
        this.group.position.set(x, 0, z);
        scene.add(this.group);
        
        return this.group;
    },
    
    createBody() {
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.45, 1.2, 12);
        const furMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B6F47,
            shininess: 20
        });
        this.body = new THREE.Mesh(bodyGeometry, furMaterial);
        this.body.rotation.z = Math.PI / 2;
        this.body.position.y = 1.0;
        this.group.add(this.body);
        
        const bellyGeometry = new THREE.CylinderGeometry(0.38, 0.43, 1.0, 12);
        const bellyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xD4A574,
            shininess: 15
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.rotation.z = Math.PI / 2;
        belly.position.set(0, 0.95, 0.05);
        this.group.add(belly);
        
        for (let i = 0; i < 8; i++) {
            const fluffGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const fluff = new THREE.Mesh(fluffGeometry, furMaterial);
            const angle = (i / 8) * Math.PI * 2;
            fluff.position.set(
                0.5 + Math.cos(angle) * 0.35,
                1.0 + Math.sin(angle) * 0.35,
                0
            );
            fluff.scale.set(1, 1, 0.6);
            this.group.add(fluff);
        }
    },
    
    createHead() {
        const headGroup = new THREE.Group();
        
        const headGeometry = new THREE.BoxGeometry(0.35, 0.3, 0.4);
        const furMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B6F47,
            shininess: 25
        });
        this.head = new THREE.Mesh(headGeometry, furMaterial);
        this.head.position.set(0.8, 1.3, 0);
        headGroup.add(this.head);
        
        const snoutGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.25);
        const snoutMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xD4A574,
            shininess: 15
        });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.set(0.95, 1.25, 0);
        headGroup.add(snout);
        
        const noseGeometry = new THREE.SphereGeometry(0.06, 12, 12);
        const noseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            shininess: 100,
            emissive: 0x111111,
            emissiveIntensity: 0.2
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(1.05, 1.25, 0);
        nose.scale.set(1, 0.8, 1);
        nose.userData.isNose = true;
        headGroup.add(nose);
        
        const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        const eyeWhiteMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            shininess: 50
        });
        
        const leftEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(0.85, 1.35, 0.15);
        leftEyeWhite.scale.set(1, 1.2, 0.8);
        headGroup.add(leftEyeWhite);
        
        const rightEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.85, 1.35, -0.15);
        rightEyeWhite.scale.set(1, 1.2, 0.8);
        headGroup.add(rightEyeWhite);
        
        const pupilGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const pupilMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2C1810,
            shininess: 100
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(0.9, 1.36, 0.18);
        headGroup.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.9, 1.36, -0.18);
        headGroup.add(rightPupil);
        
        const shineGeometry = new THREE.SphereGeometry(0.02, 6, 6);
        const shineMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.8
        });
        
        const leftShine = new THREE.Mesh(shineGeometry, shineMaterial);
        leftShine.position.set(0.92, 1.38, 0.19);
        headGroup.add(leftShine);
        
        const rightShine = new THREE.Mesh(shineGeometry, shineMaterial);
        rightShine.position.set(0.92, 1.38, -0.19);
        headGroup.add(rightShine);
        
        const earGeometry = new THREE.ConeGeometry(0.08, 0.2, 8);
        const leftEar = new THREE.Mesh(earGeometry, furMaterial);
        leftEar.position.set(0.75, 1.45, 0.15);
        leftEar.rotation.set(-0.3, 0, 0.3);
        headGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, furMaterial);
        rightEar.position.set(0.75, 1.45, -0.15);
        rightEar.rotation.set(-0.3, 0, -0.3);
        headGroup.add(rightEar);
        
        const innerEarGeometry = new THREE.ConeGeometry(0.05, 0.15, 6);
        const innerEarMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFB6C1,
            shininess: 10
        });
        const leftInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
        leftInnerEar.position.set(0.76, 1.45, 0.15);
        leftInnerEar.rotation.set(-0.3, 0, 0.3);
        headGroup.add(leftInnerEar);
        
        const rightInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
        rightInnerEar.position.set(0.76, 1.45, -0.15);
        rightInnerEar.rotation.set(-0.3, 0, -0.3);
        headGroup.add(rightInnerEar);
        
        this.group.add(headGroup);
    },
    
    createAntlers() {
        const antlerGroup = new THREE.Group();
        const antlerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xD4C5B0,
            shininess: 30
        });
        
        this.createSingleAntler(antlerGroup, antlerMaterial, 0.75, 1.5, 0.18, 1);
        this.createSingleAntler(antlerGroup, antlerMaterial, 0.75, 1.5, -0.18, -1);
        
        this.antlers = antlerGroup;
        this.group.add(antlerGroup);
    },
    
    createSingleAntler(group, material, x, y, z, side) {
        const mainBeam = this.createAntlerBranch(material, 0.03, 0.4);
        mainBeam.position.set(x, y, z);
        mainBeam.rotation.set(0.5, 0, side * 0.3);
        group.add(mainBeam);
        
        const tine1 = this.createAntlerBranch(material, 0.02, 0.2);
        tine1.position.set(x + 0.08, y + 0.15, z + side * 0.05);
        tine1.rotation.set(0.2, 0, side * 0.6);
        group.add(tine1);
        
        const tine2 = this.createAntlerBranch(material, 0.02, 0.25);
        tine2.position.set(x + 0.12, y + 0.25, z + side * 0.08);
        tine2.rotation.set(0.4, 0, side * 0.5);
        group.add(tine2);
        
        const tine3 = this.createAntlerBranch(material, 0.02, 0.18);
        tine3.position.set(x + 0.08, y + 0.32, z + side * 0.1);
        tine3.rotation.set(0.6, 0, side * 0.4);
        group.add(tine3);
        
        for (let i = 0; i < 3; i++) {
            const point = this.createAntlerBranch(material, 0.01, 0.08);
            point.position.set(
                x + 0.15 + i * 0.03,
                y + 0.35 + i * 0.02,
                z + side * (0.12 + i * 0.02)
            );
            point.rotation.set(0.8 + i * 0.2, 0, side * (0.3 + i * 0.1));
            group.add(point);
        }
    },
    
    createAntlerBranch(material, radius, height) {
        const geometry = new THREE.CylinderGeometry(radius, radius * 0.5, height, 6);
        const branch = new THREE.Mesh(geometry, material);
        branch.position.y = height / 2;
        return branch;
    },
    
    createLegs() {
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x6B563F,
            shininess: 20
        });
        
        const hoofMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2C1810,
            shininess: 50
        });
        
        this.legs[0] = this.createSingleLeg(legMaterial, hoofMaterial, 0.4, 0, 0.25);
        this.legs[1] = this.createSingleLeg(legMaterial, hoofMaterial, 0.4, 0, -0.25);
        this.legs[2] = this.createSingleLeg(legMaterial, hoofMaterial, -0.3, 0, 0.25);
        this.legs[3] = this.createSingleLeg(legMaterial, hoofMaterial, -0.3, 0, -0.25);
        
        this.legs.forEach(leg => this.group.add(leg));
    },
    
    createSingleLeg(legMaterial, hoofMaterial, x, y, z) {
        const legGroup = new THREE.Group();

        // Upper leg
        const upperLegHeight = 0.5;
        const upperLegGeometry = new THREE.CylinderGeometry(0.08, 0.06, upperLegHeight, 8);
        const upperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
        upperLeg.position.y = -upperLegHeight / 2;
        legGroup.add(upperLeg);

        // Lower leg
        const lowerLegHeight = 0.4;
        const lowerLegGeometry = new THREE.CylinderGeometry(0.05, 0.04, lowerLegHeight, 8);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        lowerLeg.position.y = -upperLegHeight - lowerLegHeight / 2;
        legGroup.add(lowerLeg);

        // Hoof
        const hoofHeight = 0.08;
        const hoofGeometry = new THREE.BoxGeometry(0.08, hoofHeight, 0.1);
        const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
        hoof.position.y = -upperLegHeight - lowerLegHeight - hoofHeight / 2;
        legGroup.add(hoof);

        // Position leg group - total leg length is ~0.98, body center is at y=1.0
        legGroup.position.set(x, 0.98, z);
        legGroup.userData.baseX = x;
        legGroup.userData.baseZ = z;
        legGroup.userData.baseY = 0.98;

        return legGroup;
    },
    
    createTail() {
        const tailGroup = new THREE.Group();
        const tailMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B6F47,
            shininess: 30
        });
        
        const baseGeometry = new THREE.CylinderGeometry(0.06, 0.04, 0.15, 8);
        const base = new THREE.Mesh(baseGeometry, tailMaterial);
        base.rotation.x = Math.PI / 3;
        tailGroup.add(base);
        
        for (let i = 0; i < 12; i++) {
            const tuftGeometry = new THREE.SphereGeometry(0.04 + Math.random() * 0.02, 6, 6);
            const tuft = new THREE.Mesh(tuftGeometry, tailMaterial);
            const angle = (i / 12) * Math.PI * 2;
            tuft.position.set(
                Math.cos(angle) * 0.05,
                -0.1,
                Math.sin(angle) * 0.05 - 0.05
            );
            tailGroup.add(tuft);
        }
        
        tailGroup.position.set(-0.7, 1.1, 0);
        this.tail = tailGroup;
        this.group.add(tailGroup);
    },
    
    createFurDetails() {
        const furMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B6F47,
            shininess: 15
        });
        
        for (let i = 0; i < 6; i++) {
            const fluff = new THREE.SphereGeometry(0.06, 6, 6);
            const fluffMesh = new THREE.Mesh(fluff, furMaterial);
            fluffMesh.position.set(
                0.3 + Math.random() * 0.1,
                1.2 + Math.random() * 0.1,
                0.35 + Math.random() * 0.05
            );
            this.group.add(fluffMesh);
        }
        
        for (let i = 0; i < 6; i++) {
            const fluff = new THREE.SphereGeometry(0.06, 6, 6);
            const fluffMesh = new THREE.Mesh(fluff, furMaterial);
            fluffMesh.position.set(
                0.3 + Math.random() * 0.1,
                1.2 + Math.random() * 0.1,
                -0.35 - Math.random() * 0.05
            );
            this.group.add(fluffMesh);
        }
    },
    
    calculateOptimalPosition(playerPos, castlePos) {
        const dx = castlePos.x - playerPos.x;
        const dz = castlePos.z - playerPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        const midpointDistance = distance * 0.4;
        
        return {
            x: playerPos.x + (dx / distance) * midpointDistance,
            z: playerPos.z + (dz / distance) * midpointDistance
        };
    },
    
    startWalking(targetX, targetZ) {
        this.targetPosition = { x: targetX, z: targetZ };
        this.isWalking = true;
        this.hasSnorted = false;
        
        const dx = targetX - this.group.position.x;
        const dz = targetZ - this.group.position.z;
        const angle = Math.atan2(dx, dz);
        this.group.rotation.y = angle;
    },
    
    animateWalkCycle() {
        if (!this.isWalking) return;

        this.walkCycle += 0.15;

        // Diagonal leg pairs (front-left & back-right, front-right & back-left)
        const frontLeftPhase  = Math.sin(this.walkCycle);
        const frontRightPhase = Math.sin(this.walkCycle + Math.PI);

        // ---- Front left leg (legs[0]) ----
        this.legs[0].rotation.z = frontLeftPhase * 0.5;
        this.legs[0].position.x = this.legs[0].userData.baseX + frontLeftPhase * 0.15;

        // ---- Front right leg (legs[1]) ----
        this.legs[1].rotation.z = frontRightPhase * 0.5;
        this.legs[1].position.x = this.legs[1].userData.baseX + frontRightPhase * 0.15;

        // ---- Back right leg (legs[2]) ----
        this.legs[2].rotation.z = frontRightPhase * 0.4;
        this.legs[2].position.x = this.legs[2].userData.baseX + frontRightPhase * 0.12;

        // ---- Back left leg (legs[3]) ----
        this.legs[3].rotation.z = frontLeftPhase * 0.4;
        this.legs[3].position.x = this.legs[3].userData.baseX + frontLeftPhase * 0.12;

        // ---- Body bob ----
        this.body.position.y = 1.0 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;

        // ---- Head bob ----
        this.head.rotation.x = Math.sin(this.walkCycle * 2) * 0.08;

        // ---- Tail sway ----
        this.tail.rotation.y = Math.sin(this.walkCycle * 1.5) * 0.4;
    },
    
    stopWalking() {
        this.isWalking = false;
        this.walkCycle = 0;
        
        // Reset legs to base positions
        this.legs.forEach(leg => {
            leg.rotation.z = 0;
            leg.position.x = leg.userData.baseX;
        });
        
        this.body.position.y = 1.0;
        this.head.rotation.x = 0;
        
        if (!this.hasSnorted) {
            this.performSnort();
        }
    },
    
    performSnort() {
        this.hasSnorted = true;
        
        // Head movement
        let snortPhase = 0;
        const snortInterval = setInterval(() => {
            snortPhase += 0.2;
            this.head.rotation.x = Math.sin(snortPhase * 3) * 0.15;
            
            if (snortPhase > Math.PI) {
                clearInterval(snortInterval);
                this.head.rotation.x = 0;
            }
        }, 50);
        
        // Create snort particles
        const nosePos = new THREE.Vector3();
        this.head.getWorldPosition(nosePos);
        nosePos.x += Math.sin(this.group.rotation.y) * 1.05;
        nosePos.z += Math.cos(this.group.rotation.y) * 1.05;
        nosePos.y = 1.25;
        
        for (let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 4, 4);
            const particleMaterial = new THREE.MeshPhongMaterial({
                color: 0xDDDDDD,
                transparent: true,
                opacity: 0.7,
                emissive: 0xAAAAAA,
                emissiveIntensity: 0.3
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.copy(nosePos);
            
            const spreadAngle = (Math.random() - 0.5) * Math.PI / 3;
            const facingAngle = this.group.rotation.y + spreadAngle;
            const upwardAngle = Math.random() * Math.PI / 6;
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.sin(facingAngle) * 0.05,
                    0.02 + Math.random() * 0.03,
                    Math.cos(facingAngle) * 0.05
                ),
                life: 0,
                maxLife: 1.5 + Math.random() * 0.5
            };
            
            this.snortParticles.push(particle);
            window.scene.add(particle);
        }
    },
    
    updateSnortParticles() {
        for (let i = this.snortParticles.length - 1; i >= 0; i--) {
            const particle = this.snortParticles[i];
            
            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.position.z += particle.userData.velocity.z;
            
            particle.userData.velocity.y -= 0.001;
            particle.userData.velocity.x *= 0.98;
            particle.userData.velocity.z *= 0.98;
            
            particle.userData.life += 0.016;
            const fadeProgress = particle.userData.life / particle.userData.maxLife;
            particle.material.opacity = 0.7 * (1 - fadeProgress);
            
            particle.scale.set(
                1 + fadeProgress * 0.5,
                1 + fadeProgress * 0.5,
                1 + fadeProgress * 0.5
            );
            
            if (particle.userData.life >= particle.userData.maxLife) {
                window.scene.remove(particle);
                this.snortParticles.splice(i, 1);
            }
        }
    },
    
    update() {
        // Update snort particles
        this.updateSnortParticles();
        
        // Calculate where reindeer should be
        if (window.player && window.IceMonsters) {
            const playerPos = window.player.position;
            const castlePos = { x: 0, z: -30 };
            
            const optimalPos = this.calculateOptimalPosition(playerPos, castlePos);
            
            const dx = optimalPos.x - this.group.position.x;
            const dz = optimalPos.z - this.group.position.z;
            const distanceToTarget = Math.sqrt(dx * dx + dz * dz);
            
            // Start walking if too far from optimal position
            if (distanceToTarget > 2 && !this.isWalking) {
                this.startWalking(optimalPos.x, optimalPos.z);
            }
            
            // Walking behavior
            if (this.isWalking) {
                this.animateWalkCycle();
                
                const moveX = dx / distanceToTarget * this.walkSpeed;
                const moveZ = dz / distanceToTarget * this.walkSpeed;
                
                this.group.position.x += moveX;
                this.group.position.z += moveZ;
                
                // Stop when close enough
                if (distanceToTarget < 0.5) {
                    this.stopWalking();
                }
            }
        }
        
        // Idle animations when not walking
        if (!this.isWalking) {
            const breathe = Math.sin(Date.now() * 0.0008) * 0.015;
            this.body.scale.y = 1 + breathe * 0.5;
            
            this.tail.rotation.y = Math.sin(Date.now() * 0.002) * 0.3;
            this.tail.rotation.x = Math.PI / 3 + Math.sin(Date.now() * 0.0015) * 0.1;
            
            if (Math.random() < 0.01) {
                this.head.rotation.z = (Math.random() - 0.5) * 0.1;
            } else {
                this.head.rotation.z *= 0.95;
            }
        }
    },
    
    // Add collision data for monsters
    getCollisionData() {
        return {
            type: 'circle',
            radius: 1.5,
            x: this.group.position.x,
            z: this.group.position.z
        };
    }
};

// Add reindeer collision blocking to monsters
window.addEventListener('DOMContentLoaded', () => {
    if (window.collisionObjects && window.reindeer) {
        // Add dynamic collision that updates with reindeer position
        const reindeerCollision = {
            userData: {
                collision: {
                    type: 'circle',
                    get radius() { return 1.5; },
                    get x() { return window.reindeer.group ? window.reindeer.group.position.x : 0; },
                    get z() { return window.reindeer.group ? window.reindeer.group.position.z : 0; }
                }
            }
        };
        window.collisionObjects.push(reindeerCollision);
    }
});