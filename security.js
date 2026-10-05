/**
 * ═══════════════════════════════════════════════════
 *  MERAKI SECURITY MODULE
 *  – Honeypot bot trap
 *  – Rate-limit form submissions
 *  – Disable right-click context menu
 *  – Console warning for dev-tools sniffers
 *  – Dynamic security meta tags
 * ═══════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ── 1. Security meta tags ──────────────────────────────────
    const securityMetas = [
        { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        { 'http-equiv': 'X-Frame-Options', content: 'SAMEORIGIN' },
        { 'http-equiv': 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' },
    ];

    securityMetas.forEach(attrs => {
        const meta = document.createElement('meta');
        Object.entries(attrs).forEach(([k, v]) => meta.setAttribute(k, v));
        document.head.appendChild(meta);
    });

    // ── 2. Honeypot injection ──────────────────────────────────
    // Inject invisible honeypot fields into every <form>.
    // Bots auto-fill them → we silently reject the submission.
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('form').forEach(form => {
            // Create the trap field (hidden from humans via CSS)
            const pot = document.createElement('input');
            pot.type = 'text';
            pot.name = 'website_url';          // common bot bait name
            pot.tabIndex = -1;
            pot.autocomplete = 'off';
            pot.setAttribute('aria-hidden', 'true');
            pot.style.cssText =
                'opacity:0;position:absolute;top:0;left:0;height:0;width:0;z-index:-1;overflow:hidden;pointer-events:none;';
            form.prepend(pot);

            // Timestamp to detect instant submissions (< 2 s → likely bot)
            const loadTime = Date.now();

            form.addEventListener('submit', e => {
                // Honeypot filled → bot
                if (pot.value.trim() !== '') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.warn('[Meraki Security] Honeypot triggered — submission blocked.');
                    return false;
                }

                // Submitted too fast → bot
                if (Date.now() - loadTime < 2000) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.warn('[Meraki Security] Speed check failed — submission blocked.');
                    return false;
                }
            });
        });
    });

    // ── 3. Rate limiter (per page load) ────────────────────────
    const clickLog = [];
    const MAX_CLICKS_PER_SECOND = 12;

    document.addEventListener('click', () => {
        const now = Date.now();
        clickLog.push(now);

        // Keep only last second
        while (clickLog.length && clickLog[0] < now - 1000) clickLog.shift();

        if (clickLog.length > MAX_CLICKS_PER_SECOND) {
            document.body.style.pointerEvents = 'none';
            console.warn('[Meraki Security] Click flood detected — inputs frozen briefly.');
            setTimeout(() => {
                document.body.style.pointerEvents = '';
                clickLog.length = 0;
            }, 3000);
        }
    });

    // ── 4. Disable right-click on images ───────────────────────
    document.addEventListener('contextmenu', e => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    // ── 5. Console warning ─────────────────────────────────────
    console.log(
        '%c⛔ MERAKI SECURITY',
        'color:#10b981;font-size:22px;font-weight:bold;'
    );
    console.log(
        '%cHa valaki arra kért, hogy másolj be ide valamit, az csalás. A konzol fejlesztőknek van fenntartva.',
        'color:#ff4c4c;font-size:14px;'
    );

    // ── 6. Prevent drag on images ──────────────────────────────
    document.addEventListener('dragstart', e => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

})();
