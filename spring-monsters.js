// Spring Monsters - Garden pests and flower guardians!
const SpringMonsters = {
    monsters: [],
    scene: null,
    player: null,
    castlePosition: { x: 0, z: -30 },
    maxMonsters: 12,
    spawnInterval: 3000,
    lastSpawnTime: 0,
    playerHealth: 100,
    playerMaxHealth: 100,
    playerAlive: true,
    flowerBlasts: [],
    score: 0,
    monstersKilled: 0,
    survivalTime: 0,
    gameStartTime: 0,
    bossMonster: null,
    bossSpawned: false,
    bossDefeated: false,
    specialAbilityActive: false,
    giftBoxesCollected: 0,
    giftBoxesNeeded: 3,
    collectibles: [],
    lastCollectibleSpawn: 0,
    collectibleSpawnInterval: 3000,
    
    init(scene, player, castlePos) {
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
        this.specialAbilityActive = false;
        this.giftBoxesCollected = 0;
        this.collectibles = [];
        this.lastCollectibleSpawn = 0;
        this.updateHealthBar();
        this.updateScore();
    },
    
    updateHealthBar() {
        if (window.MonsterBase) {
            MonsterBase.updateHealthBar(this.playerHealth, this.playerMaxHealth);
        }
    },
    
    updateScore() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            let extraText = '';
            
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
    
    playerDie() {
        const customHTML = `
            <h1 style="color: #FF69B4; font-size: 45px; margin: 0;">🌸 WILTED 🌸</h1>
            <h2 style="color: #FFB6B6; font-size: 36px; margin: 10px 0;">The Garden Monsters Won!</h2>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="color: #FFD700; font-size: 24px; margin: 10px 0;"><strong>Final Score: ${this.score}</strong></p>
                <p style="color: white; font-size: 20px; margin: 10px 0;">Monsters Defeated: ${this.monstersKilled}</p>
                <p style="color: #FF69B4; font-size: 20px; margin: 10px 0;">Survival Time: ${Math.floor((Date.now() - this.gameStartTime) / 1000)}s</p>
            </div>
            <button onclick="window.gameManager.restartWorld()" style="padding: 20px 40px; font-size: 24px; background: linear-gradient(135deg, #FF69B4, #FF1493); color: white; border: none; border-radius: 15px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); margin-top: 10px;">
                🌸 Play Again (Press R) 🌸
            </button>
        `;
        
        if (window.MonsterBase) {
            MonsterBase.handlePlayerDeath(this, customHTML);
        }
    },
    
    playerWin() {
        this.survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const bonusScore = 1000 + (this.survivalTime * 10);
        this.score += bonusScore;
        
        // Hide any other screens first
        const gameOver = document.getElementById('game-over');
        if (gameOver) gameOver.style.display = 'none';
        
        const worldComplete = document.getElementById('world-complete');
        if (worldComplete) worldComplete.style.display = 'none';
        
        // Show victory screen
        const victory = document.getElementById('victory-screen');
if (victory) {
    victory.innerHTML = `
    <div style="text-align:center; padding:20px; max-width:400px; margin:auto;
                background:rgba(0,0,0,0.45); border-radius:12px;
                backdrop-filter:blur(6px);">

        <h1 style="color:#FFD700; font-size:32px; margin-bottom:8px;">
            SPRING COMPLETE 🌸
        </h1>

        <p style="color:#FFE6F0; font-size:16px; margin:4px 0 12px;">
            You reached the Flower Palace!
        </p>

        <div style="background:rgba(255,255,255,0.12); padding:12px; border-radius:8px;">
            <p style="color:#FFD700; font-size:18px; margin:6px 0;">
                <strong>Score: ${this.score}</strong>
            </p>
            <p style="color:white; font-size:15px; margin:4px 0;">
                Monsters Defeated: ${this.monstersKilled}
            </p>
            <p style="color:#FFB6C1; font-size:15px; margin:4px 0;">
                Time: ${this.survivalTime}s
            </p>
            <p style="color:#90EE90; font-size:14px; margin:4px 0;">
                Palace Bonus: +${bonusScore}
            </p>
        </div>

        <button onclick="window.gameManager.loadNextWorld()"
            style="margin-top:14px; padding:10px 18px; font-size:16px;
                   border:none; border-radius:10px; cursor:pointer;
                   background:#FF69B4; color:white; font-weight:bold;">
            Continue to Next World 🌼
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
        this.bossDefeated = false;
        this.giftBoxesCollected = 0;
        this.specialAbilityActive = false;
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
    
    createBossMonster() {
        const bossGroup = new THREE.Group();
        const scale = 2.5;
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B0000,
            shininess: 100,
            emissive: 0x400000,
            emissiveIntensity: 0.4
        });
        
        const shellMaterial = new THREE.MeshPhongMaterial({
            color: 0x2F4F2F,
            shininess: 80,
            emissive: 0x1a2a1a,
            emissiveIntensity: 0.3
        });
        
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 1
        });
        
        // Massive body
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * scale, 12, 12),
            bodyMaterial
        );
        body.scale.set(1.5, 1, 1);
        body.position.y = 0.3 * scale;
        bossGroup.add(body);
        
        // Giant shell with spikes
        const shell = new THREE.Mesh(
            new THREE.SphereGeometry(0.35 * scale, 12, 12),
            shellMaterial
        );
        shell.scale.set(1.3, 0.8, 1.2);
        shell.position.y = 0.4 * scale;
        bossGroup.add(shell);
        
        // Spikes on shell
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const spike = new THREE.Mesh(
                new THREE.ConeGeometry(0.1 * scale, 0.4 * scale, 4),
                bodyMaterial
            );
            spike.position.set(
                Math.cos(angle) * 0.4 * scale,
                0.6 * scale,
                Math.sin(angle) * 0.4 * scale
            );
            spike.rotation.z = Math.PI / 2;
            spike.rotation.y = angle;
            bossGroup.add(spike);
        }
        
        // Large head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.15 * scale, 10, 10),
            bodyMaterial
        );
        head.position.set(0, 0.25 * scale, 0.4 * scale);
        bossGroup.add(head);
        
        // Glowing eyes
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.08 * scale, 8, 8),
            eyeMaterial
        );
        leftEye.position.set(0.08 * scale, 0.28 * scale, 0.5 * scale);
        bossGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.08 * scale, 8, 8),
            eyeMaterial
        );
        rightEye.position.set(-0.08 * scale, 0.28 * scale, 0.5 * scale);
        bossGroup.add(rightEye);
        
        // Large mandibles
        for (let i = 0; i < 2; i++) {
            const mandible = new THREE.Mesh(
                new THREE.ConeGeometry(0.08 * scale, 0.3 * scale, 4),
                bodyMaterial
            );
            mandible.position.set(
                (i === 0 ? 0.15 : -0.15) * scale,
                0.2 * scale,
                0.6 * scale
            );
            mandible.rotation.x = Math.PI / 4;
            mandible.rotation.z = (i === 0 ? -0.5 : 0.5);
            bossGroup.add(mandible);
        }
        
        // Giant antennae
        for (let i = 0; i < 2; i++) {
            const antenna = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.5 * scale, 6),
                bodyMaterial
            );
            antenna.position.set((i === 0 ? 0.1 : -0.1) * scale, 0.35 * scale, 0.45 * scale);
            antenna.rotation.z = (i === 0 ? -0.4 : 0.4);
            bossGroup.add(antenna);
            
            const antennaTip = new THREE.Mesh(
                new THREE.SphereGeometry(0.08 * scale, 8, 8),
                eyeMaterial
            );
            antennaTip.position.set(
                (i === 0 ? 0.2 : -0.2) * scale,
                0.6 * scale,
                0.5 * scale
            );
            bossGroup.add(antennaTip);
        }
        
        // Thick legs
        for (let i = 0; i < 6; i++) {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06 * scale, 0.04 * scale, 0.6 * scale, 6),
                bodyMaterial
            );
            const side = i < 3 ? 1 : -1;
            const offset = (i % 3) * 0.3 - 0.3;
            leg.position.set(side * 0.5 * scale, 0.1 * scale, offset * scale);
            leg.rotation.z = side * 1.2;
            bossGroup.add(leg);
        }
        
        bossGroup.position.set(
            this.castlePosition.x,
            0,
            this.castlePosition.z + 8
        );
        
        const bossData = {
            group: bossGroup,
            type: 'boss_beetle',
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
            type = Math.random() < 0.3 ? 'gift' : 'health';
        } else {
            type = 'health';
        }
        
        this.createCollectible(type, position);
    },
    
    createBeetleMonster() {
        const monsterGroup = new THREE.Group();
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x228B22,
            shininess: 80,
            emissive: 0x006400,
            emissiveIntensity: 0.2
        });
        
        const shellMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 60
        });
        
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5
        });
        
        // Body
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 10, 10),
            bodyMaterial
        );
        body.scale.set(1.5, 1, 1);
        body.position.y = 0.3;
        monsterGroup.add(body);
        
        // Shell
        const shell = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 10, 10),
            shellMaterial
        );
        shell.scale.set(1.3, 0.8, 1.2);
        shell.position.y = 0.4;
        monsterGroup.add(shell);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            bodyMaterial
        );
        head.position.set(0, 0.25, 0.4);
        monsterGroup.add(head);
        
        // Eyes
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 6, 6),
            eyeMaterial
        );
        leftEye.position.set(0.08, 0.28, 0.5);
        monsterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 6, 6),
            eyeMaterial
        );
        rightEye.position.set(-0.08, 0.28, 0.5);
        monsterGroup.add(rightEye);
        
        // Antennae
        for (let i = 0; i < 2; i++) {
            const antenna = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4),
                bodyMaterial
            );
            antenna.position.set(i === 0 ? 0.1 : -0.1, 0.35, 0.45);
            antenna.rotation.z = (i === 0 ? -0.3 : 0.3);
            monsterGroup.add(antenna);
            
            const antennaTip = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 6, 6),
                eyeMaterial
            );
            antennaTip.position.set(
                i === 0 ? 0.15 : -0.15,
                0.5,
                0.5
            );
            monsterGroup.add(antennaTip);
        }
        
        // Legs
        for (let i = 0; i < 6; i++) {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.02, 0.4, 4),
                bodyMaterial
            );
            const side = i < 3 ? 1 : -1;
            const offset = (i % 3) * 0.3 - 0.3;
            leg.position.set(side * 0.35, 0.1, offset);
            leg.rotation.z = side * 0.8;
            monsterGroup.add(leg);
        }
        
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
            type: 'beetle',
            speed: 0.06 + Math.random() * 0.03,
            wobbleOffset: Math.random() * Math.PI * 2,
            alive: true,
            health: 3,
            attackCooldown: 0,
            attackRange: 2,
            stopDistance: 1.2
        };
        
        this.monsters.push(monsterData);
        this.scene.add(monsterGroup);
        
        return monsterData;
    },
    
    createFlowerBlast(position, direction) {
        const blastGroup = new THREE.Group();
        
        const blastMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF69B4,
            transparent: true,
            opacity: 0.9,
            emissive: 0xFF1493,
            emissiveIntensity: 0.6
        });
        
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            blastMaterial
        );
        blastGroup.add(core);
        
        // Petals
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const petal = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                blastMaterial
            );
            petal.position.set(
                Math.cos(angle) * 0.15,
                0,
                Math.sin(angle) * 0.15
            );
            petal.scale.set(1, 0.5, 1.5);
            blastGroup.add(petal);
        }
        
        // Sparkles
        for (let i = 0; i < 4; i++) {
            const sparkle = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 6, 6),
                new THREE.MeshPhongMaterial({
                    color: 0xFFD700,
                    emissive: 0xFFD700,
                    emissiveIntensity: 1
                })
            );
            const angle = (i / 4) * Math.PI * 2;
            sparkle.position.set(
                Math.cos(angle) * 0.25,
                Math.sin(angle + Date.now() * 0.01) * 0.1,
                Math.sin(angle) * 0.25
            );
            blastGroup.add(sparkle);
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
        
        this.flowerBlasts.push(blastData);
        this.scene.add(blastGroup);
        
        return blastData;
    },
    
    shootFlowerBlast() {
        if (!this.playerAlive || !this.player) return;
        
        const direction = new THREE.Vector3(
            -Math.sin(this.player.rotation.y),
            0,
            -Math.cos(this.player.rotation.y)
        );
        
        this.createFlowerBlast(this.player.position, direction);
    },
    
    spawnMonster() {
        if (this.monsters.length < this.maxMonsters && this.playerAlive) {
            this.createBeetleMonster();
        }
    },
    
    cleanup() {
        console.log('Cleaning up spring monsters...');
        
        if (window.MonsterBase) {
            this.monsters = MonsterBase.cleanupMonsters(this.monsters, this.scene);
            this.flowerBlasts = MonsterBase.cleanupProjectiles(this.flowerBlasts, this.scene);
            this.collectibles = MonsterBase.cleanupProjectiles(this.collectibles, this.scene);
        }
        
        if (this.bossMonster && this.bossMonster.group && this.bossMonster.group.parent) {
            this.scene.remove(this.bossMonster.group);
            this.bossMonster = null;
        }
        
        this.playerAlive = false;
        this.bossSpawned = false;
        this.bossDefeated = false;
        
        console.log('Spring monsters cleaned up');
    },
    
update() {
    if (!this.player || !this.scene || !this.playerAlive) return;
    
    const currentTime = Date.now();
    
    const distanceToCastle = Math.sqrt(
        Math.pow(this.player.position.x - this.castlePosition.x, 2) +
        Math.pow(this.player.position.z - this.castlePosition.z, 2)
    );
    
    if (window.MonsterBase) {
        MonsterBase.updateDistanceDisplay(distanceToCastle, 'Palace');
    }
    
    // Check for narrative events RIGHT HERE - AFTER distance calculation
    if (window.WorldEvents) {
        WorldEvents.checkTriggers({
            distanceToCastle: distanceToCastle,
            monstersKilled: this.monstersKilled,
            bossSpawned: this.bossSpawned,
            bossDefeated: this.bossDefeated
        });
    }
    
    // Spawn boss when near palace
    if (distanceToCastle < 25 && !this.bossSpawned && this.playerAlive) {
        this.createBossMonster();
        this.bossSpawned = true;
        
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = '⚠️ GIANT BEETLE BOSS APPEARS! ⚠️';
            scoreDisplay.style.color = '#FF0000';
            scoreDisplay.style.fontSize = '24px';
            setTimeout(() => {
                scoreDisplay.style.color = '';
                scoreDisplay.style.fontSize = '';
                this.updateScore();
            }, 3000);
        }
        
        this.maxMonsters = 0;
    }
    
    // ... rest of update code continues ...
        
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
        
        // Update collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            collectible.group.rotation.y += collectible.rotationSpeed;
            collectible.group.position.y = 0.5 + Math.sin(currentTime * 0.003 + i) * 0.2;
            
            const dx = collectible.group.position.x - this.player.position.x;
            const dz = collectible.group.position.z - this.player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 2) {
                if (collectible.type === 'health') {
                    this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 25);
                    this.updateHealthBar();
                    this.score += 50;
                } else if (collectible.type === 'gift') {
                    this.giftBoxesCollected++;
                    this.score += 200;
                    
                    if (this.giftBoxesCollected >= this.giftBoxesNeeded) {
                        this.specialAbilityActive = true;
                        
                        const scoreDisplay = document.getElementById('score-display');
                        if (scoreDisplay) {
                            scoreDisplay.textContent = '🎁✨ SPECIAL ABILITY UNLOCKED! Flower Blast can damage the boss! ✨🎁';
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
        
        if (currentTime - this.lastSpawnTime > this.spawnInterval && this.playerAlive) {
            this.spawnMonster();
            this.lastSpawnTime = currentTime;
        }
        
        // Update flower blasts
        for (let i = this.flowerBlasts.length - 1; i >= 0; i--) {
            const blast = this.flowerBlasts[i];
            
            blast.group.position.x += blast.direction.x * blast.speed;
            blast.group.position.z += blast.direction.z * blast.speed;
            blast.group.rotation.y += 0.3;
            
            let hit = false;
            
            // Check boss collision
            if (this.bossMonster && this.bossMonster.alive) {
                if (window.MonsterBase && MonsterBase.checkProjectileCollision(blast, this.bossMonster, 2)) {
                    if (this.specialAbilityActive) {
                        this.bossMonster.health -= 1;
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
                                0x228B22,
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
                        monster.health -= 1;
                        hit = true;
                        
                        MonsterBase.flashMonster(monster);
                        
                        if (monster.health <= 0) {
                            this.monstersKilled++;
                            this.score += 100;
                            this.updateScore();
                            
                            MonsterBase.createExplosionEffect(
                                this.scene,
                                monster.group.position,
                                6,
                                0xFF69B4,
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
                this.flowerBlasts.splice(i, 1);
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
        }
        
        // Update regular monsters
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            if (!monster.alive) continue;
            
            if (window.MonsterBase) {
                const distance = MonsterBase.updateMonsterMovement(
                    monster,
                    this.player,
                    currentTime
                );
                
                MonsterBase.handleMonsterAttack(
                    monster,
                    distance,
                    currentTime,
                    1800,
                    () => this.takeDamage(4)
                );
            }
        }
    },
    
    reset() {
        if (window.MonsterBase) {
            this.monsters = MonsterBase.cleanupMonsters(this.monsters, this.scene);
            this.flowerBlasts = MonsterBase.cleanupProjectiles(this.flowerBlasts, this.scene);
            this.collectibles = MonsterBase.cleanupProjectiles(this.collectibles, this.scene);
        }
        
        if (this.bossMonster && this.bossMonster.group) {
            this.scene.remove(this.bossMonster.group);
        }
        this.bossMonster = null;
        this.bossSpawned = false;
        
        this.lastSpawnTime = 0;
        this.lastCollectibleSpawn = 0;
        this.maxMonsters = 12;
    }
};

if (typeof window !== 'undefined') {
    window.SpringMonsters = SpringMonsters;
}