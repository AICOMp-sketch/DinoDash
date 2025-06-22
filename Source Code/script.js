document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            const scoreDisplay = document.getElementById('scoreDisplay');
            const startScreen = document.getElementById('startScreen');
            const gameOverScreen = document.getElementById('gameOverScreen');
            const startButton = document.getElementById('startButton');
            const restartButton = document.getElementById('restartButton');
            const finalScoreDisplay = document.getElementById('finalScore');
            
            // Set canvas dimensions
            canvas.width = 800;
            canvas.height = 300;
            
            // Game variables
            let gameSpeed = 5;
            let score = 0;
            let highScore = 0;
            let gameRunning = false;
            let animationId;
            let clouds = [];
            let obstacles = [];
            let lastObstacleTime = 0;
            
            // Dino properties
            const dino = {
                x: 50,
                y: 220,
                width: 40,
                height: 60,
                isJumping: false,
                jumpVelocity: 0,
                gravity: 0.5,
                frames: 0,
                currentFrame: 0,
                frameCount: 6
            };
            
            // Initialize clouds
            function initClouds() {
                for (let i = 0; i < 5; i++) {
                    clouds.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * 100 + 30,
                        speed: Math.random() * 2 + 1
                    });
                }
            }
            
            // Draw dino
            function drawDino() {
                ctx.fillStyle = '#555';
                
                // Simple dino animation
                dino.frames++;
                if (dino.frames % 10 === 0) {
                    dino.currentFrame = (dino.currentFrame + 1) % dino.frameCount;
                }
                
                // Draw legs animation when running
                if (!dino.isJumping) {
                    ctx.beginPath();
                    ctx.moveTo(dino.x, dino.y + dino.height);
                    if (dino.currentFrame < 3) {
                        ctx.lineTo(dino.x - 5, dino.y + dino.height + 10);
                    } else {
                        ctx.lineTo(dino.x + 5, dino.y + dino.height + 10);
                    }
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.lineWidth = 1;
                }
                
                // Body
                ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
                
                // Head
                ctx.fillRect(dino.x + 30, dino.y - 10, 20, 20);
                
                // Eyes jumping animation
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                let eyeOffsetY = 0;
                if (dino.isJumping) {
                    eyeOffsetY = Math.sin(dino.jumpVelocity * 0.2) * 3;
                }
                ctx.fillRect(dino.x + 35, dino.y - 5 + eyeOffsetY, 5, 5);
                
                // Arms
                ctx.fillStyle = '#555';
                ctx.fillRect(dino.x - 5, dino.y + 15, 15, 5);
                ctx.fillRect(dino.x + 30, dino.y + 15, 15, 5);
            }
            
            // Jump mechanics
            function jump() {
                if (!dino.isJumping) {
                    dino.isJumping = true;
                    dino.jumpVelocity = -12;
                }
            }
            
            // Update dino position
            function updateDino() {
                if (dino.isJumping) {
                    dino.y += dino.jumpVelocity;
                    dino.jumpVelocity += dino.gravity;
                    
                    if (dino.y >= 220) {
                        dino.y = 220;
                        dino.isJumping = false;
                        dino.jumpVelocity = 0;
                    }
                }
            }
            
            // Draw clouds
            function drawClouds() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                
                clouds.forEach(cloud => {
                    ctx.beginPath();
                    ctx.arc(cloud.x + 10, cloud.y, 15, 0, Math.PI * 2);
                    ctx.arc(cloud.x + 25, cloud.y - 5, 20, 0, Math.PI * 2);
                    ctx.arc(cloud.x + 45, cloud.y, 15, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Move cloud
                    cloud.x -= cloud.speed;
                    
                    // Reset cloud when off screen
                    if (cloud.x < -60) {
                        cloud.x = canvas.width + Math.random() * 100;
                        cloud.y = Math.random() * 100 + 30;
                    }
                });
            }
            
            // Create obstacles
            function createObstacle() {
                const now = Date.now();
                if (now - lastObstacleTime > 2000 + Math.random() * 2000 || obstacles.length === 0) {
                    const height = Math.random() > 0.5 ? 30 : 60;
                    obstacles.push({
                        x: canvas.width,
                        y: 250 - height,
                        width: 20,
                        height: height,
                        passed: false
                    });
                    lastObstacleTime = now;
                }
            }
            
            // Draw obstacles
            function drawObstacles() {
                ctx.fillStyle = '#888';
                
                obstacles.forEach(obstacle => {
                    // Draw cactus
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    
                    if (obstacle.height > 30) {
                        ctx.fillRect(obstacle.x - 5, obstacle.y + 20, 10, 40);
                    }
                    
                    // Move obstacle
                    obstacle.x -= gameSpeed;
                    
                    // Check if obstacle has been passed by dino
                    if (!obstacle.passed && obstacle.x + obstacle.width < dino.x) {
                        obstacle.passed = true;
                        score++;
                        scoreDisplay.textContent = score;
                        
                        // Increase speed slightly
                        if (score % 5 === 0) {
                            gameSpeed += 0.2;
                        }
                    }
                });
                
                // Remove off-screen obstacles
                obstacles = obstacles.filter(obstacle => obstacle.x > -obstacle.width);
            }
            
            // Check collision
            function checkCollision() {
                for (let obstacle of obstacles) {
                    if (
                        dino.x < obstacle.x + obstacle.width &&
                        dino.x + dino.width > obstacle.x &&
                        dino.y < obstacle.y + obstacle.height &&
                        dino.y + dino.height > obstacle.y
                    ) {
                        return true;
                    }
                }
                return false;
            }
            
            // Game loop
            function gameLoop() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw ground lines
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 2;
                for (let i = 0; i < canvas.width; i += 40) {
                    ctx.beginPath();
                    ctx.moveTo(i, 280);
                    ctx.lineTo(i + 20, 280);
                    ctx.stroke();
                }
                
                // Draw bg elements
                drawClouds();
                
                // Draw game elements
                drawObstacles();
                drawDino();
                
                // Update positions
                updateDino();
                
                // Create new obstacles
                createObstacle();
                
                // Check for collision
                if (checkCollision()) {
                    gameOver();
                    return;
                }
                
                animationId = requestAnimationFrame(gameLoop);
            }
            
            // Start game
            function startGame() {
                startScreen.style.display = 'none';
                gameOverScreen.style.display = 'none';
                scoreDisplay.style.display = 'block';
                
                // Reset game state
                score = 0;
                gameSpeed = 5;
                dino.y = 220;
                dino.isJumping = false;
                obstacles = [];
                clouds = [];
                
                scoreDisplay.textContent = score;
                initClouds();
                
                gameRunning = true;
                gameLoop();
            }
            
            // Game over
            function gameOver() {
                gameRunning = false;
                cancelAnimationFrame(animationId);
                gameOverScreen.style.display = 'flex';
                finalScoreDisplay.textContent = `Score: ${score}`;
                
                if (score > highScore) {
                    highScore = score;
                }
            }
            
            // Event listeners
            startButton.addEventListener('click', startGame);
            restartButton.addEventListener('click', startGame);
            
            document.addEventListener('keydown', (e) => {
                if ((e.code === 'Space' || e.key === 'ArrowUp') && gameRunning) {
                    e.preventDefault();
                    jump();
                } else if ((e.code === 'Space' || e.key === 'ArrowUp') && !gameRunning && startScreen.style.display === 'none') {
                    startGame();
                }
            });
            
            // Touch support for mobile
            canvas.addEventListener('touchstart', (e) => {
                if (gameRunning) {
                    e.preventDefault();
                    jump();
                } else if (!gameRunning && startScreen.style.display === 'none') {
                    startGame();
                }
            });
            
            // Initialize clouds
            initClouds();
            
            // Initial render
            ctx.fillStyle = '#f9f9f9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawClouds();
            drawDino();
            
            // Draw decorative sun
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(700, 50, 30, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 12; i++) {
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(700 + Math.cos(i * Math.PI / 6) * 32, 50 + Math.sin(i * Math.PI / 6) * 32);
                ctx.lineTo(700 + Math.cos(i * Math.PI / 6) * 42, 50 + Math.sin(i * Math.PI / 6) * 42);
                ctx.stroke();
            }
        });