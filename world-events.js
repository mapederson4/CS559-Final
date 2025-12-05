// World Events - Dynamic narrative system for both worlds (FIXED)
const WorldEvents = {
    events: [],
    activeEvent: null,
    eventHistory: [],
    
    // Winter-specific events
    winterEvents: [
        {
            id: 'olaf_warning',
            trigger: { type: 'distance_to_castle', value: 35 },
            duration: 5000,
            executed: false,
            action: (scene) => {
                console.log('🎄 EVENT TRIGGERED: Olaf Warning!');
                // FIXED: Use window.olaf directly (it's the OlafCharacter object)
                if (window.olaf && window.player) {
                    // Get the actual Olaf mesh from the scene
                    let olafChar = null;
                    scene.traverse((child) => {
                        if (child.userData && child.userData.isOlaf) {
                            olafChar = child;
                        }
                    });
                    
                    if (!olafChar) {
                        console.log('⚠️ Olaf mesh not found in scene, checking window.olaf');
                        // Fallback: check if olaf is stored differently
                        if (window.olaf.character) {
                            olafChar = window.olaf.character;
                        } else if (window.olaf instanceof THREE.Group || window.olaf instanceof THREE.Mesh) {
                            olafChar = window.olaf;
                        }
                    }
                    
                    if (olafChar) {
                        const startPos = { x: olafChar.position.x, z: olafChar.position.z };
                        const playerPos = window.player.position;
                        
                        console.log('✅ Olaf found! Moving from', startPos, 'to player at', {x: playerPos.x, z: playerPos.z});
                        
                        // Animate Olaf running to player
                        const runDuration = 2000;
                        const startTime = Date.now();
                        
                        const runInterval = setInterval(() => {
                            const elapsed = Date.now() - startTime;
                            const progress = Math.min(elapsed / runDuration, 1);

                            // Desired target offset so Olaf stops NEXT TO Elsa
                            const desiredDistance = 2; // Olaf stops 2 units away

                            const dx = playerPos.x - startPos.x;
                            const dz = playerPos.z - startPos.z;

                            const dist = Math.sqrt(dx*dx + dz*dz);

                            // NORMALIZED direction to Elsa
                            const dirX = dx / dist;
                            const dirZ = dz / dist;

                            // Olaf target = Elsa position MINUS a safety offset
                            const targetX = playerPos.x - dirX * desiredDistance;
                            const targetZ = playerPos.z - dirZ * desiredDistance;

                            // Animate towards the offset target
                            olafChar.position.x = startPos.x + (targetX - startPos.x) * progress;
                            olafChar.position.z = startPos.z + (targetZ - startPos.z) * progress;

                            // Cute wobble
                            olafChar.position.y = Math.abs(Math.sin(elapsed * 0.01)) * 0.3;

                            // Stop animation
                            if (progress >= 1) {
                                clearInterval(runInterval);
                                WorldEvents.createSpeechBubble(olafChar.position, '⚠️', 3000);
                                WorldEvents.olafJumpExcited(olafChar);
                            }
                        }, 16);

                    } else {
                        console.log('❌ Could not find Olaf character');
                    }
                } else {
                    console.log('❌ window.olaf or window.player not found');
                }
            }
        },
        {
            id: 'reindeer_companion',
            trigger: { type: 'monster_count', value: 5 },
            duration: 10000,
            executed: false,
            action: (scene) => {
                console.log('🦌 EVENT TRIGGERED: Reindeer Defense Mode!');
                // FIXED: Use window.reindeer directly
                if (window.reindeer && window.player) {
                    // Get the actual Reindeer mesh from the scene
                    let reindeerChar = null;
                    scene.traverse((child) => {
                        if (child.userData && child.userData.isReindeer) {
                            reindeerChar = child;
                        }
                    });
                    
                    if (!reindeerChar) {
                        console.log('⚠️ Reindeer mesh not found in scene, checking window.reindeer');
                        if (window.reindeer.character) {
                            reindeerChar = window.reindeer.character;
                        } else if (window.reindeer instanceof THREE.Group || window.reindeer instanceof THREE.Mesh) {
                            reindeerChar = window.reindeer;
                        }
                    }
                    
                    if (reindeerChar) {
                        console.log('✅ Reindeer found at position:', reindeerChar.position);
                        WorldEvents.createSpeechBubble(reindeerChar.position, '🛡️', 2000);
                        WorldEvents.reindeerDefenseMode(reindeerChar, window.player);
                    } else {
                        console.log('❌ Could not find Reindeer character');
                    }
                } else {
                    console.log('❌ window.reindeer or window.player not found');
                }
            }
        },
        {
            id: 'snowstorm_intensifies',
            trigger: { type: 'boss_spawn', value: true },
            duration: 0,
            executed: false,
            action: (scene) => {
                console.log('❄️ EVENT TRIGGERED: Snowstorm Intensifies!');
                WorldEvents.intensifySnowstorm(scene);
                WorldEvents.createSpeechBubble(window.player.position, '💪', 2000);
            }
        },
        {
            id: 'olaf_celebrates',
            trigger: { type: 'boss_defeated', value: true },
            duration: 5000,
            executed: false,
            action: (scene) => {
                console.log('🎉 EVENT TRIGGERED: Olaf Celebrates!');
                if (window.olaf) {
                    let olafChar = null;
                    scene.traverse((child) => {
                        if (child.userData && child.userData.isOlaf) {
                            olafChar = child;
                        }
                    });
                    
                    if (!olafChar && window.olaf.character) {
                        olafChar = window.olaf.character;
                    } else if (!olafChar && (window.olaf instanceof THREE.Group || window.olaf instanceof THREE.Mesh)) {
                        olafChar = window.olaf;
                    }
                    
                    if (olafChar) {
                        WorldEvents.createSpeechBubble(olafChar.position, '🎉', 3000);
                        WorldEvents.olafCelebrate(olafChar);
                    }
                }
            }
        }
    ],
    
    // Spring-specific events
    springEvents: [
        {
            id: 'butterfly_guide',
            trigger: { type: 'distance_to_palace', value: 40 },
            duration: 8000,
            executed: false,
            action: (scene) => {
                console.log('🦋 EVENT TRIGGERED: Butterfly Guide!');
                WorldEvents.spawnGoldenButterfly(scene, window.player);
            }
        },
        {
            id: 'flower_bloom',
            trigger: { type: 'monster_count', value: 3 },
            duration: 4000,
            executed: false,
            action: (scene) => {
                console.log('🌸 EVENT TRIGGERED: Flowers Bloom!');
                WorldEvents.bloomFlowersAroundPlayer(scene, window.player.position);
            }
        },
        {
            id: 'mantis_arrival',
            trigger: { type: 'boss_spawn', value: true },
            duration: 0,
            executed: false,
            action: (scene) => {
                console.log('🌺 EVENT TRIGGERED: Boss Arrival!');
                WorldEvents.createPetalVortex(scene);
                WorldEvents.createSpeechBubble(window.player.position, '⚔️', 2000);
            }
        },
        {
            id: 'garden_celebration',
            trigger: { type: 'boss_defeated', value: true },
            duration: 6000,
            executed: false,
            action: (scene) => {
                console.log('🎊 EVENT TRIGGERED: Garden Celebration!');
                WorldEvents.gardenCelebration(scene);
            }
        }
    ],
    
    init(world) {
        this.events = world === 'winter' ? this.winterEvents : this.springEvents;
        this.activeEvent = null;
        this.eventHistory = [];
        // Reset executed flags
        this.events.forEach(event => event.executed = false);
        console.log(`🎮 WorldEvents initialized for ${world} world with ${this.events.length} events`);
    },
    
    checkTriggers(gameState) {
        // Debug log every 100 frames to avoid spam
        if (Math.random() < 0.01) {
            console.log('📊 Game State:', {
                distance: gameState.distanceToCastle?.toFixed(1),
                monstersKilled: gameState.monstersKilled,
                bossSpawned: gameState.bossSpawned,
                bossDefeated: gameState.bossDefeated
            });
        }
        
        this.events.forEach(event => {
            if (event.executed) return;
            
            let shouldTrigger = false;
            
            switch (event.trigger.type) {
                case 'distance_to_castle':
                case 'distance_to_palace':
                    if (gameState.distanceToCastle <= event.trigger.value) {
                        shouldTrigger = true;
                        console.log(`✅ Distance trigger met for ${event.id}: ${gameState.distanceToCastle.toFixed(1)} <= ${event.trigger.value}`);
                    }
                    break;
                case 'monster_count':
                    if (gameState.monstersKilled >= event.trigger.value) {
                        shouldTrigger = true;
                        console.log(`✅ Monster count trigger met for ${event.id}: ${gameState.monstersKilled} >= ${event.trigger.value}`);
                    }
                    break;
                case 'boss_spawn':
                    if (gameState.bossSpawned) {
                        shouldTrigger = true;
                        console.log(`✅ Boss spawn trigger met for ${event.id}`);
                    }
                    break;
                case 'boss_defeated':
                    if (gameState.bossDefeated) {
                        shouldTrigger = true;
                        console.log(`✅ Boss defeated trigger met for ${event.id}`);
                    }
                    break;
            }
            
            if (shouldTrigger) {
                this.triggerEvent(event, window.scene);
            }
        });
    },
    
    triggerEvent(event, scene) {
        console.log('🎬 Triggering event:', event.id);
        event.executed = true;
        this.activeEvent = event;
        this.eventHistory.push(event.id);
        
        if (event.action) {
            event.action(scene);
        }
        
        if (event.duration > 0) {
            setTimeout(() => {
                if (this.activeEvent === event) {
                    this.activeEvent = null;
                }
            }, event.duration);
        }
    },
    
    // Helper functions for visual effects
    createSpeechBubble(position, emoji, duration) {
        const bubbleGroup = new THREE.Group();
        
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // White bubble
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(64, 64, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Black border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Emoji
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.fillText(emoji, 64, 64);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 2, 1);
        sprite.position.copy(position);
        sprite.position.y += 3;
        
        window.scene.add(sprite);
        
        // Animate bubble
        let bobTime = 0;
        const bobInterval = setInterval(() => {
            bobTime += 0.1;
            sprite.position.y = position.y + 3 + Math.sin(bobTime) * 0.2;
        }, 16);
        
        setTimeout(() => {
            clearInterval(bobInterval);
            window.scene.remove(sprite);
        }, duration);
    },
    
    olafJumpExcited(character) {
        let jumpTime = 0;
        const jumpInterval = setInterval(() => {
            jumpTime += 0.1;
            character.position.y = Math.abs(Math.sin(jumpTime * 3)) * 0.8;
            character.rotation.y += 0.2;
            
            if (jumpTime > 2) {
                clearInterval(jumpInterval);
                character.position.y = 0;
            }
        }, 16);
    },
    
    reindeerDefenseMode(character, player) {
        console.log('🦌 Reindeer rearing animation triggered!');

        // --- CONFIG ---
        const rearHeight = 2.5;     // how high the front lifts
        const rearTilt = -0.8;      // tilt backwards
        const duration = 1500;      // total animation time
        const smokeCount = 12;      // number of smoke particles

        const startTime = Date.now();
        const startY = character.position.y;
        const startRotX = character.rotation.x;

        // SMOKE PUFF FUNCTION
        const spawnSmokePuff = () => {
            for (let i = 0; i < smokeCount; i++) {
                const smoke = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2, 8, 8),
                    new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.9
                    })
                );

                smoke.position.copy(character.position);
                smoke.position.y += 0.2;

                smoke.userData = {
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: Math.random() * 0.5 + 0.2,
                    vz: (Math.random() - 0.5) * 0.6,
                    life: 800 + Math.random() * 300
                };

                window.scene.add(smoke);

                // Animate each particle
                const puffStart = Date.now();
                const puffInterval = setInterval(() => {
                    const t = Date.now() - puffStart;
                    const p = smoke.userData;

                    smoke.position.x += p.vx * 0.1;
                    smoke.position.y += p.vy * 0.05;
                    smoke.position.z += p.vz * 0.1;

                    smoke.material.opacity = Math.max(0, 1 - t / p.life);

                    if (t > p.life) {
                        clearInterval(puffInterval);
                        window.scene.remove(smoke);
                    }
                }, 16);
            }
        };

        // MAIN REARING ANIMATION
        const anim = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            // GOING UP (first half)
            if (progress < 0.5) {
                const p = progress * 2;
                character.position.y = startY + rearHeight * p;
                character.rotation.x = startRotX + rearTilt * p;

            // FALLING BACK DOWN (second half)
            } else {
                const p = (progress - 0.5) * 2;
                character.position.y = startY + rearHeight * (1 - p);
                character.rotation.x = startRotX + rearTilt * (1 - p);
            }

            // Emit smoke near the peak
            if (progress > 0.45 && progress < 0.55) {
                spawnSmokePuff();
            }

            if (progress >= 1) {
                clearInterval(anim);

                // restore exact base posture
                character.position.y = startY;
                character.rotation.x = startRotX;

                console.log("🦌 Reindeer rearing complete!");
            }
        }, 16);
    },

    
    olafCelebrate(character) {
        let celebrateTime = 0;
        const celebrateInterval = setInterval(() => {
            celebrateTime += 0.1;
            character.position.y = Math.abs(Math.sin(celebrateTime * 4)) * 1;
            character.rotation.y += 0.3;
            
            // Sparkles
            if (Math.random() < 0.3) {
                const sparkle = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 8, 8),
                    new THREE.MeshPhongMaterial({
                        color: 0xFFD700,
                        emissive: 0xFFD700,
                        emissiveIntensity: 1
                    })
                );
                sparkle.position.copy(character.position);
                sparkle.position.y += 1;
                window.scene.add(sparkle);
                
                setTimeout(() => window.scene.remove(sparkle), 1000);
            }
            
            if (celebrateTime > 4) {
                clearInterval(celebrateInterval);
                character.position.y = 0;
            }
        }, 16);
    },
    
intensifySnowstorm(scene) {
    // DARKEN SKY TO NEAR-NIGHT
    if (scene.background && scene.background.isColor) {
        scene.background.setHex(0x1A2438); // almost nightfall
    }

    // FOG BECOMES THICK LIKE DEATH
    if (scene.fog) {
        scene.fog.near = 3;
        scene.fog.far = 18;
    }

    // SNOW EXPLODES INTO HYPER-STORM MODE
    if (window.snowflakes) {
        window.snowflakes.forEach(flake => {
            // INSANE fall speed
            flake.userData.fallSpeed = 0.4 + Math.random() * 0.25;

            // hurricane-level sideways drift
            flake.userData.driftSpeed = (Math.random() - 0.5) * 0.8;
            
            // random shake for chaotic motion
            flake.userData.stormShake = true;
        });
    }

    // ENABLE WORLD WIND
    window.windEffect = true;
    window.windPower = 3 + Math.random() * 2; // HUGE wind

    // CAMERA SHAKES LIKE A HORROR MOVIE
    window.extremeCameraShake = true;

    // LIGHTS FLICKER AS IF POWER IS STRUGGLING
    scene.traverse(obj => {
        if (obj.isPointLight) {
            obj.intensity = 10;
            obj.distance = 20;
            obj.castShadow = true;

            // flicker effect
            obj.userData.flicker = true;
        }
    });

    console.warn("⚠ ULTRA SNOWSTORM ACTIVATED — GOOD LUCK.");
},

    
    spawnGoldenButterfly(scene, player) {
        const butterflyGroup = new THREE.Group();
        
        const wingMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.8,
            shininess: 100,
            side: THREE.DoubleSide
        });
        
        const leftWing = new THREE.Mesh(
            new THREE.CircleGeometry(0.3, 16),
            wingMaterial
        );
        leftWing.position.x = -0.15;
        butterflyGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(
            new THREE.CircleGeometry(0.3, 16),
            wingMaterial
        );
        rightWing.position.x = 0.15;
        butterflyGroup.add(rightWing);
        
        butterflyGroup.position.set(
            player.position.x,
            player.position.y + 2,
            player.position.z - 3
        );
        
        scene.add(butterflyGroup);
        
        // Guide player toward palace
        const guideInterval = setInterval(() => {
            const targetX = 0;
            const targetZ = -30;
            
            const dx = targetX - butterflyGroup.position.x;
            const dz = targetZ - butterflyGroup.position.z;
            
            butterflyGroup.position.x += dx * 0.01;
            butterflyGroup.position.z += dz * 0.01;
            butterflyGroup.position.y = 2 + Math.sin(Date.now() * 0.005) * 0.5;
            
            // Flap wings
            leftWing.rotation.y = Math.sin(Date.now() * 0.02) * 0.5;
            rightWing.rotation.y = -Math.sin(Date.now() * 0.02) * 0.5;
        }, 16);
        
        setTimeout(() => {
            clearInterval(guideInterval);
            scene.remove(butterflyGroup);
        }, 8000);
    },
    
    bloomFlowersAroundPlayer(scene, position) {
        const flowerColors = [0xFF69B4, 0xFFD700, 0xFF4500, 0x9370DB];
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 2 + Math.random() * 2;
            
            const flowerGroup = new THREE.Group();
            
            // Petals
            for (let j = 0; j < 6; j++) {
                const petalAngle = (j / 6) * Math.PI * 2;
                const petal = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15, 8, 8),
                    new THREE.MeshPhongMaterial({
                        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
                        shininess: 60
                    })
                );
                petal.position.set(
                    Math.cos(petalAngle) * 0.2,
                    0,
                    Math.sin(petalAngle) * 0.2
                );
                petal.scale.set(1, 0.5, 1.5);
                flowerGroup.add(petal);
            }
            
            // Center
            const center = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshPhongMaterial({ color: 0xFFFF00 })
            );
            flowerGroup.add(center);
            
            flowerGroup.position.set(
                position.x + Math.cos(angle) * radius,
                -0.5,
                position.z + Math.sin(angle) * radius
            );
            
            scene.add(flowerGroup);
            
            // Animate blooming
            let bloomTime = 0;
            const bloomInterval = setInterval(() => {
                bloomTime += 0.05;
                flowerGroup.position.y = -0.5 + Math.min(bloomTime, 0.5);
                flowerGroup.scale.set(bloomTime, bloomTime, bloomTime);
                
                if (bloomTime >= 1) {
                    clearInterval(bloomInterval);
                }
            }, 16);
        }
    },
    
    createPetalVortex(scene) {
        const petals = [];
        
        for (let i = 0; i < 50; i++) {
            const petal = new THREE.Mesh(
                new THREE.CircleGeometry(0.15, 6),
                new THREE.MeshPhongMaterial({
                    color: 0xFFB6C1,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide
                })
            );
            
            const angle = (i / 50) * Math.PI * 2;
            const radius = 10;
            petal.position.set(
                Math.cos(angle) * radius,
                Math.random() * 5,
                Math.sin(angle) * radius - 30
            );
            
            petals.push({ mesh: petal, angle: angle, height: 0 });
            scene.add(petal);
        }
        
        let vortexTime = 0;
        const vortexInterval = setInterval(() => {
            vortexTime += 0.05;
            
            petals.forEach((petal, i) => {
                petal.angle += 0.1;
                petal.height += 0.1;
                
                const radius = 10 - (vortexTime * 0.5);
                petal.mesh.position.x = Math.cos(petal.angle) * Math.max(radius, 2);
                petal.mesh.position.y = petal.height;
                petal.mesh.position.z = Math.sin(petal.angle) * Math.max(radius, 2) - 30;
                
                petal.mesh.rotation.z += 0.1;
            });
            
            if (vortexTime > 8) {
                clearInterval(vortexInterval);
                petals.forEach(petal => scene.remove(petal.mesh));
            }
        }, 16);
    },
    
    gardenCelebration(scene) {
        // All flowers bloom and sparkle
        if (window.SpringWorld && window.SpringWorld.flowers) {
            window.SpringWorld.flowers.forEach((flower, i) => {
                setTimeout(() => {
                    // Scale up flower
                    flower.scale.set(1.5, 1.5, 1.5);
                    
                    // Add sparkle
                    const sparkle = new THREE.Mesh(
                        new THREE.SphereGeometry(0.2, 8, 8),
                        new THREE.MeshPhongMaterial({
                            color: 0xFFFFFF,
                            emissive: 0xFFFFFF,
                            emissiveIntensity: 1,
                            transparent: true,
                            opacity: 1
                        })
                    );
                    sparkle.position.copy(flower.position);
                    sparkle.position.y += 1;
                    scene.add(sparkle);
                    
                    setTimeout(() => {
                        scene.remove(sparkle);
                        flower.scale.set(1, 1, 1);
                    }, 1000);
                }, i * 50);
            });
        }
        
        // Butterflies dance
        if (window.SpringWorld && window.SpringWorld.butterflies) {
            window.SpringWorld.butterflies.forEach(butterfly => {
                butterfly.userData.celebrationMode = true;
                setTimeout(() => {
                    butterfly.userData.celebrationMode = false;
                }, 6000);
            });
        }
    }
};

window.WorldEvents = WorldEvents;