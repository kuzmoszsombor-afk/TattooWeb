/**
 * ═══════════════════════════════════════════════════
 *  MERAKI PARTICLES — Floating background animation
 *  Renders a subtle canvas of drifting particles
 *  that react to scroll position, creating depth.
 * ═══════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── Configuration ──────────────────────────────────────────
    const CONFIG = {
        particleCount: 60,
        minRadius: 1,
        maxRadius: 3,
        minSpeed: 0.15,
        maxSpeed: 0.5,
        color: { r: 16, g: 185, b: 129 },   // #10b981
        maxOpacity: 0.35,
        lineDistance: 140,
        lineOpacity: 0.06,
        scrollInfluence: 0.08,
        mouseInfluence: 0.00015,
    };

    // ── Canvas setup ───────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.id = 'meraki-particles';
    canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 1.5s ease;
    `;
    document.body.prepend(canvas);

    // Fade in after a short delay
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            canvas.style.opacity = '1';
        });
    });

    const ctx = canvas.getContext('2d');

    let W, H;
    const resize = () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // ── Mouse tracking ─────────────────────────────────────────
    let mouse = { x: W / 2, y: H / 2 };
    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // ── Scroll tracking ────────────────────────────────────────
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY || window.pageYOffset;
    }, { passive: true });

    // ── Particle class ─────────────────────────────────────────
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.radius = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
            this.speedX = (Math.random() - 0.5) * CONFIG.maxSpeed;
            this.speedY = (Math.random() - 0.5) * CONFIG.maxSpeed;
            this.baseOpacity = 0.1 + Math.random() * (CONFIG.maxOpacity - 0.1);
            this.opacity = this.baseOpacity;
            this.pulseSpeed = 0.005 + Math.random() * 0.01;
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.depth = 0.3 + Math.random() * 0.7;  // parallax depth layer
        }

        update(time) {
            // Basic movement
            this.x += this.speedX;
            this.y += this.speedY;

            // Scroll parallax — deeper particles move faster
            this.y -= scrollY * CONFIG.scrollInfluence * this.depth * 0.01;

            // Mouse influence — subtle repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const force = (200 - dist) * CONFIG.mouseInfluence;
                this.x += dx * force;
                this.y += dy * force;
            }

            // Pulse opacity
            this.opacity = this.baseOpacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.1;

            // Wrap around edges
            if (this.x < -10) this.x = W + 10;
            if (this.x > W + 10) this.x = -10;
            if (this.y < -10) this.y = H + 10;
            if (this.y > H + 10) this.y = -10;
        }

        draw() {
            const { r, g, b } = CONFIG.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${this.opacity})`;
            ctx.fill();

            // Glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${this.opacity * 0.12})`;
            ctx.fill();
        }
    }

    // ── Create particles ───────────────────────────────────────
    const particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle());
    }

    // ── Draw connecting lines ──────────────────────────────────
    function drawLines() {
        const { r, g, b } = CONFIG.color;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.lineDistance) {
                    const alpha = (1 - dist / CONFIG.lineDistance) * CONFIG.lineOpacity;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // ── Animation loop ─────────────────────────────────────────
    let animFrame;
    function animate(time) {
        ctx.clearRect(0, 0, W, H);

        particles.forEach(p => {
            p.update(time);
            p.draw();
        });

        drawLines();

        animFrame = requestAnimationFrame(animate);
    }

    // Start when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(animate));
    } else {
        requestAnimationFrame(animate);
    }

    // ── Visibility API — pause when tab hidden ─────────────────
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animFrame);
        } else {
            requestAnimationFrame(animate);
        }
    });

    // ── Reduced motion preference ──────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
    }

})();
