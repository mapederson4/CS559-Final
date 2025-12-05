// Texture Generator - Creates procedural textures for Full Mode
const TextureGenerator = {
    createSnowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // White base
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add sparkles
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const brightness = Math.random() * 100 + 155;
            ctx.fillStyle = `rgb(${brightness}, ${brightness + 20}, 255)`;
            ctx.fillRect(x, y, 2, 2);
        }
        
        // Add subtle noise
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const gray = Math.random() * 30 + 225;
            ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
            ctx.fillRect(x, y, 1, 1);
        }
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    },
    
    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Green base
        ctx.fillStyle = '#5DBB63';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add grass blades
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const greenShade = Math.floor(Math.random() * 60 + 70);
            ctx.fillStyle = `rgb(${greenShade - 20}, ${greenShade + 130}, ${greenShade - 10})`;
            ctx.fillRect(x, y, 2, 3);
        }
        
        // Add darker patches
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.fillStyle = 'rgba(40, 90, 40, 0.3)';
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 20 + 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    },
    
    createSkyTexture(isSpring = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        if (isSpring) {
            gradient.addColorStop(0, '#87CEEB');  // Sky blue
            gradient.addColorStop(0.5, '#B0E0E6'); // Powder blue
            gradient.addColorStop(1, '#E0F6FF');   // Light blue
        } else {
            gradient.addColorStop(0, '#4A5F8C');   // Winter dark blue
            gradient.addColorStop(0.5, '#87CEEB'); // Sky blue
            gradient.addColorStop(1, '#B0C4DE');   // Light steel blue
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);
        
        // Add clouds
        const numClouds = isSpring ? 15 : 8;
        for (let i = 0; i < numClouds; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 300;
            const size = Math.random() * 80 + 40;
            
            ctx.fillStyle = isSpring ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 0.5, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
            ctx.arc(x - size * 0.5, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    },
    
    createTreeBarkTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Brown base
        ctx.fillStyle = '#654321';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add bark texture
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const brown = Math.floor(Math.random() * 40 + 60);
            ctx.strokeStyle = `rgb(${brown}, ${brown - 20}, ${brown - 40})`;
            ctx.lineWidth = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * 10 - 5, y + Math.random() * 20 + 10);
            ctx.stroke();
        }
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },
    
    createIceTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Light blue base
        ctx.fillStyle = '#C0E8FF';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add ice crystals
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 30 + 10;
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y + size);
            ctx.moveTo(x - size, y);
            ctx.lineTo(x + size, y);
            ctx.moveTo(x - size * 0.7, y - size * 0.7);
            ctx.lineTo(x + size * 0.7, y + size * 0.7);
            ctx.moveTo(x + size * 0.7, y - size * 0.7);
            ctx.lineTo(x - size * 0.7, y + size * 0.7);
            ctx.stroke();
        }
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },
    
    createFlowerTexture(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Transparent background
        ctx.clearRect(0, 0, 128, 128);
        
        // Draw flower
        ctx.fillStyle = color;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = 64 + Math.cos(angle) * 30;
            const y = 64 + Math.sin(angle) * 30;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(64, 64, 12, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
};

window.TextureGenerator = TextureGenerator;