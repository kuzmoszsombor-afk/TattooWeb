/**
 * ═══════════════════════════════════════════════════
 *  MERAKI INK FLOW — Scroll-driven background
 *  Organic gradient orbs that drift and react to
 *  scroll position, creating a living atmosphere.
 *  Pure Vanilla JS · No dependencies · ~4 KB
 * ═══════════════════════════════════════════════════
 */

(function () {
    'use strict';

    /* ── Reduced-motion bail-out ───────────────────────────── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ── Configuration ────────────────────────────────────── */
    const CFG = {
        orbCount     : 7,
        palette      : [
            { r:  5, g:  90, b:  65 },   // deep emerald
            { r: 16, g: 185, b: 129 },   // #10b981
            { r: 52, g: 211, b: 153 },   // #34d399  (lighter)
            { r:  8, g:  50, b:  42 },   // near-black green
            { r: 10, g: 120, b:  90 },   // mid emerald
        ],
        minRadius    : 120,
        maxRadius    : 380,
        maxOpacity   : 0.12,
        driftSpeed   : 0.15,            // base autonomous drift (px / frame)
        scrollFactor : 0.35,            // how much scroll moves orbs
        breathCycle  : 6000,            // ms for one "breath" scale pulse
        mobileOrbCap : 5,              // fewer orbs on mobile for perf
        mobileRadCap : 260,
    };

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        CFG.orbCount  = CFG.mobileOrbCap;
        CFG.maxRadius = CFG.mobileRadCap;
    }

    /* ── Canvas setup ─────────────────────────────────────── */
    const canvas  = document.createElement('canvas');
    canvas.id     = 'meraki-ink';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 1.8s ease;
    `;
    document.body.prepend(canvas);

    // Fade in gracefully
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    });

    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    /* ── Scroll state ─────────────────────────────────────── */
    let scrollPos = 0;
    let scrollVel = 0;            // velocity (delta per frame)
    let prevScroll = 0;

    window.addEventListener('scroll', () => {
        scrollPos = window.scrollY || window.pageYOffset;
    }, { passive: true });

    /* ── Orb class ─────────────────────────────────────────── */
    class Orb {
        constructor(index) {
            const col = CFG.palette[index % CFG.palette.length];
            this.r = col.r;
            this.g = col.g;
            this.b = col.b;

            this.radius = CFG.minRadius + Math.random() * (CFG.maxRadius - CFG.minRadius);
            this.x = Math.random() * W;
            this.y = Math.random() * H;

            // Autonomous drift direction
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * CFG.driftSpeed * (0.5 + Math.random());
            this.vy = Math.sin(angle) * CFG.driftSpeed * (0.5 + Math.random());

            // Parallax depth  (0 = far / slow,  1 = near / fast)
            this.depth = 0.2 + Math.random() * 0.8;

            // Breathing phase offset
            this.breathOffset = Math.random() * Math.PI * 2;

            // Opacity range
            this.baseOpacity = 0.04 + Math.random() * (CFG.maxOpacity - 0.04);
        }

        update(time) {
            // Autonomous drift
            this.x += this.vx;
            this.y += this.vy;

            // Scroll parallax — deeper orbs react more
            this.y -= scrollVel * CFG.scrollFactor * this.depth;

            // Breathing (subtle scale oscillation baked into draw radius)
            const breathT = (time % CFG.breathCycle) / CFG.breathCycle;
            this.drawRadius = this.radius * (1 + 0.08 * Math.sin(breathT * Math.PI * 2 + this.breathOffset));

            // Scroll-reactive opacity shift: orbs dim slightly at extreme velocities
            const velDamp = Math.min(Math.abs(scrollVel) * 0.003, 0.04);
            this.opacity = Math.max(0.02, this.baseOpacity - velDamp);

            // Wrap around edges with generous padding
            const pad = this.radius;
            if (this.x < -pad) this.x = W + pad;
            if (this.x > W + pad) this.x = -pad;
            if (this.y < -pad) this.y = H + pad;
            if (this.y > H + pad) this.y = -pad;
        }

        draw() {
            const grad = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.drawRadius
            );
            grad.addColorStop(0,   `rgba(${this.r},${this.g},${this.b},${this.opacity})`);
            grad.addColorStop(0.4, `rgba(${this.r},${this.g},${this.b},${this.opacity * 0.5})`);
            grad.addColorStop(1,   `rgba(${this.r},${this.g},${this.b},0)`);

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.drawRadius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    /* ── Create orbs ──────────────────────────────────────── */
    const orbs = [];
    for (let i = 0; i < CFG.orbCount; i++) orbs.push(new Orb(i));

    /* ── Render loop ──────────────────────────────────────── */
    let frame;

    function render(time) {
        // Compute scroll velocity (smoothed)
        scrollVel += (scrollPos - prevScroll - scrollVel) * 0.15;
        prevScroll = scrollPos;

        ctx.clearRect(0, 0, W, H);

        // Use 'lighter' composite for soft additive glow where orbs overlap
        ctx.globalCompositeOperation = 'lighter';

        for (const orb of orbs) {
            orb.update(time);
            orb.draw();
        }

        ctx.globalCompositeOperation = 'source-over';

        frame = requestAnimationFrame(render);
    }

    /* ── Start ────────────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(render));
    } else {
        requestAnimationFrame(render);
    }

    /* ── Visibility API — pause when tab is hidden ────────── */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(frame);
        } else {
            requestAnimationFrame(render);
        }
    });

})();
