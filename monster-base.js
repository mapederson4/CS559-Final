// Monster Base - Shared functionality for all monster systems
const MonsterBase = {
    // Health bar management
    updateHealthBar(health, maxHealth) {
        const healthBar = document.getElementById('health-bar');
        const healthText = document.getElementById('health-text');
        if (healthBar && healthText) {
            const healthPercent = (health / maxHealth) * 100;
            healthBar.style.width = healthPercent + '%';
            healthText.textContent = `Health: ${Math.max(0, Math.round(health))}/${maxHealth}`;
            
            if (healthPercent > 60) {
                healthBar.style.backgroundColor = '#4CAF50';
            } else if (healthPercent > 30) {
                healthBar.style.backgroundColor = '#FFC107';
            } else {
                healthBar.style.backgroundColor = '#F44336';
            }
        }
    },
    
    // Distance to castle/palace display
    updateDistanceDisplay(distance, targetName = 'Castle') {
        const distanceDisplay = document.getElementById('distance-to-castle');
        if (distanceDisplay) {
            distanceDisplay.textContent = `Distance to ${targetName}: ${Math.floor(distance)} units`;
            if (distance < 20) {
                distanceDisplay.style.color = '#90EE90';
            } else if (distance < 35) {
                distanceDisplay.style.color = '#FFD700';
            } else {
                distanceDisplay.style.color = '#FF6B6B';
            }
        }
    },
    
    // Generic player death handler
    handlePlayerDeath(context, customHTML = null) {
        context.playerAlive = false;
        context.playerHealth = 0;
        context.updateHealthBar();
        
        context.survivalTime = Math.floor((Date.now() - context.gameStartTime) / 1000);
        
        const finalScore = document.getElementById('final-score');
        const finalMonsters = document.getElementById('final-monsters');
        const finalTime = document.getElementById('final-time');
        if (finalScore) finalScore.textContent = context.score;
        if (finalMonsters) finalMonsters.textContent = context.monstersKilled;
        if (finalTime) finalTime.textContent = context.survivalTime;
        
        const gameOver = document.getElementById('game-over');
        if (gameOver) {
            if (customHTML) {
                gameOver.innerHTML = customHTML;
            }
            gameOver.style.display = 'block';
        }
        
        const victory = document.getElementById('victory-screen');
        if (victory) {
            victory.style.display = 'none';
        }
        
        if (context.player) {
            let fallRotation = 0;
            const fallInterval = setInterval(() => {
                fallRotation += 0.1;
                context.player.rotation.z = fallRotation;
                if (fallRotation >= Math.PI / 2) {
                    clearInterval(fallInterval);
                }
            }, 30);
        }
        
        context.monsters.forEach(monster => {
            monster.alive = false;
        });
    },
    
    // Generic player win handler
    handlePlayerWin(context, customHTML = null) {
        context.playerAlive = false;
        
        context.survivalTime = Math.floor((Date.now() - context.gameStartTime) / 1000);
        const bonusScore = 1000 + (context.survivalTime * 10);
        context.score += bonusScore;
        
        const victory = document.getElementById('victory-screen');
        if (victory) {
            if (customHTML) {
                victory.innerHTML = customHTML;
            } else {
                const victoryScore = document.getElementById('victory-score');
                const victoryMonsters = document.getElementById('victory-monsters');
                const victoryTime = document.getElementById('victory-time');
                const victoryBonus = document.getElementById('victory-bonus');
                if (victoryScore) victoryScore.textContent = context.score;
                if (victoryMonsters) victoryMonsters.textContent = context.monstersKilled;
                if (victoryTime) victoryTime.textContent = context.survivalTime;
                if (victoryBonus) victoryBonus.textContent = bonusScore;
            }
            victory.style.display = 'block';
        }
        
        const gameOver = document.getElementById('game-over');
        if (gameOver) {
            gameOver.style.display = 'none';
        }
        
        if (context.player) {
            let celebrateTime = 0;
            const celebrateInterval = setInterval(() => {
                celebrateTime += 0.05;
                context.player.position.y = Math.abs(Math.sin(celebrateTime * 3)) * 0.3;
                context.player.rotation.y += 0.05;
                
                if (celebrateTime > 6) {
                    clearInterval(celebrateInterval);
                    context.player.position.y = 0;
                }
            }, 50);
        }
        
        context.monsters.forEach(monster => {
            monster.alive = false;
        });

        setTimeout(() => {
            if (window.gameManager) {
                window.gameManager.completeWorld();
            }
        }, 3000);
    },
    
    // Explosion effect
    createExplosionEffect(scene, position, particleCount, particleColor, particleSize = 0.1) {
        for (let k = 0; k < particleCount; k++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(particleSize, 6, 6),
                new THREE.MeshPhongMaterial({
                    color: particleColor,
                    transparent: true,
                    opacity: 0.8
                })
            );
            particle.position.copy(position);
            
            const angle = (k / particleCount) * Math.PI * 2;
            const velocity = {
                x: Math.cos(angle) * 0.1,
                y: 0.15 + Math.random() * 0.1,
                z: Math.sin(angle) * 0.1
            };
            
            scene.add(particle);
            
            let particleY = particle.position.y;
            const particleInterval = setInterval(() => {
                particle.position.x += velocity.x;
                particle.position.z += velocity.z;
                velocity.y -= 0.01;
                particleY += velocity.y;
                particle.position.y = particleY;
                particle.rotation.x += 0.2;
                particle.rotation.z += 0.1;
                
                if (particleY <= 0) {
                    scene.remove(particle);
                    clearInterval(particleInterval);
                }
            }, 16);
        }
    },
    
    // Flash monster on hit
    flashMonster(monster, flashColor = 0xFFFFFF) {
        if (monster.group && monster.group.children[0]) {
            const originalColor = monster.group.children[0].material.color.getHex();
            monster.group.children[0].material.color.setHex(flashColor);
            setTimeout(() => {
                if (monster.group && monster.group.children[0]) {
                    monster.group.children[0].material.color.setHex(originalColor);
                }
            }, 100);
        }
    },
    
    // Generic monster movement
    updateMonsterMovement(monster, player, currentTime) {
        if (!monster.alive) return 0;
        
        const dx = player.position.x - monster.group.position.x;
        const dz = player.position.z - monster.group.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > monster.stopDistance) {
            monster.group.position.x += (dx / distance) * monster.speed;
            monster.group.position.z += (dz / distance) * monster.speed;
            monster.group.rotation.y = Math.atan2(dx, dz);
            
            // Wobble animation
            const wobble = Math.sin(currentTime * 0.01 + monster.wobbleOffset);
            monster.group.position.y = Math.abs(wobble) * 0.1;
            monster.group.rotation.z = wobble * 0.1;
        }
        
        return distance;
    },
    
    // Generic monster attack
    handleMonsterAttack(monster, distance, currentTime, attackCooldown, onAttack) {
        if (distance <= monster.attackRange) {
            if (currentTime - monster.attackCooldown > attackCooldown) {
                monster.group.scale.set(1.2, 1.2, 1.2);
                setTimeout(() => {
                    if (monster.group) {
                        monster.group.scale.set(1, 1, 1);
                    }
                }, 200);
                
                if (onAttack) onAttack();
                monster.attackCooldown = currentTime;
                return true;
            }
        }
        return false;
    },
    
    // Check projectile collision with monster
    checkProjectileCollision(projectile, monster, hitRadius = 0.8) {
        const dx = projectile.group.position.x - monster.group.position.x;
        const dz = projectile.group.position.z - monster.group.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < hitRadius;
    },
    
    // Cleanup monsters from scene
    cleanupMonsters(monsters, scene) {
        if (monsters && Array.isArray(monsters)) {
            monsters.forEach(monster => {
                if (monster && monster.group && monster.group.parent) {
                    scene.remove(monster.group);
                }
            });
        }
        return [];
    },
    
    // Cleanup projectiles from scene
    cleanupProjectiles(projectiles, scene) {
        if (projectiles && Array.isArray(projectiles)) {
            projectiles.forEach(projectile => {
                if (projectile && projectile.group && projectile.group.parent) {
                    scene.remove(projectile.group);
                }
            });
        }
        return [];
    }
};

window.MonsterBase = MonsterBase;