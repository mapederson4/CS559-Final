// Elsa Character Creator
const ElsaCharacter = {
    group: null,
    body: null,
    head: null,
    leftArm: null,
    rightArm: null,
    dress: null,
    cape: null,
    hair: null,
    isCasting: false,
    iceParticles: [],
    
    create(scene) {
        // Main group to hold all Elsa parts
        this.group = new THREE.Group();
        
        // Create each part
        this.createDress();
        this.createBody();
        this.createHead();
        this.createHair();
        this.createArms();
        this.createCape();
        
        // Position the whole character
        this.group.position.y = 0.5;
        scene.add(this.group);
        
        return this.group;
    },
    
    createDress() {
        // Ice blue dress with sparkle effect
        const dressGroup = new THREE.Group();
        
        // Main dress body - cone shape for the flowing gown
        const dressGeometry = new THREE.ConeGeometry(0.6, 1.4, 8);
        const dressMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8ED8F8, // Ice blue
            shininess: 100,
            transparent: true,
            opacity: 0.95
        });
        const dressMain = new THREE.Mesh(dressGeometry, dressMaterial);
        dressMain.position.y = 0.3;
        dressGroup.add(dressMain);
        
        // Dress overlay with sparkle pattern
        const overlayGeometry = new THREE.ConeGeometry(0.62, 1.4, 8);
        const overlayMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xB4E4F5, // Lighter ice blue
            shininess: 150,
            transparent: true,
            opacity: 0.6,
            emissive: 0x4A90E2,
            emissiveIntensity: 0.2
        });
        const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
        overlay.position.y = 0.3;
        overlay.scale.set(1.01, 1, 1.01);
        dressGroup.add(overlay);
        
        // Crystal details on dress
        for (let i = 0; i < 12; i++) {
            const crystalGeometry = new THREE.OctahedronGeometry(0.03);
            const crystalMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xE0F7FF,
                shininess: 200,
                emissive: 0x89CFF0,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            const angle = (i / 12) * Math.PI * 2;
            const radius = 0.5;
            const height = -0.2 + (i % 3) * 0.2;
            
            crystal.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            dressGroup.add(crystal);
        }
        
        this.dress = dressGroup;
        this.group.add(dressGroup);
    },
    
    createBody() {
        // Torso with corset-style design
        const bodyGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.5, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x6BB6D6, // Darker ice blue for bodice
            shininess: 80
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1.15;
        this.group.add(this.body);
        
        // Snowflake emblem on chest
        const emblemGeometry = new THREE.TorusGeometry(0.08, 0.015, 6, 6);
        const emblemMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xCCEEFF,
            emissiveIntensity: 0.5,
            shininess: 200
        });
        const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
        emblem.position.set(0, 1.2, 0.2);
        emblem.rotation.x = Math.PI / 2;
        this.group.add(emblem);
    },
    
    createHead() {
        // Head
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const skinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFDBCC, // Skin tone
            shininess: 20
        });
        this.head = new THREE.Mesh(headGeometry, skinMaterial);
        this.head.position.y = 1.55;
        this.group.add(this.head);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x4A90E2 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.07, 1.57, 0.17);
        this.group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.07, 1.57, 0.17);
        this.group.add(rightEye);
        
        // Smile
        const smileGeometry = new THREE.TorusGeometry(0.06, 0.01, 8, 16, Math.PI);
        const smileMaterial = new THREE.MeshPhongMaterial({ color: 0xCC6666 });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.48, 0.18);
        smile.rotation.set(0, 0, Math.PI);
        this.group.add(smile);
    },
    
    createHair() {
        // Platinum blonde braid
        const hairGroup = new THREE.Group();
        
        // Main hair volume
        const hairGeometry = new THREE.SphereGeometry(0.22, 16, 16);
        const hairMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xF5E6D3, // Platinum blonde
            shininess: 60
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.scale.set(1, 1.1, 0.9);
        hair.position.y = 1.6;
        hairGroup.add(hair);
        
        // Braid down the side
        for (let i = 0; i < 8; i++) {
            const braidSegment = new THREE.SphereGeometry(0.06 - i * 0.003, 8, 8);
            const segment = new THREE.Mesh(braidSegment, hairMaterial);
            segment.position.set(
                -0.15 - i * 0.02,
                1.5 - i * 0.12,
                -0.05 - i * 0.03
            );
            hairGroup.add(segment);
        }
        
        this.hair = hairGroup;
        this.group.add(hairGroup);
    },
    
    createArms() {
        // Left Arm (the magic arm!)
        const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const skinMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDBCC });
        
        this.leftArm = new THREE.Group();
        const leftArmMesh = new THREE.Mesh(armGeometry, skinMaterial);
        leftArmMesh.position.y = 0.25;
        this.leftArm.add(leftArmMesh);
        this.leftArm.position.set(-0.25, 1.15, 0);
        
        // Sleeve
        const sleeveGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8);
        const sleeveMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8ED8F8,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        leftSleeve.position.y = 0.35;
        this.leftArm.add(leftSleeve);
        
        // Hand
        const handGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
        leftHand.position.y = 0;
        this.leftArm.add(leftHand);
        
        this.group.add(this.leftArm);
        
        // Right Arm (similar)
        this.rightArm = new THREE.Group();
        const rightArmMesh = new THREE.Mesh(armGeometry, skinMaterial);
        rightArmMesh.position.y = 0.25;
        this.rightArm.add(rightArmMesh);
        this.rightArm.position.set(0.25, 1.15, 0);
        
        const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        rightSleeve.position.y = 0.35;
        this.rightArm.add(rightSleeve);
        
        const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
        rightHand.position.y = 0;
        this.rightArm.add(rightHand);
        
        this.group.add(this.rightArm);
    },
    
    createCape() {
        // Translucent ice cape
        const capeGeometry = new THREE.ConeGeometry(0.5, 0.8, 8);
        const capeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xB4E4F5,
            transparent: true,
            opacity: 0.4,
            shininess: 150,
            emissive: 0x6BB6D6,
            emissiveIntensity: 0.1,
            side: THREE.DoubleSide
        });
        this.cape = new THREE.Mesh(capeGeometry, capeMaterial);
        this.cape.position.set(0, 1.2, -0.15);
        this.cape.rotation.x = Math.PI / 6;
        this.group.add(this.cape);
    },
    
    castIceMagic(scene) {
        if (this.isCasting) return;
        
        this.isCasting = true;
        
        // Raise left arm
        const raiseArm = () => {
            let angle = 0;
            const raiseInterval = setInterval(() => {
                angle += 0.1;
                this.leftArm.rotation.z = Math.min(angle, Math.PI / 2);
                this.leftArm.rotation.x = -Math.PI / 4;
                
                if (angle >= Math.PI / 2) {
                    clearInterval(raiseInterval);
                    this.shootIceSpiral(scene);
                }
            }, 16);
        };
        
        raiseArm();
    },
    
    shootIceSpiral(scene) {
        const handPos = new THREE.Vector3();
        const hand = this.leftArm.children[2];
        if (hand) {
            hand.getWorldPosition(handPos);
        } else {
            this.leftArm.getWorldPosition(handPos);
            handPos.y += 0.5;
        }
        
        const facingAngle = this.group.rotation.y;
        const facingDir = new THREE.Vector3(
            Math.sin(facingAngle),
            0,
            Math.cos(facingAngle)
        );
        
        handPos.x += facingDir.x * 0.3;
        handPos.z += facingDir.z * 0.3;
        
        const spiralParticles = [];
        const numParticles = 150;
        const spiralTurns = 8;
        
        const beamGeometry = new THREE.CylinderGeometry(0.15, 0.05, 20, 8);
        const beamMaterial = new THREE.MeshPhongMaterial({
            color: 0xAAEEFF,
            transparent: true,
            opacity: 0.8,
            emissive: 0x88DDFF,
            emissiveIntensity: 1
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.copy(handPos);
        beam.position.x += facingDir.x * 10;
        beam.position.z += facingDir.z * 10;
        beam.position.y += 0.5;
        
        const beamAngle = Math.atan2(facingDir.x, facingDir.z);
        beam.rotation.z = Math.PI / 2;
        beam.rotation.y = beamAngle;
        scene.add(beam);
        
        for (let i = 0; i < numParticles; i++) {
            const t = i / numParticles;
            const distance = t * 20;
            const angle = t * Math.PI * 2 * spiralTurns;
            const radius = 0.3 + Math.sin(t * Math.PI * 4) * 0.4;
            
            const size = 0.08 + Math.random() * 0.1;
            const crystalGeometry = new THREE.OctahedronGeometry(size);
            const crystalMaterial = new THREE.MeshPhongMaterial({
                color: t < 0.3 ? 0xFFFFFF : 0xAAEEFF,
                shininess: 200,
                emissive: t < 0.3 ? 0xCCEEFF : 0x4499FF,
                emissiveIntensity: 1.2 - t * 0.5,
                transparent: true,
                opacity: 1
            });
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            const spiralX = Math.cos(angle) * radius;
            const spiralY = Math.sin(angle * 2) * 0.5;
            const spiralZ = Math.sin(angle) * radius;
            
            crystal.position.set(
                handPos.x + facingDir.x * distance + spiralX,
                handPos.y + spiralY,
                handPos.z + facingDir.z * distance + spiralZ
            );
            
            crystal.userData = {
                initialPos: crystal.position.clone(),
                t: t,
                angle: angle,
                radius: radius,
                facingDir: facingDir.clone()
            };
            
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            scene.add(crystal);
            spiralParticles.push(crystal);
        }
        
        const impactParticles = [];
        for (let i = 0; i < 30; i++) {
            const impactGeometry = new THREE.OctahedronGeometry(0.1);
            const impactMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                emissive: 0x88DDFF,
                emissiveIntensity: 1.5,
                transparent: true,
                opacity: 1
            });
            const impact = new THREE.Mesh(impactGeometry, impactMaterial);
            
            const endPos = new THREE.Vector3(
                handPos.x + facingDir.x * 20,
                handPos.y,
                handPos.z + facingDir.z * 20
            );
            impact.position.copy(endPos);
            
            const explosionAngle = (i / 30) * Math.PI * 2;
            impact.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(explosionAngle) * 0.15,
                    (Math.random() - 0.3) * 0.15,
                    Math.sin(explosionAngle) * 0.15
                )
            };
            
            scene.add(impact);
            impactParticles.push(impact);
        }
        
        let animTime = 0;
        const animateMagic = () => {
            animTime += 0.05;
            
            if (beam.parent) {
                beam.material.emissiveIntensity = 1 + Math.sin(animTime * 10) * 0.5;
                beam.material.opacity = Math.max(0, 0.8 - animTime * 0.3);
            }
            
            spiralParticles.forEach((crystal, i) => {
                const t = crystal.userData.t;
                const baseAngle = crystal.userData.angle;
                const spinAngle = baseAngle + animTime * 5;
                const expandRadius = crystal.userData.radius * (1 + animTime * 0.5);
                const distance = t * 20 * (1 + animTime * 0.1);
                
                const spiralX = Math.cos(spinAngle) * expandRadius;
                const spiralY = Math.sin(spinAngle * 2) * 0.5 + Math.sin(animTime * 3 + i * 0.1) * 0.3;
                const spiralZ = Math.sin(spinAngle) * expandRadius;
                
                crystal.position.set(
                    handPos.x + facingDir.x * distance + spiralX,
                    handPos.y + spiralY,
                    handPos.z + facingDir.z * distance + spiralZ
                );
                
                crystal.rotation.x += 0.15;
                crystal.rotation.y += 0.15;
                
                crystal.material.opacity = Math.max(0, 1 - animTime * 0.4);
                crystal.material.emissiveIntensity = Math.max(0, (1.2 - t * 0.5) * (1 - animTime * 0.3));
                
                // CHECK FOR MONSTER COLLISIONS (WINTER)
                if (window.IceMonsters && !crystal.userData.hit) {
                    // Check boss collision
                    if (window.IceMonsters.bossMonster && window.IceMonsters.bossMonster.alive) {
                        const boss = window.IceMonsters.bossMonster;
                        const dx = crystal.position.x - boss.group.position.x;
                        const dz = crystal.position.z - boss.group.position.z;
                        const distance = Math.sqrt(dx * dx + dz * dz);
                        
                        if (distance < 2) {
                            if (window.IceMonsters.specialAbilityActive) {
                                boss.health -= 1;
                                crystal.userData.hit = true;
                                
                                if (window.MonsterBase) {
                                    window.MonsterBase.flashMonster(boss);
                                }
                                
                                if (boss.health <= 0) {
                                    boss.alive = false;
                                    window.IceMonsters.bossDefeated = true;
                                    window.IceMonsters.monstersKilled++;
                                    window.IceMonsters.score += 500;
                                    window.IceMonsters.updateScore();
                                    
                                    if (window.MonsterBase) {
                                        window.MonsterBase.createExplosionEffect(
                                            scene,
                                            boss.group.position,
                                            20,
                                            0x6699FF,
                                            0.2
                                        );
                                    }
                                    
                                    scene.remove(boss.group);
                                    window.IceMonsters.bossMonster = null;
                                }
                            }
                        }
                    }
                    
                    // Check regular monster collisions
                    if (window.IceMonsters.monsters) {
                        for (let j = window.IceMonsters.monsters.length - 1; j >= 0; j--) {
                            const monster = window.IceMonsters.monsters[j];
                            if (!monster.alive) continue;
                            
                            const dx = crystal.position.x - monster.group.position.x;
                            const dz = crystal.position.z - monster.group.position.z;
                            const distance = Math.sqrt(dx * dx + dz * dz);
                            
                            if (distance < 0.8) {
                                monster.health -= 1;
                                crystal.userData.hit = true;
                                
                                if (window.MonsterBase) {
                                    window.MonsterBase.flashMonster(monster);
                                }
                                
                                if (monster.health <= 0) {
                                    window.IceMonsters.monstersKilled++;
                                    window.IceMonsters.score += 100;
                                    window.IceMonsters.updateScore();
                                    
                                    if (window.MonsterBase) {
                                        window.MonsterBase.createExplosionEffect(
                                            scene,
                                            monster.group.position,
                                            8,
                                            0xAADDFF,
                                            0.1
                                        );
                                    }
                                    
                                    scene.remove(monster.group);
                                    window.IceMonsters.monsters.splice(j, 1);
                                }
                                break;
                            }
                        }
                    }
                }
                
                // CHECK FOR SPRING MONSTER COLLISIONS
                if (window.SpringMonsters && !crystal.userData.hit) {
                    // Check boss collision
                    if (window.SpringMonsters.bossMonster && window.SpringMonsters.bossMonster.alive) {
                        const boss = window.SpringMonsters.bossMonster;
                        const dx = crystal.position.x - boss.group.position.x;
                        const dz = crystal.position.z - boss.group.position.z;
                        const distance = Math.sqrt(dx * dx + dz * dz);
                        
                        if (distance < 2) {
                            if (window.SpringMonsters.specialAbilityActive) {
                                boss.health -= 1;
                                crystal.userData.hit = true;
                                
                                if (window.MonsterBase) {
                                    window.MonsterBase.flashMonster(boss);
                                }
                                
                                if (boss.health <= 0) {
                                    boss.alive = false;
                                    window.SpringMonsters.bossDefeated = true;
                                    window.SpringMonsters.monstersKilled++;
                                    window.SpringMonsters.score += 500;
                                    window.SpringMonsters.updateScore();
                                    
                                    if (window.MonsterBase) {
                                        window.MonsterBase.createExplosionEffect(
                                            scene,
                                            boss.group.position,
                                            20,
                                            0xFF69B4,
                                            0.2
                                        );
                                    }
                                    
                                    scene.remove(boss.group);
                                    window.SpringMonsters.bossMonster = null;
                                }
                            }
                        }
                    }
                    
                    // Check regular spring monster collisions
                    if (window.SpringMonsters.monsters) {
                        for (let j = window.SpringMonsters.monsters.length - 1; j >= 0; j--) {
                            const monster = window.SpringMonsters.monsters[j];
                            if (!monster.alive) continue;
                            
                            const dx = crystal.position.x - monster.group.position.x;
                            const dz = crystal.position.z - monster.group.position.z;
                            const distance = Math.sqrt(dx * dx + dz * dz);
                            
                            if (distance < 0.8) {
                                monster.health -= 1;
                                crystal.userData.hit = true;
                                
                                if (window.MonsterBase) {
                                    window.MonsterBase.flashMonster(monster);
                                }
                                
                                if (monster.health <= 0) {
                                    window.SpringMonsters.monstersKilled++;
                                    window.SpringMonsters.score += 100;
                                    window.SpringMonsters.updateScore();
                                    
                                    if (window.MonsterBase) {
                                        window.MonsterBase.createExplosionEffect(
                                            scene,
                                            monster.group.position,
                                            8,
                                            0xFFB6C1,
                                            0.1
                                        );
                                    }
                                    
                                    scene.remove(monster.group);
                                    window.SpringMonsters.monsters.splice(j, 1);
                                }
                                break;
                            }
                        }
                    }
                }
            });
            
            impactParticles.forEach(impact => {
                impact.position.x += impact.userData.velocity.x;
                impact.position.y += impact.userData.velocity.y;
                impact.position.z += impact.userData.velocity.z;
                
                impact.userData.velocity.y -= 0.01;
                
                impact.rotation.x += 0.2;
                impact.rotation.y += 0.2;
                
                impact.material.opacity = Math.max(0, 1 - animTime * 0.5);
                impact.material.emissiveIntensity = Math.max(0, 1.5 - animTime * 0.8);
            });
            
            if (animTime < 3) {
                requestAnimationFrame(animateMagic);
            } else {
                if (beam.parent) scene.remove(beam);
                spiralParticles.forEach(crystal => {
                    if (crystal.parent) scene.remove(crystal);
                });
                impactParticles.forEach(impact => {
                    if (impact.parent) scene.remove(impact);
                });
                this.lowerArm();
            }
        };
        
        animateMagic();
    },

    lowerArm() {
        // Lower arm back down
        let angle = Math.PI / 2;
        const lowerInterval = setInterval(() => {
            angle -= 0.1;
            this.leftArm.rotation.z = Math.max(angle, 0);
            this.leftArm.rotation.x = Math.max(this.leftArm.rotation.x + 0.05, 0);
            
            if (angle <= 0) {
                clearInterval(lowerInterval);
                this.isCasting = false;
            }
        }, 16);
    },
    
    onHit() {
        // Clear any existing timer
        if (this.hitTimer) {
            clearTimeout(this.hitTimer);
        }
        
        // Store original colors ONCE when first created
        if (!this.originalColors) {
            this.originalColors = new Map();
            if (this.group) {
                this.group.traverse((child) => {
                    if (child.isMesh && child.material && child.material.color) {
                        this.originalColors.set(child.material, child.material.color.getHex());
                    }
                });
            }
        }
        
        // Change all to red
        if (this.group) {
            this.group.traverse((child) => {
                if (child.isMesh && child.material && child.material.color) {
                    child.material.color.setHex(0xFF0000);
                }
            });
        }
        
        // Reset all colors after 500ms
        this.hitTimer = setTimeout(() => {
            if (this.group && this.originalColors) {
                this.group.traverse((child) => {
                    if (child.isMesh && child.material && child.material.color) {
                        const originalColor = this.originalColors.get(child.material);
                        if (originalColor !== undefined) {
                            child.material.color.setHex(originalColor);
                        }
                    }
                });
            }
            this.hitTimer = null;
        }, 500);
    },
    
    update() {
        // Gentle breathing animation
        const breathe = Math.sin(Date.now() * 0.001) * 0.02;
        this.body.position.y = 1.15 + breathe;
        this.head.position.y = 1.55 + breathe;
        
        // Cape sway
        this.cape.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
        
        // Hair sway
        if (this.hair) {
            this.hair.rotation.z = Math.sin(Date.now() * 0.0015) * 0.05;
        }
        
        // Dress crystals sparkle
        if (this.dress) {
            this.dress.children.forEach((child, i) => {
                if (child.geometry && child.geometry.type === 'OctahedronGeometry') {
                    child.rotation.y += 0.02;
                    const pulse = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.7;
                    child.material.emissiveIntensity = pulse * 0.5;
                }
            });
        }
    }
};

// Add keyboard control for casting ice magic
// Press SPACE to cast ice!
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
        if (window.elsa && !window.elsa.isCasting) {
            window.elsa.castIceMagic(window.scene);
        }
    }
});