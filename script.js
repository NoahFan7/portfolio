// =============================
// Noah's Neo Noir Portfolio
// =============================

// Mobile Navigation
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =============================
// Rain Effect
// =============================
(function() {
    const canvas = document.getElementById('rainCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    const drops = [];
    const maxDrops = 120;
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    function createDrop() {
        return {
            x: Math.random() * width,
            y: Math.random() * -100,
            length: Math.random() * 18 + 8,
            speed: Math.random() * 7 + 3,
            opacity: Math.random() * 0.2 + 0.05
        };
    }
    
    for (let i = 0; i < maxDrops; i++) {
        const drop = createDrop();
        drop.y = Math.random() * height;
        drops.push(drop);
    }
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.15)';
        ctx.lineWidth = 1;
        
        for (const drop of drops) {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.globalAlpha = drop.opacity;
            ctx.stroke();
            
            drop.y += drop.speed;
            
            if (drop.y > height) {
                drop.x = Math.random() * width;
                drop.y = Math.random() * -50;
            }
        }
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    
    draw();
})();

// =============================
// Arcade Manager
// =============================
(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('gameScore');
    const highScoreEl = document.getElementById('highScore');
    const overlay = document.getElementById('gameOverlay');
    const startBtn = document.getElementById('startGameBtn');
    const instructionsEl = document.querySelector('.game-instructions');
    const dropdownToggle = document.getElementById('gameDropdownToggle');
    const dropdownMenu = document.getElementById('gameDropdownMenu');
    const dropdownItems = dropdownMenu ? dropdownMenu.querySelectorAll('.game-dropdown-item') : [];

    let activeGame = null;
    let activeGameId = 'basketball';

    function resize() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function stopGame() {
        if (activeGame && activeGame.stop) activeGame.stop();
    }

    function switchGame(id) {
        stopGame();
        activeGameId = id;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (id === 'basketball') activeGame = basketballGame;
        else if (id === 'dino') activeGame = dinoGame;
        else if (id === 'invaders') activeGame = invadersGame;
        if (activeGame && activeGame.init) activeGame.init();
    }

    startBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        if (activeGame && activeGame.start) activeGame.start();
    });

    // Dropdown events
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownToggle.parentElement.classList.toggle('open');
            dropdownMenu.classList.toggle('open');
        });
        document.addEventListener('click', () => {
            dropdownToggle.parentElement.classList.remove('open');
            dropdownMenu.classList.remove('open');
        });
    }
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.game;
            if (id === activeGameId) return;
            dropdownItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (dropdownToggle) dropdownToggle.innerHTML = item.textContent + ' <span class="dropdown-arrow">▼</span>';
            switchGame(id);
        });
    });

    // =============================
    // Basketball
    // =============================
    const basketballGame = (function() {
        let gameRunning = false;
        let score = 0;
        let lives = 3;
        let hoopX = 250;
        let hoopDir = 1;
        let balls = [];
        let particles = [];
        let mouseX = 0;
        let mouseY = 0;
        let animId = null;
        let highScore = parseInt(localStorage.getItem('noah-hoop-highscore') || '0');

        function init() {
            gameRunning = false;
            score = 0;
            lives = 3;
            balls = [];
            particles = [];
            mouseX = 0;
            mouseY = 0;
            scoreEl.textContent = '0';
            highScoreEl.textContent = highScore;
            if (instructionsEl) instructionsEl.textContent = 'You have 3 lives. Make it count.';
            overlay.querySelector('h2').textContent = '🏀 Ready to Shoot?';
            overlay.querySelector('p').textContent = 'Click anywhere to launch. Aim for the moving hoop!';
            startBtn.textContent = 'Start Game';
            overlay.classList.remove('hidden');
            cancelAnimationFrame(animId);
        }

        function start() {
            score = 0; lives = 3; balls = []; particles = []; mouseX = 0; mouseY = 0;
            scoreEl.textContent = '0';
            gameRunning = true;
            resize();
            loop();
        }

        function stop() {
            gameRunning = false;
            cancelAnimationFrame(animId);
            mouseX = 0; mouseY = 0;
        }

        function createParticles(x, y) {
            const colors = ['#ff2a6d', '#05d9e8', '#d300c5', '#ffd700'];
            for (let i = 0; i < 12; i++) {
                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 1) * 6,
                    size: Math.random() * 3 + 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1
                });
            }
        }

        function loop() {
            if (!gameRunning || activeGameId !== 'basketball') return;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            hoopX += hoopDir * 2.5;
            if (hoopX < 40 || hoopX > canvas.width - 120) hoopDir *= -1;

            ctx.strokeStyle = '#ff2a6d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(hoopX + 40, canvas.height - 55, 38, Math.PI, 0);
            ctx.stroke();

            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            for (let i = 10; i <= 70; i += 12) {
                ctx.moveTo(hoopX + i, canvas.height - 55);
                ctx.lineTo(hoopX + i + (i < 40 ? 4 : -4), canvas.height - 32);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;

            for (let i = balls.length - 1; i >= 0; i--) {
                let b = balls[i];
                b.vy += 0.35;
                b.x += b.vx;
                b.y += b.vy;

                ctx.font = '22px "Times New Roman"';
                ctx.textAlign = 'center';
                ctx.fillText('🏀', b.x, b.y);

                if (!b.scored && b.y >= canvas.height - 65 && b.y <= canvas.height - 42) {
                    if (b.x >= hoopX + 8 && b.x <= hoopX + 72) {
                        score++;
                        scoreEl.textContent = score;
                        b.scored = true;
                        createParticles(b.x, b.y);
                        if (score > highScore) {
                            highScore = score;
                            highScoreEl.textContent = highScore;
                            localStorage.setItem('noah-hoop-highscore', highScore);
                        }
                    }
                }

                if (b.y > canvas.height - 10 && !b.scored) {
                    lives--;
                    balls.splice(i, 1);
                    if (lives <= 0) {
                        gameRunning = false;
                        overlay.querySelector('h2').textContent = 'Game Over';
                        overlay.querySelector('p').textContent = `Final Score: ${score}  |  High Score: ${highScore}`;
                        startBtn.textContent = 'Play Again';
                        overlay.classList.remove('hidden');
                        return;
                    }
                    continue;
                }
                if (b.y > canvas.height + 50) balls.splice(i, 1);
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.025;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            ctx.font = '18px "Times New Roman"';
            ctx.textAlign = 'left';
            for (let i = 0; i < lives; i++) ctx.fillText('🏀', 12 + i * 22, 26);

            if (mouseX > 0 && mouseY > 0) {
                const startX = canvas.width / 2;
                const startY = canvas.height - 20;
                ctx.save();
                ctx.setLineDash([4, 6]);
                ctx.strokeStyle = 'rgba(255, 42, 109, 0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
                ctx.restore();

                ctx.strokeStyle = '#ff2a6d';
                ctx.lineWidth = 1.5;
                const cx = mouseX, cy = mouseY, size = 12, gap = 3;
                ctx.beginPath(); ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy - gap); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + size); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx - size, cy); ctx.lineTo(cx - gap, cy); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + size, cy); ctx.stroke();
                ctx.fillStyle = '#ff2a6d';
                ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI * 2); ctx.fill();
            }

            animId = requestAnimationFrame(loop);
        }

        function shoot(e) {
            if (!gameRunning || activeGameId !== 'basketball') return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const clickX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
            const clickY = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
            const startX = canvas.width / 2;
            const startY = canvas.height - 20;
            const dx = clickX - startX;
            const dy = clickY - startY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const speed = Math.min(dist * 0.032, 16);
            const angle = Math.atan2(dy, dx);
            balls.push({ x: startX, y: startY, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, scored: false });
        }

        function onMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        }
        function onMouseLeave() { mouseX = 0; mouseY = 0; }

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('click', shoot);
        canvas.addEventListener('touchstart', (e) => { if (activeGameId === 'basketball') { e.preventDefault(); shoot(e); } });

        return { init, start, stop };
    })();

    // =============================
    // Dino Run
    // =============================
    const dinoGame = (function() {
        let gameRunning = false;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('noah-dino-highscore') || '0');
        let dinoY = 0;
        let dinoVy = 0;
        let isJumping = false;
        let obstacles = [];
        let particles = [];
        let groundY = 0;
        let speed = 5;
        let spawnTimer = 0;
        let animId = null;
        const gravity = 0.6;
        const jumpPower = -12;

        function init() {
            gameRunning = false;
            score = 0;
            scoreEl.textContent = '0';
            highScoreEl.textContent = highScore;
            if (instructionsEl) instructionsEl.textContent = 'Press SPACE or Click/Tap to jump over cacti.';
            overlay.querySelector('h2').textContent = '🦖 Dino Run';
            overlay.querySelector('p').textContent = 'Jump over the cacti. How far can you run?';
            startBtn.textContent = 'Start Game';
            overlay.classList.remove('hidden');
            cancelAnimationFrame(animId);
        }

        function start() {
            gameRunning = true;
            score = 0;
            obstacles = [];
            particles = [];
            dinoVy = 0;
            isJumping = false;
            speed = 5;
            spawnTimer = 60;
            resize();
            groundY = canvas.height - 40;
            dinoY = groundY - 28;
            loop();
        }

        function stop() {
            gameRunning = false;
            cancelAnimationFrame(animId);
        }

        function jump(e) {
            if (activeGameId !== 'dino') return;
            if (e) e.preventDefault();
            if (!gameRunning) return;
            if (!isJumping) {
                dinoVy = jumpPower;
                isJumping = true;
            }
        }

        function loop() {
            if (!gameRunning || activeGameId !== 'dino') return;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            groundY = canvas.height - 40;

            dinoY += dinoVy;
            if (dinoY < groundY - 28) {
                dinoVy += gravity;
            } else {
                dinoVy = 0;
                dinoY = groundY - 28;
                isJumping = false;
            }

            speed = 5 + Math.floor(score / 500) * 0.5;
            score += 1;
            scoreEl.textContent = Math.floor(score / 10);

            spawnTimer--;
            if (spawnTimer <= 0) {
                spawnTimer = Math.max(40, 80 + Math.random() * 60 - score/100);
                obstacles.push({
                    x: canvas.width,
                    y: groundY - 26,
                    w: 18 + Math.random() * 14,
                    h: 22 + Math.random() * 16,
                    emoji: '🌵'
                });
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                let ob = obstacles[i];
                ob.x -= speed;

                ctx.font = '24px "Times New Roman"';
                ctx.textAlign = 'center';
                ctx.fillText(ob.emoji, ob.x + ob.w/2, ob.y + ob.h/2 + 10);

                const dinoX = 60;
                const dinoW = 24;
                const dinoH = 28;
                if (dinoX + dinoW > ob.x + 4 && dinoX < ob.x + ob.w - 4 &&
                    dinoY + dinoH > ob.y + 4 && dinoY < ob.y + ob.h - 4) {
                    gameOver();
                    return;
                }

                if (ob.x + ob.w < 0) obstacles.splice(i, 1);
            }

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            ctx.font = '28px "Times New Roman"';
            ctx.textAlign = 'center';
            ctx.fillText('🦖', 72, dinoY + 22);

            if (!isJumping && score % 10 === 0) {
                particles.push({
                    x: 60,
                    y: groundY,
                    vx: -speed - Math.random() * 2,
                    vy: -Math.random() * 2,
                    life: 1
                });
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.05;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.globalAlpha = p.life;
                ctx.fillStyle = '#555';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            animId = requestAnimationFrame(loop);
        }

        function gameOver() {
            gameRunning = false;
            const displayScore = Math.floor(score / 10);
            if (displayScore > highScore) {
                highScore = displayScore;
                highScoreEl.textContent = highScore;
                localStorage.setItem('noah-dino-highscore', highScore);
            }
            overlay.querySelector('h2').textContent = 'Game Over';
            overlay.querySelector('p').textContent = `Score: ${displayScore}  |  High Score: ${highScore}`;
            startBtn.textContent = 'Play Again';
            overlay.classList.remove('hidden');
        }

        window.addEventListener('keydown', (e) => {
            if (activeGameId === 'dino' && e.code === 'Space') jump(e);
        });
        canvas.addEventListener('mousedown', jump);
        canvas.addEventListener('touchstart', (e) => { if (activeGameId === 'dino') jump(e); });

        return { init, start, stop };
    })();

    // =============================
    // Space Invaders
    // =============================
    const invadersGame = (function() {
        let gameRunning = false;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('noah-invaders-highscore') || '0');
        let playerX = 0;
        let bullets = [];
        let enemyBullets = [];
        let invaders = [];
        let invaderDir = 1;
        let invaderStep = 0;
        let invaderSpeed = 30;
        let frameCount = 0;
        let lives = 3;
        let animId = null;
        let keys = {};

        function init() {
            gameRunning = false;
            score = 0;
            lives = 3;
            scoreEl.textContent = '0';
            highScoreEl.textContent = highScore;
            if (instructionsEl) instructionsEl.textContent = 'Move with mouse/arrows. Click or SPACE to shoot.';
            overlay.querySelector('h2').textContent = '👾 Space Invaders';
            overlay.querySelector('p').textContent = 'Destroy the alien fleet before they land!';
            startBtn.textContent = 'Start Game';
            overlay.classList.remove('hidden');
            cancelAnimationFrame(animId);
        }

        function start() {
            gameRunning = true;
            score = 0;
            lives = 3;
            bullets = [];
            enemyBullets = [];
            invaderDir = 1;
            invaderStep = 0;
            invaderSpeed = 30;
            frameCount = 0;
            resize();
            playerX = canvas.width / 2;
            createInvaders();
            loop();
        }

        function stop() {
            gameRunning = false;
            cancelAnimationFrame(animId);
        }

        function createInvaders() {
            invaders = [];
            const cols = 8;
            const rows = 4;
            const startX = (canvas.width - cols * 40) / 2;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    invaders.push({
                        x: startX + c * 40,
                        y: 40 + r * 35,
                        alive: true,
                        emoji: r === 0 ? '👾' : (r === 1 ? '👽' : '🛸')
                    });
                }
            }
        }

        function loop() {
            if (!gameRunning || activeGameId !== 'invaders') return;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            frameCount++;

            if (keys['ArrowLeft']) playerX -= 5;
            if (keys['ArrowRight']) playerX += 5;
            if (playerX < 20) playerX = 20;
            if (playerX > canvas.width - 20) playerX = canvas.width - 20;

            ctx.fillStyle = '#05d9e8';
            ctx.beginPath();
            ctx.moveTo(playerX, canvas.height - 35);
            ctx.lineTo(playerX - 12, canvas.height - 15);
            ctx.lineTo(playerX + 12, canvas.height - 15);
            ctx.closePath();
            ctx.fill();

            for (let i = bullets.length - 1; i >= 0; i--) {
                let b = bullets[i];
                b.y -= 8;
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(b.x - 1, b.y, 3, 10);
                if (b.y < 0) { bullets.splice(i, 1); continue; }

                for (let inv of invaders) {
                    if (!inv.alive) continue;
                    if (b.x > inv.x - 14 && b.x < inv.x + 14 && b.y > inv.y - 14 && b.y < inv.y + 14) {
                        inv.alive = false;
                        bullets.splice(i, 1);
                        score += 10;
                        scoreEl.textContent = score;
                        if (score > highScore) {
                            highScore = score;
                            highScoreEl.textContent = highScore;
                            localStorage.setItem('noah-invaders-highscore', highScore);
                        }
                        break;
                    }
                }
            }

            let moveDown = false;
            if (frameCount % Math.max(10, invaderSpeed - Math.floor(score/50)) === 0) {
                let leftmost = canvas.width, rightmost = 0;
                let aliveCount = 0;
                for (let inv of invaders) {
                    if (!inv.alive) continue;
                    aliveCount++;
                    if (inv.x < leftmost) leftmost = inv.x;
                    if (inv.x > rightmost) rightmost = inv.x;
                }
                if (aliveCount === 0) {
                    createInvaders();
                    invaderSpeed = Math.max(10, invaderSpeed - 2);
                } else {
                    if (rightmost >= canvas.width - 20 && invaderDir === 1) moveDown = true;
                    else if (leftmost <= 20 && invaderDir === -1) moveDown = true;

                    if (moveDown) {
                        invaderDir *= -1;
                        for (let inv of invaders) inv.y += 20;
                    } else {
                        for (let inv of invaders) inv.x += 10 * invaderDir;
                    }
                }
            }

            ctx.font = '20px "Times New Roman"';
            ctx.textAlign = 'center';
            for (let inv of invaders) {
                if (!inv.alive) continue;
                ctx.fillText(inv.emoji, inv.x, inv.y + 6);
                if (inv.y > canvas.height - 60) {
                    gameOver();
                    return;
                }
            }

            if (frameCount % 60 === 0) {
                const shooters = invaders.filter(i => i.alive);
                if (shooters.length > 0) {
                    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
                    enemyBullets.push({ x: shooter.x, y: shooter.y + 10 });
                }
            }
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                let b = enemyBullets[i];
                b.y += 4;
                ctx.fillStyle = '#ff2a6d';
                ctx.fillRect(b.x - 1, b.y, 3, 8);
                if (b.y > canvas.height) { enemyBullets.splice(i, 1); continue; }
                if (b.x > playerX - 12 && b.x < playerX + 12 && b.y > canvas.height - 40 && b.y < canvas.height - 15) {
                    enemyBullets.splice(i, 1);
                    lives--;
                    if (lives <= 0) {
                        gameOver();
                        return;
                    }
                }
            }

            ctx.font = '16px "Times New Roman"';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ff2a6d';
            for (let i = 0; i < lives; i++) {
                ctx.fillText('❤', 12 + i * 20, 24);
            }

            animId = requestAnimationFrame(loop);
        }

        function gameOver() {
            gameRunning = false;
            if (score > highScore) {
                highScore = score;
                highScoreEl.textContent = highScore;
                localStorage.setItem('noah-invaders-highscore', highScore);
            }
            overlay.querySelector('h2').textContent = 'Game Over';
            overlay.querySelector('p').textContent = `Score: ${score}  |  High Score: ${highScore}`;
            startBtn.textContent = 'Play Again';
            overlay.classList.remove('hidden');
        }

        window.addEventListener('keydown', (e) => {
            if (activeGameId !== 'invaders') return;
            keys[e.key] = true;
            if (e.code === 'Space') { e.preventDefault(); shoot(); }
        });
        window.addEventListener('keyup', (e) => {
            if (activeGameId !== 'invaders') return;
            keys[e.key] = false;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (activeGameId !== 'invaders') return;
            const rect = canvas.getBoundingClientRect();
            playerX = e.clientX - rect.left;
        });
        canvas.addEventListener('mousedown', () => {
            if (activeGameId !== 'invaders') return;
            shoot();
        });
        canvas.addEventListener('touchstart', (e) => {
            if (activeGameId !== 'invaders') return;
            const rect = canvas.getBoundingClientRect();
            playerX = e.touches[0].clientX - rect.left;
            shoot();
        });
        canvas.addEventListener('touchmove', (e) => {
            if (activeGameId !== 'invaders') return;
            const rect = canvas.getBoundingClientRect();
            playerX = e.touches[0].clientX - rect.left;
        });

        function shoot() {
            if (!gameRunning) return;
            bullets.push({ x: playerX, y: canvas.height - 45 });
        }

        return { init, start, stop };
    })();

    switchGame('basketball');
})();

// =============================
// Chess Engine
// =============================
(function() {
    const boardEl = document.getElementById('chessBoard');
    const statusEl = document.getElementById('chessStatus');
    const resetBtn = document.getElementById('resetChessBtn');
    const capturedEl = document.getElementById('capturedPieces');
    if (!boardEl) return;

    // Unicode pieces
    const PIECES = {
        w: { k: '\u2654', q: '\u2655', r: '\u2656', b: '\u2657', n: '\u2658', p: '\u2659' },
        b: { k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F' }
    };

    // Piece values
    const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

    // Position tables (simplified, from white's perspective)
    const PST = {
        p: [
            [ 0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [ 5,  5, 10, 25, 25, 10,  5,  5],
            [ 0,  0,  0, 20, 20,  0,  0,  0],
            [ 5, -5,-10,  0,  0,-10, -5,  5],
            [ 5, 10, 10,-20,-20, 10, 10,  5],
            [ 0,  0,  0,  0,  0,  0,  0,  0]
        ],
        n: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ],
        b: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ],
        r: [
            [  0,  0,  0,  0,  0,  0,  0,  0],
            [  5, 10, 10, 10, 10, 10, 10,  5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [  0,  0,  0,  5,  5,  0,  0,  0]
        ],
        q: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [ -5,  0,  5,  5,  5,  5,  0, -5],
            [  0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ],
        k: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [ 20, 20,  0,  0,  0,  0, 20, 20],
            [ 20, 30, 10,  0,  0, 10, 30, 20]
        ]
    };

    let board = [];
    let turn = 'w';
    let selected = null;
    let validMoves = [];
    let lastMove = null;
    let whiteCaptures = [];
    let blackCaptures = [];
    let castling = { w: { k: true, q: true }, b: { k: true, q: true } };
    let enPassant = null;
    let gameOver = false;

    function initBoard() {
        const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        board = [];
        for (let r = 0; r < 8; r++) {
            const row = [];
            for (let c = 0; c < 8; c++) {
                if (r === 0) row.push({ type: backRank[c], color: 'b' });
                else if (r === 1) row.push({ type: 'p', color: 'b' });
                else if (r === 6) row.push({ type: 'p', color: 'w' });
                else if (r === 7) row.push({ type: backRank[c], color: 'w' });
                else row.push(null);
            }
            board.push(row);
        }
        turn = 'w';
        selected = null;
        validMoves = [];
        lastMove = null;
        whiteCaptures = [];
        blackCaptures = [];
        castling = { w: { k: true, q: true }, b: { k: true, q: true } };
        enPassant = null;
        gameOver = false;
        render();
        updateStatus('Click a piece, then click destination.');
    }

    function copyBoard(b) {
        return b.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    function inBounds(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    function getMoves(b, r, c, ep, castle) {
        const piece = b[r][c];
        if (!piece) return [];
        const moves = [];
        const color = piece.color;
        const opp = color === 'w' ? 'b' : 'w';

        function addMove(toR, toC, isCapture = false) {
            moves.push({ from: [r, c], to: [toR, toC], capture: isCapture });
        }

        if (piece.type === 'p') {
            const dir = color === 'w' ? -1 : 1;
            const startRow = color === 'w' ? 6 : 1;
            // Forward
            if (inBounds(r + dir, c) && !b[r + dir][c]) {
                addMove(r + dir, c);
                if (r === startRow && !b[r + dir * 2][c]) {
                    addMove(r + dir * 2, c);
                }
            }
            // Capture
            for (const dc of [-1, 1]) {
                const nr = r + dir, nc = c + dc;
                if (inBounds(nr, nc)) {
                    if (b[nr][nc] && b[nr][nc].color === opp) {
                        addMove(nr, nc, true);
                    } else if (ep && ep[0] === nr && ep[1] === nc) {
                        addMove(nr, nc, true);
                    }
                }
            }
        }
        else if (piece.type === 'n') {
            const deltas = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
            for (const [dr, dc] of deltas) {
                const nr = r + dr, nc = c + dc;
                if (inBounds(nr, nc) && (!b[nr][nc] || b[nr][nc].color === opp)) {
                    addMove(nr, nc, !!b[nr][nc]);
                }
            }
        }
        else if (piece.type === 'k') {
            const deltas = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
            for (const [dr, dc] of deltas) {
                const nr = r + dr, nc = c + dc;
                if (inBounds(nr, nc) && (!b[nr][nc] || b[nr][nc].color === opp)) {
                    addMove(nr, nc, !!b[nr][nc]);
                }
            }
            // Castling
            if (castle && castle[color]) {
                if (castle[color].k && !b[r][5] && !b[r][6] && !isInCheck(b, color)) {
                    if (!isSquareAttacked(b, color, r, 5) && !isSquareAttacked(b, color, r, 6)) {
                        addMove(r, 6);
                    }
                }
                if (castle[color].q && !b[r][1] && !b[r][2] && !b[r][3] && !isInCheck(b, color)) {
                    if (!isSquareAttacked(b, color, r, 2) && !isSquareAttacked(b, color, r, 3)) {
                        addMove(r, 2);
                    }
                }
            }
        }
        else {
            let dirs = [];
            if (piece.type === 'b') dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
            else if (piece.type === 'r') dirs = [[-1,0],[1,0],[0,-1],[0,1]];
            else if (piece.type === 'q') dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
            for (const [dr, dc] of dirs) {
                let nr = r + dr, nc = c + dc;
                while (inBounds(nr, nc)) {
                    if (!b[nr][nc]) {
                        addMove(nr, nc);
                    } else {
                        if (b[nr][nc].color === opp) addMove(nr, nc, true);
                        break;
                    }
                    nr += dr; nc += dc;
                }
            }
        }
        return moves;
    }

    function isSquareAttacked(b, color, r, c) {
        const opp = color === 'w' ? 'b' : 'w';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const p = b[i][j];
                if (p && p.color === opp) {
                    // For sliding pieces, we need a simplified check to avoid infinite recursion
                    if (p.type === 'p') {
                        const dir = opp === 'w' ? -1 : 1;
                        if (i + dir === r && Math.abs(j - c) === 1) return true;
                    } else if (p.type === 'n') {
                        if (Math.abs(i - r) === 2 && Math.abs(j - c) === 1) return true;
                        if (Math.abs(i - r) === 1 && Math.abs(j - c) === 2) return true;
                    } else if (p.type === 'k') {
                        if (Math.abs(i - r) <= 1 && Math.abs(j - c) <= 1) return true;
                    } else {
                        const dr = Math.sign(r - i);
                        const dc = Math.sign(c - j);
                        if (dr === 0 && dc === 0) continue;
                        if (p.type === 'b' && (dr === 0 || dc === 0)) continue;
                        if (p.type === 'r' && dr !== 0 && dc !== 0) continue;
                        let cr = i + dr, cc = j + dc;
                        while (inBounds(cr, cc)) {
                            if (cr === r && cc === c) return true;
                            if (b[cr][cc]) break;
                            cr += dr; cc += dc;
                        }
                    }
                }
            }
        }
        return false;
    }

    function findKing(b, color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (b[r][c] && b[r][c].type === 'k' && b[r][c].color === color) {
                    return [r, c];
                }
            }
        }
        return null;
    }

    function isInCheck(b, color) {
        const king = findKing(b, color);
        if (!king) return false;
        return isSquareAttacked(b, color, king[0], king[1]);
    }

    function applyMove(b, move, ep, castle) {
        const nb = copyBoard(b);
        const [fr, fc] = move.from;
        const [tr, tc] = move.to;
        const piece = nb[fr][fc];
        const newEp = null;
        const newCastle = { w: { ...castle.w }, b: { ...castle.b } };

        // Handle capture
        let captured = nb[tr][tc];

        // En passant
        if (piece.type === 'p' && ep && tr === ep[0] && tc === ep[1]) {
            const capRow = piece.color === 'w' ? tr + 1 : tr - 1;
            captured = nb[capRow][tc];
            nb[capRow][tc] = null;
        }

        // Move piece
        nb[tr][tc] = piece;
        nb[fr][fc] = null;

        // Pawn double advance -> en passant
        if (piece.type === 'p' && Math.abs(tr - fr) === 2) {
            // This is handled by returning ep from the caller perspective
        }

        // Castling: move rook
        if (piece.type === 'k' && Math.abs(tc - fc) === 2) {
            if (tc === 6) {
                nb[fr][5] = nb[fr][7];
                nb[fr][7] = null;
            } else if (tc === 2) {
                nb[fr][3] = nb[fr][0];
                nb[fr][0] = null;
            }
        }

        // Update castling rights
        if (piece.type === 'k') {
            newCastle[piece.color].k = false;
            newCastle[piece.color].q = false;
        }
        if (piece.type === 'r') {
            if (fc === 7) newCastle[piece.color].k = false;
            if (fc === 0) newCastle[piece.color].q = false;
        }
        if (captured && captured.type === 'r') {
            const opp = captured.color;
            if (tc === 7) newCastle[opp].k = false;
            if (tc === 0) newCastle[opp].q = false;
        }

        // Promotion
        if (piece.type === 'p' && (tr === 0 || tr === 7)) {
            nb[tr][tc] = { type: 'q', color: piece.color };
        }

        return { board: nb, captured, castle: newCastle };
    }

    function getLegalMoves(b, r, c, ep, castle) {
        const piece = b[r][c];
        if (!piece) return [];
        const pseudo = getMoves(b, r, c, ep, castle);
        const legal = [];
        for (const move of pseudo) {
            const result = applyMove(b, move, ep, castle);
            if (!isInCheck(result.board, piece.color)) {
                legal.push(move);
            }
        }
        return legal;
    }

    function getAllLegalMoves(b, color, ep, castle) {
        const all = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (b[r][c] && b[r][c].color === color) {
                    all.push(...getLegalMoves(b, r, c, ep, castle));
                }
            }
        }
        return all;
    }

    function evaluate(b) {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (!p) continue;
                let val = VALUE[p.type];
                // Position table: mirror for black
                let pr = p.color === 'w' ? r : 7 - r;
                val += (PST[p.type][pr][c] || 0);
                score += p.color === 'w' ? val : -val;
            }
        }
        return score;
    }

    function minimax(b, depth, alpha, beta, maximizing, color, ep, castle) {
        const moves = getAllLegalMoves(b, color, ep, castle);
        if (moves.length === 0) {
            if (isInCheck(b, color)) {
                return maximizing ? -99999 + (10 - depth) : 99999 - (10 - depth);
            }
            return 0; // Stalemate
        }
        if (depth === 0) {
            return evaluate(b);
        }

        if (maximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const result = applyMove(b, move, ep, castle);
                const nextEp = (result.board[move.to[0]][move.to[1]].type === 'p' && Math.abs(move.to[0] - move.from[0]) === 2)
                    ? [(move.from[0] + move.to[0]) / 2, move.from[1]]
                    : null;
                const evalScore = minimax(result.board, depth - 1, alpha, beta, false, color === 'w' ? 'b' : 'w', nextEp, result.board === b ? castle : result.castle || castle);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const result = applyMove(b, move, ep, castle);
                const nextEp = (result.board[move.to[0]][move.to[1]].type === 'p' && Math.abs(move.to[0] - move.from[0]) === 2)
                    ? [(move.from[0] + move.to[0]) / 2, move.from[1]]
                    : null;
                const evalScore = minimax(result.board, depth - 1, alpha, beta, true, color === 'w' ? 'b' : 'w', nextEp, result.board === b ? castle : result.castle || castle);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function aiMove() {
        if (gameOver) return;
        const moves = getAllLegalMoves(board, turn, enPassant, castling);
        if (moves.length === 0) return;

        let bestMove = null;
        let bestScore = turn === 'w' ? -Infinity : Infinity;

        // Shuffle for variety
        for (let i = moves.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [moves[i], moves[j]] = [moves[j], moves[i]];
        }

        for (const move of moves) {
            const result = applyMove(board, move, enPassant, castling);
            const nextEp = (result.board[move.to[0]][move.to[1]].type === 'p' && Math.abs(move.to[0] - move.from[0]) === 2)
                ? [(move.from[0] + move.to[0]) / 2, move.from[1]]
                : null;
            const score = minimax(result.board, 2, -Infinity, Infinity, turn === 'b', 'w', nextEp, result.castle);
            if ((turn === 'w' && score > bestScore) || (turn === 'b' && score < bestScore)) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (bestMove) {
            setTimeout(() => executeMove(bestMove), 300);
        }
    }

    function executeMove(move) {
        if (gameOver) return;
        const piece = board[move.from[0]][move.from[1]];
        if (!piece) return;

        const result = applyMove(board, move, enPassant, castling);
        const captured = result.captured;
        board = result.board;
        castling = result.castle || castling;

        // Update en passant
        if (piece.type === 'p' && Math.abs(move.to[0] - move.from[0]) === 2) {
            enPassant = [(move.from[0] + move.to[0]) / 2, move.from[1]];
        } else {
            enPassant = null;
        }

        // Track captures
        if (captured) {
            if (captured.color === 'w') blackCaptures.push(captured);
            else whiteCaptures.push(captured);
        }

        lastMove = move;
        selected = null;
        validMoves = [];
        turn = turn === 'w' ? 'b' : 'w';
        render();

        const nextMoves = getAllLegalMoves(board, turn, enPassant, castling);
        if (nextMoves.length === 0) {
            gameOver = true;
            if (isInCheck(board, turn)) {
                updateStatus(turn === 'w' ? 'Checkmate. Black wins.' : 'Checkmate. White wins.');
            } else {
                updateStatus('Stalemate. Draw.');
            }
            return;
        }

        if (isInCheck(board, turn)) {
            updateStatus((turn === 'w' ? 'White' : 'Black') + ' is in check!');
        } else {
            updateStatus((turn === 'w' ? 'White' : 'Black') + '\'s turn.');
        }

        // Trigger AI if black's turn
        if (turn === 'b' && !gameOver) {
            updateStatus('AI is thinking...');
            aiMove();
        }
    }

    function handleSquareClick(r, c) {
        if (gameOver) return;
        if (turn !== 'w') return; // Player is white

        const piece = board[r][c];

        // If a piece is selected and this square is a valid move, execute it
        if (selected) {
            const move = validMoves.find(m => m.to[0] === r && m.to[1] === c);
            if (move) {
                executeMove(move);
                return;
            }
        }

        // If clicked on own piece, select it
        if (piece && piece.color === turn) {
            selected = [r, c];
            validMoves = getLegalMoves(board, r, c, enPassant, castling);
            render();
            updateStatus('Selected ' + piece.type.toUpperCase() + '. Choose destination.');
            return;
        }

        // Otherwise deselect
        selected = null;
        validMoves = [];
        render();
        updateStatus('Click a piece, then click destination.');
    }

    function updateStatus(msg) {
        if (statusEl) statusEl.textContent = msg;
    }

    function render() {
        boardEl.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const sq = document.createElement('div');
                const isDark = (r + c) % 2 === 1;
                sq.className = 'chess-square ' + (isDark ? 'dark' : 'light');

                if (selected && selected[0] === r && selected[1] === c) {
                    sq.classList.add('selected');
                }
                if (lastMove) {
                    if ((lastMove.from[0] === r && lastMove.from[1] === c) ||
                        (lastMove.to[0] === r && lastMove.to[1] === c)) {
                        sq.classList.add('last-move');
                    }
                }
                const move = validMoves.find(m => m.to[0] === r && m.to[1] === c);
                if (move) {
                    if (move.capture || (board[r][c] && board[r][c].color !== turn)) {
                        sq.classList.add('valid-capture');
                    } else {
                        sq.classList.add('valid-move');
                    }
                }

                const piece = board[r][c];
                if (piece) {
                    const span = document.createElement('span');
                    span.className = 'chess-piece ' + (piece.color === 'w' ? 'white' : 'black');
                    span.textContent = PIECES[piece.color][piece.type];
                    sq.appendChild(span);
                }

                sq.addEventListener('click', () => handleSquareClick(r, c));
                boardEl.appendChild(sq);
            }
        }

        // Captured pieces display
        if (capturedEl) {
            capturedEl.innerHTML = '';
            const all = [...whiteCaptures, ...blackCaptures];
            for (const p of all) {
                const span = document.createElement('span');
                span.textContent = PIECES[p.color][p.type];
                capturedEl.appendChild(span);
            }
        }
    }

    resetBtn.addEventListener('click', initBoard);

    initBoard();
})();

// =============================
// Scroll Animations
// =============================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
const animatedElements = document.querySelectorAll('.timeline-item, .skill-card, .stat');
animatedElements.forEach(el => {
    // Add base animation styles inline for simple fade-in
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Custom class toggle when visible
const style = document.createElement('style');
style.textContent = `
    .timeline-item.visible,
    .skill-card.visible,
    .stat.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

console.log('%c NOIR PORTFOLIO ', 'background: #000000; color: #ff2a6d; font-size: 20px; border: 2px solid #ff2a6d; padding: 8px; font-family: Times New Roman;');
console.log('%c The city never sleeps. ', 'color: #05d9e8; font-size: 12px; font-family: Times New Roman;');
