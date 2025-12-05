// Ice Monsters - Refactored to use MonsterBase
const IceMonsters = {
    monsters: [],
    scene: null,
    player: null,
    castlePosition: { x: 0, z: -30 },
    maxMonsters: 15,
    spawnInterval: 2000,
    lastSpawnTime: 0,
    playerHealth: 100,
    playerMaxHealth: 100,
    playerAlive: true,
    iceBlasts: [],
    score: 0,
    monstersKilled: 0,
    survivalTime: 0,
    gameStartTime: 0,
    bossMonster: null,
    bossSpawned: false,
    bossDefeated: false,
    collectibles: [],
    lastCollectibleSpawn: 0,
    collectibleSpawnInterval: 8000,
    giftBoxesCollected: 0,
    giftBoxesNeeded: 3,
    specialAbilityActive: false,
    powerUpActive: false,
    powerUpEndTime: 0,

    init(scene, player, castlePos) {
        console.log('IceMonsters initializing...');
        this.scene = scene;
        this.player = player;
        if (castlePos) {
            this.castlePosition = castlePos;
        }
        this.playerHealth = this.playerMaxHealth;
        this.playerAlive = true;
        this.score = 0;
        this.monstersKilled = 0;
        this.survivalTime = 0;
        this.gameStartTime = Date.now();
        this.bossSpawned = false;
        this.bossMonster = null;
        this.bossDefeated = false;
        this.giftBoxesCollected = 0;
        this.specialAbilityActive = false;
        this.powerUpActive = false;
        this.powerUpEndTime = 0;
        this.updateHealthBar();
        this.updateScore();
        console.log('IceMonsters initialized successfully');
    },
    
    // Use MonsterBase for health bar
    updateHealthBar() {
        if (window.MonsterBase) {
            MonsterBase.updateHealthBar(this.playerHealth, this.playerMaxHealth);
        }
    },
    
    updateScore() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            let extraText = '';
            
            if (this.powerUpActive) {
                const timeLeft = Math.ceil((this.powerUpEndTime - Date.now()) / 1000);
                extraText += ` | ⚡ POWER-UP: ${timeLeft}s`;
            }
            
            if (this.specialAbilityActive) {
                extraText += ` | 🎁 SPECIAL ABILITY UNLOCKED!`;
            } else if (this.giftBoxesCollected > 0) {
                extraText += ` | 🎁 Gifts: ${this.giftBoxesCollected}/${this.giftBoxesNeeded}`;
            }
            
            scoreDisplay.textContent = `Score: ${this.score} | Monsters Defeated: ${this.monstersKilled}${extraText}`;
        }
    },

    takeDamage(amount) {
        if (!this.playerAlive) return;
        
        this.playerHealth -= amount;
        this.updateHealthBar();
        
        if (window.elsa && window.elsa.onHit) {
            window.elsa.onHit();
        }
        
        if (this.playerHealth <= 0) {
            this.playerDie();
        }
    },
    
    // Use MonsterBase for player death
    playerDie() {
        WorldEvents.resetSnowstorm(scene);
        const customHTML = `
            <h1 style="color: #FF6B6B; font-size: 45px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">❄️ FROZEN ❄️</h1>
            <h2 style="color: #FFB6B6; font-size: 36px; margin: 10px 0;">The Ice Monsters Won!</h2>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="color: #FFD700; font-size: 24px; margin: 10px 0;"><strong>Final Score: ${this.score}</strong></p>
                <p style="color: white; font-size: 20px; margin: 10px 0;">Monsters Defeated: ${this.monstersKilled}</p>
                <p style="color: #88DDFF; font-size: 20px; margin: 10px 0;">Survival Time: ${Math.floor((Date.now() - this.gameStartTime) / 1000)}s</p>
            </div>
            <button onclick="window.gameManager.restartWorld()" style="padding: 20px 40px; font-size: 24px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); margin-top: 10px;">
                ❄️ Play Again (Press R) ❄️
            </button>
        `;
        
        if (window.MonsterBase) {
            MonsterBase.handlePlayerDeath(this, customHTML);
        }
    },
    
    // Use MonsterBase for player win
    playerWin() {
        this.survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const bonusScore = 1000 + (this.survivalTime * 10);
        this.score += bonusScore;
        WorldEvents.resetSnowstorm(scene);
        // Hide game over first
        const gameOver = document.getElementById('game-over');
        if (gameOver) gameOver.style.display = 'none';
        
        // Hide world complete screen (we don't need it anymore)
        const worldComplete = document.getElementById('world-complete');
        if (worldComplete) worldComplete.style.display = 'none';
        
        // Show victory screen with button to go to spring
        const victory = document.getElementById('victory-screen');
        if (victory) {
victory.innerHTML = `
    <div style="text-align:center; padding:20px; max-width:400px; margin:auto;
                background:rgba(0,0,0,0.45); border-radius:12px;
                backdrop-filter:blur(6px);">

        <h1 style="color:#FFD700; font-size:32px; margin-bottom:8px;">
            WINTER COMPLETE ❄️
        </h1>

        <p style="color:#E6F7FF; font-size:16px; margin:4px 0 12px;">
            Elsa made it home!
        </p>

        <div style="background:rgba(255,255,255,0.12); padding:12px; border-radius:8px;">
            <p style="color:#FFD700; font-size:18px; margin:6px 0;">
                <strong>Score: ${this.score}</strong>
            </p>
            <p style="color:white; font-size:15px; margin:4px 0;">
                Monsters Defeated: ${this.monstersKilled}
            </p>
            <p style="color:#AADDFF; font-size:15px; margin:4px 0;">
                Time: ${this.survivalTime}s
            </p>
            <p style="color:#90EE90; font-size:14px; margin:4px 0;">
                Bonus: +${bonusScore}
            </p>
        </div>

        <button onclick="window.gameManager.loadNextWorld()"
            style="margin-top:14px; padding:10px 18px; font-size:16px;
                   border:none; border-radius:10px; cursor:pointer;
                   background:#FF69B4; color:white; font-weight:bold;">
            Continue to Spring 🌸
        </button>
    </div>
`;


            victory.style.display = 'block';
        }
        
        this.playerAlive = false;
        
        if (this.player) {
            let celebrateTime = 0;
            const celebrateInterval = setInterval(() => {
                celebrateTime += 0.05;
                this.player.position.y = Math.abs(Math.sin(celebrateTime * 3)) * 0.3;
                this.player.rotation.y += 0.05;
                
                if (celebrateTime > 6) {
                    clearInterval(celebrateInterval);
                    this.player.position.y = 0;
                }
            }, 50);
        }
        
        this.monsters.forEach(monster => {
            monster.alive = false;
        });
    },

    respawn() {
        this.reset();
        
        this.playerHealth = this.playerMaxHealth;
        this.playerAlive = true;
        this.score = 0;
        this.monstersKilled = 0;
        this.gameStartTime = Date.now();
        this.bossSpawned = false;
        this.bossMonster = null;
        this.bossDefeated = false;
        this.giftBoxesCollected = 0;
        this.specialAbilityActive = false;
        this.powerUpActive = false;
        this.updateHealthBar();
        this.updateScore();
        
        const gameOver = document.getElementById('game-over');
        if (gameOver) gameOver.style.display = 'none';
        
        const victory = document.getElementById('victory-screen');
        if (victory) victory.style.display = 'none';
        
        if (this.player) {
            this.player.position.set(0, 0, 0);
            this.player.rotation.z = 0;
        }
    },
    
    createArm(iceMaterial, darkIceMaterial) {
        const arm = new THREE.Group();
        
        const upperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.3, 6),
            darkIceMaterial
        );
        upperArm.position.y = -0.15;
        arm.add(upperArm);
        
        for (let i = 0; i < 3; i++) {
            const claw = new THREE.Mesh(
                new THREE.ConeGeometry(0.03, 0.15, 4),
                iceMaterial
            );
            claw.position.set((i - 1) * 0.06, -0.35, 0);
            claw.rotation.x = Math.PI;
            arm.add(claw);
        }
        
        return arm;
    },
    
    createMonster() {
        const monsterGroup = new THREE.Group();
        
        const iceMaterial = new THREE.MeshPhongMaterial({
            color: 0xAADDFF,
            transparent: true,
            opacity: 0.9,
            shininess: 80,
            emissive: 0x3388FF,
            emissiveIntensity: 0.2
        });
        
        const darkIceMaterial = new THREE.MeshPhongMaterial({
            color: 0x6699CC,
            transparent: true,
            opacity: 0.95,
            shininess: 70
        });
        
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF3333,
            emissive: 0xFF0000,
            emissiveIntensity: 0.8
        });
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.4, 10, 10);
        const body = new THREE.Mesh(bodyGeometry, iceMaterial);
        body.scale.set(1, 1.2, 1);
        body.position.y = 0.5;
        monsterGroup.add(body);
        
        // Ice spikes
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const spike = new THREE.Mesh(
                new THREE.ConeGeometry(0.1, 0.3, 4),
                darkIceMaterial
            );
            spike.position.set(
                Math.cos(angle) * 0.35,
                0.5 + Math.sin(i) * 0.2,
                Math.sin(angle) * 0.35
            );
            spike.rotation.z = Math.PI / 2;
            spike.rotation.y = angle;
            monsterGroup.add(spike);
        }
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 10, 10);
        const head = new THREE.Mesh(headGeometry, iceMaterial);
        head.position.y = 1;
        monsterGroup.add(head);
        
        // Eyes
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMaterial);
        leftEye.position.set(0.1, 1.05, 0.2);
        monsterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMaterial);
        rightEye.position.set(-0.1, 1.05, 0.2);
        monsterGroup.add(rightEye);
        
        // Eyebrows
        const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), darkIceMaterial);
        leftBrow.position.set(0.1, 1.15, 0.18);
        leftBrow.rotation.z = -0.3;
        monsterGroup.add(leftBrow);
        
        const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), darkIceMaterial);
        rightBrow.position.set(-0.1, 1.15, 0.18);
        rightBrow.rotation.z = 0.3;
        monsterGroup.add(rightBrow);
        
        // Mouth
        const mouthGeometry = new THREE.BoxGeometry(0.15, 0.06, 0.04);
        const mouth = new THREE.Mesh(mouthGeometry, darkIceMaterial);
        mouth.position.set(0, 0.88, 0.22);
        monsterGroup.add(mouth);
        
        // Teeth
        for (let i = 0; i < 4; i++) {
            const tooth = new THREE.Mesh(
                new THREE.ConeGeometry(0.02, 0.06, 4),
                new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
            );
            tooth.position.set(-0.06 + i * 0.04, 0.91, 0.23);
            tooth.rotation.x = Math.PI;
            monsterGroup.add(tooth);
        }
        
        // Arms
        const leftArm = this.createArm(iceMaterial, darkIceMaterial);
        leftArm.position.set(0.4, 0.6, 0);
        leftArm.rotation.z = -0.5;
        monsterGroup.add(leftArm);
        
        const rightArm = this.createArm(iceMaterial, darkIceMaterial);
        rightArm.position.set(-0.4, 0.6, 0);
        rightArm.rotation.z = 0.5;
        monsterGroup.add(rightArm);
        
        // Legs
        const leftLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.1, 0.4, 6),
            darkIceMaterial
        );
        leftLeg.position.set(0.15, 0.2, 0);
        monsterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.1, 0.4, 6),
            darkIceMaterial
        );
        rightLeg.position.set(-0.15, 0.2, 0);
        monsterGroup.add(rightLeg);
        
        // Position
        const spawnRadius = 5;
        const angle = Math.random() * Math.PI * 2;
        monsterGroup.position.set(
            this.castlePosition.x + Math.cos(angle) * spawnRadius,
            0,
            this.castlePosition.z + Math.sin(angle) * spawnRadius
        );
        
        const monsterData = {
            group: monsterGroup,
            speed: 0.08 + Math.random() * 0.04,
            wobbleOffset: Math.random() * Math.PI * 2,
            alive: true,
            health: 3,
            attackCooldown: 0,
            attackRange: 2.5,
            stopDistance: 1.5,
            scattered: false,
            scatterDirection: null,
            scatterTime: 0
        };
        
        this.monsters.push(monsterData);
        this.scene.add(monsterGroup);
        
        return monsterData;
    },
    
    createIceBlast(position, direction) {
        const blastGroup = new THREE.Group();
        
        const blastMaterial = new THREE.MeshPhongMaterial({
            color: 0xAAEEFF,
            transparent: true,
            opacity: 0.8,
            emissive: 0x88DDFF,
            emissiveIntensity: 0.6
        });
        
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 12, 12),
            blastMaterial
        );
        blastGroup.add(core);
        
        // Ice shards
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const shard = new THREE.Mesh(
                new THREE.ConeGeometry(0.05, 0.2, 4),
                blastMaterial
            );
            shard.position.set(
                Math.cos(angle) * 0.15,
                0,
                Math.sin(angle) * 0.15
            );
            shard.rotation.z = Math.PI / 2;
            shard.rotation.y = angle;
            blastGroup.add(shard);
        }
        
        blastGroup.position.copy(position);
        blastGroup.position.y = 1;
        
        const blastData = {
            group: blastGroup,
            direction: direction.clone().normalize(),
            speed: 0.3,
            lifetime: 2000,
            createdAt: Date.now()
        };
        
        this.iceBlasts.push(blastData);
        this.scene.add(blastGroup);
        
        return blastData;
    },
    
    shootIceBlast() {
        if (!this.playerAlive || !this.player) return;
        
        const direction = new THREE.Vector3(
            -Math.sin(this.player.rotation.y),
            0,
            -Math.cos(this.player.rotation.y)
        );
        
        this.createIceBlast(this.player.position, direction);
    },
    
    playerJump() {
        if (!this.playerAlive || !this.player) return;
        
        // Scatter nearby monsters
        const scatterRadius = 8;
        this.monsters.forEach(monster => {
            const dx = monster.group.position.x - this.player.position.x;
            const dz = monster.group.position.z - this.player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < scatterRadius) {
                monster.scattered = true;
                monster.scatterDirection = new THREE.Vector3(dx, 0, dz).normalize();
                monster.scatterTime = Date.now();
            }
        });
        
        // Animate jump
        const jumpHeight = 2;
        const jumpDuration = 500;
        const startY = this.player.position.y;
        const startTime = Date.now();
        
        const jumpInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / jumpDuration;
            
            if (progress >= 1) {
                this.player.position.y = startY;
                clearInterval(jumpInterval);
            } else {
                const jumpProgress = Math.sin(progress * Math.PI);
                this.player.position.y = startY + jumpProgress * jumpHeight;
            }
        }, 16);
    },
    
    spawnMonster() {
        if (this.monsters.length < this.maxMonsters && this.playerAlive) {
            this.createMonster();
        }
    },
    
    createBossMonster() {
        const bossGroup = new THREE.Group();
        const scale = 2.5;
        
        const iceMaterial = new THREE.MeshPhongMaterial({
            color: 0x6699FF,
            transparent: true,
            opacity: 0.95,
            shininess: 100,
            emissive: 0x0044FF,
            emissiveIntensity: 0.4
        });
        
        const darkIceMaterial = new THREE.MeshPhongMaterial({
            color: 0x3366AA,
            transparent: true,
            opacity: 0.95,
            shininess: 80
        });
        
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 1
        });
        
        // Body
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.4 * scale, 12, 12),
            iceMaterial
        );
        body.scale.set(1, 1.3, 1);
        body.position.y = 0.5 * scale;
        bossGroup.add(body);
        
        // Crown of spikes
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const spike = new THREE.Mesh(
                new THREE.ConeGeometry(0.15 * scale, 0.5 * scale, 4),
                darkIceMaterial
            );
            spike.position.set(
                Math.cos(angle) * 0.4 * scale,
                0.5 * scale + Math.sin(i) * 0.3 * scale,
                Math.sin(angle) * 0.4 * scale
            );
            spike.rotation.z = Math.PI / 2;
            spike.rotation.y = angle;
            bossGroup.add(spike);
        }
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * scale, 12, 12),
            iceMaterial
        );
        head.position.y = 1.1 * scale;
        bossGroup.add(head);
        
        // Eyes
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.12 * scale, 10, 10),
            eyeMaterial
        );
        leftEye.position.set(0.12 * scale, 1.15 * scale, 0.25 * scale);
        bossGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.12 * scale, 10, 10),
            eyeMaterial
        );
        rightEye.position.set(-0.12 * scale, 1.15 * scale, 0.25 * scale);
        bossGroup.add(rightEye);
        
        // Horns
        for (let i = 0; i < 2; i++) {
            const horn = new THREE.Mesh(
                new THREE.ConeGeometry(0.1 * scale, 0.6 * scale, 4),
                darkIceMaterial
            );
            horn.position.set((i === 0 ? 0.2 : -0.2) * scale, 1.4 * scale, 0);
            horn.rotation.z = (i === 0 ? -0.3 : 0.3);
            bossGroup.add(horn);
        }
        
        // Arms
        for (let i = 0; i < 2; i++) {
            const arm = new THREE.Group();
            const upperArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 0.5 * scale, 8),
                darkIceMaterial
            );
            upperArm.position.y = -0.25 * scale;
            arm.add(upperArm);
            
            // Claws
            for (let j = 0; j < 5; j++) {
                const claw = new THREE.Mesh(
                    new THREE.ConeGeometry(0.05 * scale, 0.25 * scale, 4),
                    iceMaterial
                );
                claw.position.set((j - 2) * 0.08 * scale, -0.55 * scale, 0);
                claw.rotation.x = Math.PI;
                arm.add(claw);
            }
            
            arm.position.set((i === 0 ? 0.5 : -0.5) * scale, 0.7 * scale, 0);
            arm.rotation.z = (i === 0 ? -0.4 : 0.4);
            bossGroup.add(arm);
        }
        
        bossGroup.position.set(
            this.castlePosition.x,
            0,
            this.castlePosition.z + 8
        );
        
        const bossData = {
            group: bossGroup,
            speed: 0.05,
            wobbleOffset: Math.random() * Math.PI * 2,
            alive: true,
            health: 30,
            maxHealth: 30,
            attackCooldown: 0,
            attackRange: 4,
            stopDistance: 2.5,
            isBoss: true,
            scale: scale
        };
        
        this.bossMonster = bossData;
        this.scene.add(bossGroup);
        
        return bossData;
    },
    
    createCollectible(type, position) {
        const collectibleGroup = new THREE.Group();
        
        if (type === 'health') {
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
            
        } else if (type === 'power') {
            const starMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFD700,
                emissive: 0xFFAA00,
                emissiveIntensity: 0.8,
                shininess: 100
            });
            
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
        } else if (type === 'gift') {
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
            
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), giftMaterial);
            collectibleGroup.add(box);
            
            const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.52), ribbonMaterial);
            collectibleGroup.add(ribbonH);
            
            const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.52), ribbonMaterial);
            collectibleGroup.add(ribbonV);
            
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
            
            const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), ribbonMaterial);
            bowCenter.position.y = 0.35;
            collectibleGroup.add(bowCenter);
        }
        
        collectibleGroup.position.copy(position);
        collectibleGroup.position.y = 0.5;
        
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
        if (!this.playerAlive) return;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 10;
        const position = new THREE.Vector3(
            this.player.position.x + Math.cos(angle) * distance,
            0,
            this.player.position.z + Math.sin(angle) * distance
        );
        
        let type;
        if (!this.specialAbilityActive && this.giftBoxesCollected < this.giftBoxesNeeded) {
            const rand = Math.random();
            if (rand < 0.2) {
                type = 'gift';
            } else if (rand < 0.65) {
                type = 'health';
            } else {
                type = 'power';
            }
        } else {
            type = Math.random() < 0.7 ? 'health' : 'power';
        }
        
        this.createCollectible(type, position);
    },

    cleanup() {
        console.log('Cleaning up ice monsters...');
        
        // Use MonsterBase cleanup utilities
        if (window.MonsterBase) {
            this.monsters = MonsterBase.cleanupMonsters(this.monsters, this.scene);
            this.iceBlasts = MonsterBase.cleanupProjectiles(this.iceBlasts, this.scene);
            this.collectibles = MonsterBase.cleanupProjectiles(this.collectibles, this.scene);
        }
        
        if (this.bossMonster && this.bossMonster.group && this.bossMonster.group.parent) {
            this.scene.remove(this.bossMonster.group);
            this.bossMonster = null;
        }
        
        this.playerAlive = false;
        this.bossSpawned = false;
        this.bossDefeated = false;
        
        console.log('Ice monsters cleaned up');
    },
    
    update() {
        if (!this.player || !this.scene || !this.playerAlive) return;
        
        const currentTime = Date.now();
        
        const distanceToCastle = Math.sqrt(
            Math.pow(this.player.position.x - this.castlePosition.x, 2) +
            Math.pow(this.player.position.z - this.castlePosition.z, 2)
        );
        
        // Use MonsterBase for distance display
        if (window.MonsterBase) {
            MonsterBase.updateDistanceDisplay(distanceToCastle, 'Castle');
        }
        
        // Spawn boss when near castle
        if (distanceToCastle < 25 && !this.bossSpawned && this.playerAlive) {
            this.createBossMonster();
            this.bossSpawned = true;
            
            const scoreDisplay = document.getElementById('score-display');
            if (scoreDisplay) {
                const originalText = scoreDisplay.textContent;
                scoreDisplay.textContent = '⚠️ BOSS MONSTER APPEARS! ⚠️';
                scoreDisplay.style.color = '#FF0000';
                scoreDisplay.style.fontSize = '24px';
                setTimeout(() => {
                    scoreDisplay.style.color = '';
                    scoreDisplay.style.fontSize = '';
                    this.updateScore();
                }, 3000);
            }
            
            this.maxMonsters = 0; // Stop spawning regular monsters
        }
        
        // Win condition
        if (distanceToCastle < 15 && this.playerAlive && this.bossDefeated) {
            this.playerWin();
            return;
        }
        
        // Spawn collectibles
        if (currentTime - this.lastCollectibleSpawn > this.collectibleSpawnInterval && this.playerAlive) {
            this.spawnRandomCollectible();
            this.lastCollectibleSpawn = currentTime;
        }
        
        // Update power-up status
        if (this.powerUpActive && currentTime > this.powerUpEndTime) {
            this.powerUpActive = false;
            this.updateScore();
        } else if (this.powerUpActive) {
            this.updateScore();
        }

        // Check for narrative events
        if (window.WorldEvents) {
            WorldEvents.checkTriggers({
                distanceToCastle: distanceToCastle,
                monstersKilled: this.monstersKilled,
                bossSpawned: this.bossSpawned,
                bossDefeated: this.bossDefeated
            });
        }
        
        // Update collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            collectible.group.rotation.y += collectible.rotationSpeed;
            collectible.group.position.y = 0.5 + Math.sin(currentTime * 0.003 + i) * 0.2;
            
            const dx = collectible.group.position.x - this.player.position.x;
            const dz = collectible.group.position.z - this.player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 1) {
                if (collectible.type === 'health') {
                    this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 25);
                    this.updateHealthBar();
                    this.score += 50;
                } else if (collectible.type === 'power') {
                    this.powerUpActive = true;
                    this.powerUpEndTime = currentTime + 10000;
                    this.score += 100;
                } else if (collectible.type === 'gift') {
                    this.giftBoxesCollected++;
                    this.score += 200;
                    
                    if (this.giftBoxesCollected >= this.giftBoxesNeeded) {
                        this.specialAbilityActive = true;
                           
                        const scoreDisplay = document.getElementById('score-display');
                        if (scoreDisplay) {
                            scoreDisplay.textContent = '🎁✨ SPECIAL ABILITY UNLOCKED! Ice Beam can damage the boss! ✨🎁';
                            scoreDisplay.style.color = '#FF1493';
                            scoreDisplay.style.fontSize = '24px';
                            setTimeout(() => {
                                scoreDisplay.style.color = '';
                                scoreDisplay.style.fontSize = '';
                                this.updateScore();
                            }, 4000);
                        }
                    }
                }
                this.updateScore();
                
                this.scene.remove(collectible.group);
                this.collectibles.splice(i, 1);
                continue;
            }
            
            if (currentTime - collectible.createdAt > 30000) {
                this.scene.remove(collectible.group);
                this.collectibles.splice(i, 1);
            }
        }
        
        // Spawn regular monsters
        if (currentTime - this.lastSpawnTime > this.spawnInterval && this.playerAlive) {
            this.spawnMonster();
            this.lastSpawnTime = currentTime;
        }
        
        // Update ice blasts
        const blastDamage = this.powerUpActive ? 2 : 1;
        for (let i = this.iceBlasts.length - 1; i >= 0; i--) {
            const blast = this.iceBlasts[i];
            
            blast.group.position.x += blast.direction.x * blast.speed;
            blast.group.position.z += blast.direction.z * blast.speed;
            blast.group.rotation.y += 0.2;
            
            let hit = false;
            
            // Check boss collision
            if (this.bossMonster && this.bossMonster.alive) {
                if (window.MonsterBase && MonsterBase.checkProjectileCollision(blast, this.bossMonster, 2)) {
                    if (this.specialAbilityActive) {
                        this.bossMonster.health -= blastDamage;
                        hit = true;
                        
                        MonsterBase.flashMonster(this.bossMonster);
                        
                        if (this.bossMonster.health <= 0) {
                            this.bossMonster.alive = false;
                            this.bossDefeated = true;
                            this.monstersKilled++;
                            this.score += 500;
                            this.updateScore();
                            
                            MonsterBase.createExplosionEffect(
                                this.scene,
                                this.bossMonster.group.position,
                                20,
                                0x6699FF,
                                0.2
                            );
                            
                            this.scene.remove(this.bossMonster.group);
                            this.bossMonster = null;
                        }
                    } else {
                        hit = true;
                        MonsterBase.flashMonster(this.bossMonster, 0xFFFF00);
                    }
                }
            }
            
            // Check regular monster collisions
            if (!hit) {
                for (let j = this.monsters.length - 1; j >= 0; j--) {
                    const monster = this.monsters[j];
                    
                    if (window.MonsterBase && MonsterBase.checkProjectileCollision(blast, monster)) {
                        monster.health -= blastDamage;
                        hit = true;
                        
                        MonsterBase.flashMonster(monster);
                        
                        if (monster.health <= 0) {
                            this.monstersKilled++;
                            this.score += 100;
                            this.updateScore();
                            
                            MonsterBase.createExplosionEffect(
                                this.scene,
                                monster.group.position,
                                8,
                                0xAADDFF,
                                0.1
                            );
                            
                            this.scene.remove(monster.group);
                            this.monsters.splice(j, 1);
                        }
                        break;
                    }
                }
            }
            
            if (hit || currentTime - blast.createdAt > blast.lifetime) {
                this.scene.remove(blast.group);
                this.iceBlasts.splice(i, 1);
            }
        }
        
        // Update boss
        if (this.bossMonster && this.bossMonster.alive && this.playerAlive) {
            const boss = this.bossMonster;
            
            if (window.MonsterBase) {
                const distance = MonsterBase.updateMonsterMovement(boss, this.player, currentTime);
                
                MonsterBase.handleMonsterAttack(
                    boss,
                    distance,
                    currentTime,
                    2000,
                    () => this.takeDamage(15)
                );
            }
            
            // Animate boss arms
            if (boss.group.children.length > 8) {
                const leftArm = boss.group.children[boss.group.children.length - 2];
                const rightArm = boss.group.children[boss.group.children.length - 1];
                if (leftArm && rightArm) {
                    leftArm.rotation.x = Math.sin(currentTime * 0.006) * 0.6;
                    rightArm.rotation.x = Math.sin(currentTime * 0.006 + Math.PI) * 0.6;
                }
            }
        }
        
        // Update regular monsters
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            if (!monster.alive) continue;
            
            // Handle scatter effect
            if (monster.scattered && currentTime - monster.scatterTime < 2000) {
                monster.group.position.x += monster.scatterDirection.x * monster.speed * 2;
                monster.group.position.z += monster.scatterDirection.z * monster.speed * 2;
                monster.group.rotation.y = Math.atan2(monster.scatterDirection.x, monster.scatterDirection.z);
                
                const wobble = Math.sin(currentTime * 0.015 + monster.wobbleOffset);
                monster.group.position.y = Math.abs(wobble) * 0.15;
            } else {
                monster.scattered = false;
                
                if (window.MonsterBase) {
                    const distance = MonsterBase.updateMonsterMovement(monster, this.player, currentTime);
                    
                    MonsterBase.handleMonsterAttack(
                        monster,
                        distance,
                        currentTime,
                        1500,
                        () => this.takeDamage(5)
                    );
                }
                
                // Animate arms
                if (monster.group.children.length > 8) {
                    const leftArm = monster.group.children[8];
                    const rightArm = monster.group.children[9];
                    if (leftArm && rightArm) {
                        leftArm.rotation.x = Math.sin(currentTime * 0.008 + monster.wobbleOffset) * 0.5;
                        rightArm.rotation.x = Math.sin(currentTime * 0.008 + monster.wobbleOffset + Math.PI) * 0.5;
                    }
                }
            }
            
            // Remove distant monsters
            const distanceFromCastle = Math.sqrt(
                Math.pow(monster.group.position.x - this.castlePosition.x, 2) +
                Math.pow(monster.group.position.z - this.castlePosition.z, 2)
            );
            
            if (distanceFromCastle > 50) {
                this.scene.remove(monster.group);
                this.monsters.splice(i, 1);
            }
        }
    },
    
    reset() {
        if (window.MonsterBase) {
            this.monsters = MonsterBase.cleanupMonsters(this.monsters, this.scene);
            this.iceBlasts = MonsterBase.cleanupProjectiles(this.iceBlasts, this.scene);
            this.collectibles = MonsterBase.cleanupProjectiles(this.collectibles, this.scene);
        }
        
        if (this.bossMonster && this.bossMonster.group) {
            this.scene.remove(this.bossMonster.group);
        }
        this.bossMonster = null;
        this.bossSpawned = false;
        
        this.lastSpawnTime = 0;
        this.maxMonsters = 15;
    }
};

// Export to window
if (typeof window !== 'undefined') {
    window.IceMonsters = IceMonsters;
    console.log('IceMonsters loaded and attached to window');
    
    // Add keyboard listeners for ice monsters
    window.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
            if (window.iceMonsters && window.iceMonsters.playerAlive) {
                IceMonsters.shootIceBlast();
            }
        }
        if (e.key === 'j' || e.key === 'J') {
            if (window.iceMonsters && window.iceMonsters.playerAlive) {
                IceMonsters.playerJump();
            }
        }
        if (e.key === 'r' || e.key === 'R') {
            if (window.iceMonsters && !IceMonsters.playerAlive) {
                IceMonsters.respawn();
            }
        }
    });
}