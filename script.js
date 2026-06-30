/* =========================================================
   Varsha Parmar — Portfolio interactions
   ========================================================= */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Toast ---------- */
    const box = document.getElementById('message-box');
    const boxText = document.getElementById('message-text');
    let toastTimer;

    function showMessage(msg, type) {
        if (!box) return;
        boxText.textContent = msg;
        box.classList.toggle('is-error', type === 'error');
        box.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => box.classList.remove('show'), 5000);
    }
    if (box) {
        box.querySelector('.message-box__close').addEventListener('click', () => box.classList.remove('show'));
    }

    /* ---------- Nav: scroll state + mobile toggle ---------- */
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('is-scrolled', window.scrollY > 20);
    }, { passive: true });

    function closeMenu() {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
    }
    navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    /* ---------- Active nav link on scroll ---------- */
    const sections = ['work', 'stack', 'about', 'contact']
        .map(id => document.getElementById(id))
        .filter(Boolean);
    const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

    function setActive() {
        let current = '';
        const y = window.scrollY + 120;
        sections.forEach(sec => {
            if (y >= sec.offsetTop) current = sec.id;
        });
        navAnchors.forEach(a => {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', setActive, { passive: true });
    setActive();

    /* ---------- Scroll reveal ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('is-in'));
    }

    /* ---------- Hero network canvas ---------- */
    const canvas = document.getElementById('netCanvas');
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext('2d');
        let w, h, nodes, raf;
        const DENSITY = 0.00009;   // nodes per pixel
        const MAX_DIST = 150;

        function size() {
            const r = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = r.width; h = r.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.min(90, Math.max(28, Math.floor(w * h * DENSITY)));
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28
            }));
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                a.x += a.vx; a.y += a.vy;
                if (a.x < 0 || a.x > w) a.vx *= -1;
                if (a.y < 0 || a.y > h) a.vy *= -1;

                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < MAX_DIST) {
                        const o = (1 - dist / MAX_DIST) * 0.32;
                        ctx.strokeStyle = 'rgba(86, 170, 220,' + o + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
                ctx.fillStyle = 'rgba(120, 200, 230, 0.65)';
                ctx.beginPath();
                ctx.arc(a.x, a.y, 1.7, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        }

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(size, 200);
        });
        size();
        draw();

        // pause when hero off-screen to save battery
        const heroIO = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { if (!raf) draw(); }
                else { cancelAnimationFrame(raf); raf = null; }
            });
        }, { threshold: 0 });
        heroIO.observe(canvas);
    }

    /* ---------- Project detail loading ---------- */
    const main = document.getElementById('main');
    const footer = document.querySelector('.footer');
    const projectContainer = document.getElementById('project-container');

    async function loadProject(id) {
        try {
            const res = await fetch('project-content-' + id + '.html');
            if (!res.ok) throw new Error('not found');
            const html = await res.text();

            projectContainer.innerHTML =
                '<div class="container project-back">' +
                '<button class="project-back__btn" id="backBtn">' +
                '<i class="fas fa-arrow-left"></i> Back to work</button></div>' + html;

            main.style.display = 'none';
            if (footer) footer.style.display = 'none';
            projectContainer.hidden = false;
            window.scrollTo({ top: 0, behavior: 'auto' });

            const back = document.getElementById('backBtn');
            if (back) back.addEventListener('click', () => history.back());
        } catch (err) {
            showMessage('Could not load that project. Please try again.', 'error');
        }
    }

    function showMain() {
        projectContainer.hidden = true;
        projectContainer.innerHTML = '';
        main.style.display = '';
        if (footer) footer.style.display = '';
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('[data-project]');
        if (card) {
            e.preventDefault();
            const id = card.getAttribute('data-project');
            history.pushState({ project: id }, '', '#project-' + id);
            loadProject(id);
        }

        // Any in-page anchor (logo, nav links, back-to-top) restores the main
        // view first when a project detail is currently open.
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor && !card && !projectContainer.hidden) {
            const target = anchor.getAttribute('href');
            showMain();
            if (target && target !== '#' && target !== '#top') {
                e.preventDefault();
                history.pushState(null, '', target);
                const dest = document.querySelector(target);
                if (dest) dest.scrollIntoView();
            }
        }
    });

    window.addEventListener('popstate', () => {
        const m = location.hash.match(/^#project-(\w+)/);
        if (m) loadProject(m[1]);
        else showMain();
    });

    // Deep-link support (e.g. shared #project-4 URL)
    const initial = location.hash.match(/^#project-(\w+)/);
    if (initial) loadProject(initial[1]);

    /* ---------- Contact form (EmailJS) ---------- */
    const form = document.getElementById('contact-form');
    if (form && window.emailjs) {
        emailjs.init('1I0-snLi3Ia01epgn');
        const btn = document.getElementById('sendBtn');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            btn.classList.add('is-loading');
            btn.querySelector('.btn__label').textContent = 'Sending…';

            emailjs.sendForm('service_oox4wku', 'template_j8ka854', this)
                .then(() => {
                    showMessage('Thanks — your message is on its way.', 'success');
                    form.reset();
                })
                .catch(() => {
                    showMessage('Something went wrong. Email me directly at vparmarce@gmail.com.', 'error');
                })
                .finally(() => {
                    btn.classList.remove('is-loading');
                    btn.querySelector('.btn__label').textContent = 'Send message';
                });
        });
    }
})();
