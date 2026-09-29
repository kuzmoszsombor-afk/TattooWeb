document.addEventListener('DOMContentLoaded', () => {
    const elementsToReveal = document.querySelectorAll('.about-text, .about-image, .gallery-item, .form-container, .contact-container, .consultation-card, .shop-info');
    
    elementsToReveal.forEach(el => {
        el.classList.add('reveal');
    });

    const revealElements = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 60;
        const sel = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

        document.querySelectorAll(sel).forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealElements);
    setTimeout(revealElements, 100);

    // Stat counter animation
    const statNums = document.querySelectorAll('.stat-num[data-count]');
    if (statNums.length > 0) {
        const countUp = (el) => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            const duration = 1800;
            const step = 16;
            const increment = target / (duration / step);
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = Math.floor(current);
            }, step);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.textContent === '0') {
                    countUp(entry.target);
                }
            });
        }, { threshold: 0.3 });

        statNums.forEach(el => observer.observe(el));
    }

    // ── Universal logo typewriter (runs on every page) ──────────
    const logoTyped  = document.querySelector('.logo-typed');
    const logoCursor = document.querySelector('.logo-cursor');

    if (logoTyped) {
        const WORD   = 'MERAKI';
        let i = 0;

        const type = () => {
            if (i < WORD.length) {
                logoTyped.textContent += WORD[i++];
                setTimeout(type, 110);
            } else {
                // Append the green dot then fade the cursor out
                logoTyped.insertAdjacentHTML('beforeend', '<span class="logo-dot">.</span>');
                if (logoCursor) {
                    setTimeout(() => {
                        logoCursor.style.transition = 'opacity 0.5s ease';
                        logoCursor.style.opacity   = '0';
                        setTimeout(() => logoCursor.remove(), 550);
                    }, 350);
                }
            }
        };

        // Short delay so the page fade-in has started
        setTimeout(type, 280);
    }

    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
        });
    }

    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = this.getAttribute('href');
            
            if (!target || target.startsWith('#') || target.startsWith('http') || target.startsWith('mailto') || target.startsWith('tel') || target === window.location.pathname.split('/').pop()) {
                return;
            }

            e.preventDefault();
            
            const currentActive = document.querySelector('.nav-links a.active');
            if (currentActive) {
                localStorage.setItem('prevNavTarget', currentActive.getAttribute('href'));
            }

            document.body.style.animation = 'none';
            void document.body.offsetWidth; 
            document.body.style.animation = 'fadeOut 0.4s ease-in forwards';

            setTimeout(() => {
                window.location.href = target;
            }, 350);
        });
    });

    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.createElement('a');
    scrollTopBtn.innerHTML = '&#8593;';
    scrollTopBtn.href = '#';
    scrollTopBtn.className = 'scroll-top-btn';
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');
    let slider = document.querySelector('.nav-slider');

    if (!slider && navLinksContainer) {
        slider = document.createElement('div');
        slider.classList.add('nav-slider');
        navLinksContainer.appendChild(slider);
    }

    function setSliderPosition(element) {
        if (!element || !slider) return;
        slider.style.width = `${element.offsetWidth}px`;
        slider.style.left = `${element.offsetLeft}px`;
    }

    const currentActive = document.querySelector('.nav-links a.active');

    if (currentActive && slider) {
        const prevTarget = localStorage.getItem('prevNavTarget');
        let prevLink = null;
        
        if (prevTarget) {
            prevLink = Array.from(navLinks).find(link => link.getAttribute('href') === prevTarget);
        }

        if (prevLink && prevLink !== currentActive) {
            slider.style.transition = 'none';
            setSliderPosition(prevLink);
            
            void slider.offsetWidth;
            
            slider.style.transition = 'all 0.5s ease-in-out';
            setSliderPosition(currentActive);
        } else {
            setSliderPosition(currentActive);
        }
        
        localStorage.removeItem('prevNavTarget');
    }

    // navLinks.forEach(link => {
    //     link.addEventListener('mouseenter', () => {
    //         if (window.innerWidth > 768) {
    //             slider.style.transition = 'all 0.3s ease';
    //             setSliderPosition(link);
    //         }
    //     });
    // });

    // if (navLinksContainer) {
    //     navLinksContainer.addEventListener('mouseleave', () => {
    //         if (currentActive && window.innerWidth > 768) {
    //             slider.style.transition = 'all 0.3s ease';
    //             setSliderPosition(currentActive);
    //         }
    //     });
    // }

    window.addEventListener('resize', () => {
        if (currentActive && window.innerWidth > 768) {
            slider.style.transition = 'none';
            setSliderPosition(currentActive);
        }
    });

    // ── Scroll progress bar ─────────────────────────────────────
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);

    // ── Directional reveal: upgrade specific elements ───────────
    const revealMap = [
        { sel: '.about-image',  cls: 'reveal-left'  },
        { sel: '.about-text',   cls: 'reveal-right' },
        { sel: '.consultation-card', cls: 'reveal-scale' },
        { sel: '.form-container',    cls: 'reveal-scale' },
        { sel: '.contact-container', cls: 'reveal-scale' },
    ];
    revealMap.forEach(({ sel, cls }) => {
        const el = document.querySelector(sel);
        if (el) { el.classList.remove('reveal'); el.classList.add(cls); }
    });

    // Auto-stagger all grid / list children
    const staggerSelectors = [
        '.services-grid .service-card',
        '.process-grid .process-step',
        '.stats-strip .stat',
        '.gallery .gallery-item',
    ];
    staggerSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.style.transitionDelay = `${i * 0.1}s`;
        });
    });

    // ── Consolidated scroll handler (rAF-throttled) ─────────────
    const hero = document.querySelector('.hero');
    const navbar2 = document.querySelector('.navbar');
    let ticking = false;

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const sy = window.scrollY;
            const docH = document.documentElement.scrollHeight - window.innerHeight;

            // Progress bar
            progressBar.style.width = docH > 0 ? `${(sy / docH) * 100}%` : '0%';

            // Navbar scroll class (re-using existing logic here too)
            if (navbar2) {
                navbar2.classList.toggle('scrolled', sy > 50);
            }

            // Hero parallax
            if (hero && sy < window.innerHeight * 1.2) {
                hero.style.setProperty('--parallax-y', `${sy * 0.18}px`);
            }

            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init on load
});