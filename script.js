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
// Basketball Mini Game
// =============================
(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('gameScore');
    const highScoreEl = document.getElementById('highScore');
    const overlay = document.getElementById('gameOverlay');
    const startBtn = document.getElementById('startGameBtn');
    
    let gameRunning = false;
    let score = 0;
    let lives = 3;
    let highScore = parseInt(localStorage.getItem('noah-hoop-highscore') || '0');
    highScoreEl.textContent = highScore;
    
    // Game state
    let hoopX = 250;
    let hoopDir = 1;
    let balls = [];
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let animId;
    
    function resize() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    function startGame() {
        score = 0;
        lives = 3;
        balls = [];
        particles = [];
        scoreEl.textContent = score;
        gameRunning = true;
        resize();
        gameLoop();
    }
    
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animId);
        
        overlay.querySelector('h2').textContent = 'Game Over';
        overlay.querySelector('p').textContent = `Final Score: ${score}  |  High Score: ${highScore}`;
        startBtn.textContent = 'Play Again';
        overlay.classList.remove('hidden');
    }
    
    function createParticles(x, y) {
        const colors = ['#ff2a6d', '#05d9e8', '#d300c5', '#ffd700'];
        for (let i = 0; i < 12; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 1) * 6,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1
            });
        }
    }
    
    function gameLoop() {
        if (!gameRunning) return;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Move hoop
        hoopX += hoopDir * 2.5;
        if (hoopX < 40 || hoopX > canvas.width - 120) hoopDir *= -1;
        
        // Draw hoop
        ctx.strokeStyle = '#ff2a6d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hoopX + 40, canvas.height - 55, 38, Math.PI, 0);
        ctx.stroke();
        
        // Draw net
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
        
        // Update balls
        for (let i = balls.length - 1; i >= 0; i--) {
            let b = balls[i];
            b.vy += 0.35;
            b.x += b.vx;
            b.y += b.vy;
            
            ctx.font = '22px "Times New Roman"';
            ctx.textAlign = 'center';
            ctx.fillText('🏀', b.x, b.y);
            
            // Scored
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
            
            // Missed
            if (b.y > canvas.height - 10 && !b.scored) {
                lives--;
                balls.splice(i, 1);
                if (lives <= 0) {
                    gameOver();
                    return;
                }
                continue;
            }
            
            if (b.y > canvas.height + 50) balls.splice(i, 1);
        }
        
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12;
            p.life -= 0.025;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Lives
        ctx.font = '18px "Times New Roman"';
        ctx.textAlign = 'left';
        for (let i = 0; i < lives; i++) {
            ctx.fillText('🏀', 12 + i * 22, 26);
        }
        
        // Crosshair (only when playing)
        if (mouseX > 0 && mouseY > 0) {
            const startX = canvas.width / 2;
            const startY = canvas.height - 20;
            
            // Dotted trajectory
            ctx.save();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = 'rgba(255, 42, 109, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.restore();
            
            // Crosshair
            ctx.strokeStyle = '#ff2a6d';
            ctx.lineWidth = 1.5;
            const cx = mouseX;
            const cy = mouseY;
            const size = 12;
            const gap = 3;
            
            // Top
            ctx.beginPath(); ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy - gap); ctx.stroke();
            // Bottom
            ctx.beginPath(); ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + size); ctx.stroke();
            // Left
            ctx.beginPath(); ctx.moveTo(cx - size, cy); ctx.lineTo(cx - gap, cy); ctx.stroke();
            // Right
            ctx.beginPath(); ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + size, cy); ctx.stroke();
            
            // Center dot
            ctx.fillStyle = '#ff2a6d';
            ctx.beginPath();
            ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        animId = requestAnimationFrame(gameLoop);
    }
    
    // Track mouse position
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
    });
    
    // Shoot
    function shoot(e) {
        e.preventDefault();
        if (!gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const clickY = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        
        const startX = canvas.width / 2;
        const startY = canvas.height - 20;
        const dx = clickX - startX;
        const dy = clickY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = Math.min(dist * 0.032, 16);
        const angle = Math.atan2(dy, dx);
        
        balls.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            scored: false
        });
    }
    
    canvas.addEventListener('click', shoot);
    canvas.addEventListener('touchstart', (e) => {
        if (!gameRunning) return;
        e.preventDefault();
        shoot(e);
    });
    
    // Start button
    startBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        startGame();
    });
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
