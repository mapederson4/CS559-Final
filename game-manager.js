// Game Manager - Handles world transitions with proper initialization
const GameManager = {
    currentWorld: 'winter',
    currentMonsterSystem: null,
    score: 0,
    monstersDefeated: 0,
    initialized: false,
    
    init() {
        console.log('GameManager initializing...');

        if (window.WorldEvents) {
            WorldEvents.init('winter');
        }
        // Wait for dependencies
        if (!window.IceMonsters || !window.MonsterBase) {
            console.log('Waiting for dependencies...');
            setTimeout(() => this.init(), 100);
            return;
        }
        
        window.gameManager = this;
        this.currentMonsterSystem = window.IceMonsters;
        this.initialized = true;
        
        console.log('GameManager initialized successfully');
        console.log('Current monster system:', this.currentMonsterSystem ? 'IceMonsters' : 'none');
    },
    
    completeWorld() {
        const worldComplete = document.getElementById('world-complete');
        if (worldComplete) {
            worldComplete.style.display = 'block';
        }
    },
    
    loadNextWorld() {
        console.log('Loading next world...');
        
        // Hide victory and world complete screens
        const victory = document.getElementById('victory-screen');
        if (victory) {
            victory.style.display = 'none';
        }
        
        const worldComplete = document.getElementById('world-complete');
        if (worldComplete) {
            worldComplete.style.display = 'none';
        }
        
        if (this.currentWorld === 'winter') {
            this.currentWorld = 'spring';
            this.loadSpringWorld();
        } else if (this.currentWorld === 'spring') {
            // Could add more worlds here
            alert('🎉 Congratulations! You\'ve completed all worlds! 🎉\n\nMore worlds coming soon!');
        } else {
            alert('More worlds coming soon!');
        }
    },
    
    loadSpringWorld() {
        console.log('Loading Spring World...');
        
        // Cleanup current monster system
        if (this.currentMonsterSystem && this.currentMonsterSystem.cleanup) {
            console.log('Cleaning up winter monsters...');
            this.currentMonsterSystem.cleanup();
        }
        
        // Check if SpringWorld exists
        if (!window.SpringWorld) {
            console.error('SpringWorld not loaded!');
            return;
        }

        // Initialize Spring world events
        if (window.WorldEvents) {
            WorldEvents.init('spring');
        }
        
        // Create spring world
        const newCollisions = SpringWorld.create(window.scene);
        window.collisionObjects = newCollisions;
        
        // Reset player
        if (window.player) {
            window.player.position.set(0, 0.5, 0);
            window.player.rotation.z = 0;
        }
        
        // Switch to spring monsters
        if (window.SpringMonsters) {
            this.currentMonsterSystem = window.SpringMonsters;
            SpringMonsters.init(window.scene, window.player, { x: 0, z: -30 });
            console.log('Spring monsters initialized');
        } else {
            console.error('SpringMonsters not loaded!');
        }
        
        // Apply textures if in full mode
        if (window.currentMode === 'full' && window.TextureGenerator) {
            this.applySpringTextures();
        }
        
        // Update UI
        const worldIndicator = document.getElementById('world-indicator');
        if (worldIndicator) {
            worldIndicator.textContent = 'World: Spring 🌸';
            worldIndicator.style.background = 'linear-gradient(135deg, #FF69B4, #FF1493)';
        }
        
        const infoTitle = document.querySelector('#info h2');
        if (infoTitle) {
            infoTitle.textContent = '🌸 Spring Garden Defense 🌸';
        }
        
        const controls = document.querySelector('#info div:last-child');
        if (controls) {
            controls.querySelector('p:nth-child(5)').innerHTML = '<strong>🏰 Goal: Reach the palace!</strong>';
            controls.querySelector('p:nth-child(6)').style.display = 'none'; // Hide gift box instruction
        }
        
        console.log('Spring world loaded successfully');
    },
    
    applySpringTextures() {
        if (window.ground && window.TextureGenerator) {
            window.ground.material.map = TextureGenerator.createGrassTexture();
            window.ground.material.needsUpdate = true;
        }
        
        if (window.scene && window.TextureGenerator) {
            window.scene.background = TextureGenerator.createSkyTexture(true);
        }
        
        // Apply bark texture to cherry trees
        if (window.SpringWorld && window.SpringWorld.trees && window.TextureGenerator) {
            const barkTexture = TextureGenerator.createTreeBarkTexture();
            window.SpringWorld.trees.forEach(tree => {
                tree.traverse((child) => {
                    if (child.isMesh && child.material && child.material.color) {
                        const colorHex = child.material.color.getHex();
                        if (colorHex === 0x8B4513) {
                            child.material.map = barkTexture;
                            child.material.needsUpdate = true;
                        }
                    }
                });
            });
        }
    },
    
    restartWorld() {
        console.log('Restarting world...');
        
        if (this.currentWorld === 'winter') {
            // Just respawn in winter
            if (window.IceMonsters) {
                window.IceMonsters.respawn();
            }
        } else if (this.currentWorld === 'spring') {
            // Respawn in spring
            if (window.SpringMonsters) {
                window.SpringMonsters.respawn();
            }
        } else {
            // Fallback: reload page
            window.location.reload();
        }
    },
    
    getCurrentMonsterSystem() {
        return this.currentMonsterSystem;
    },
    
    isInitialized() {
        return this.initialized;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing GameManager...');
        GameManager.init();
    });
} else {
    console.log('DOM already loaded, initializing GameManager...');
    GameManager.init();
}

// Also export to window immediately
window.gameManager = GameManager;