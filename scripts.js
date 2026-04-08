const AdmissionEdge = (() => {
    'use strict';

    // State
    let posters = [];
    let activeFil = 'all';
    let lbIdx = 0;

    // Selectors
    const hamBtn = document.getElementById('hamBtn');
    const drawer = document.getElementById('drawer');
    const fCta = document.getElementById('fCta');
    const heroEl = document.getElementById('hero');
    const cForm = document.getElementById('cForm');
    const upInput = document.getElementById('upInput');
    const gGrid = document.getElementById('gGrid');
    const gCount = document.getElementById('gCount');
    const gEmpty = document.getElementById('gEmpty');
    const gFilters = document.querySelectorAll('.gf');
    const lb = document.getElementById('lb');
    const lbImg = document.getElementById('lbImg');
    const lbTag = document.getElementById('lbTag');
    const lbTitle = document.getElementById('lbTitle');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');

    // UI - Drawer
    const closeD = () => {
        if (hamBtn && drawer) {
            hamBtn.classList.remove('open');
            drawer.classList.remove('open');
            document.body.style.overflow = '';
            hamBtn.setAttribute('aria-expanded', 'false');
            drawer.setAttribute('aria-hidden', 'true');
        }
    };

    window.closeD = closeD;

    const initDrawer = () => {
        if (hamBtn && drawer) {
            hamBtn.addEventListener('click', () => {
                const isOpen = drawer.classList.toggle('open');
                hamBtn.classList.toggle('open');
                document.body.style.overflow = isOpen ? 'hidden' : '';
                hamBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            });

            document.addEventListener('click', (e) => {
                if (!hamBtn.contains(e.target) && !drawer.contains(e.target)) closeD();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeD();
            });
        }
    };

    // UI - Reveal Animations
    const initReveal = () => {
        const revObs = new IntersectionObserver((entries) => {
            entries.forEach((e, i) => {
                if (e.isIntersecting) {
                    setTimeout(() => { e.target.classList.add('in'); }, i * 50);
                    revObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
        document.querySelectorAll('.rv').forEach((el) => { revObs.observe(el); });
    };

    // UI - Floating CTA
    const initFloatingCTA = () => {
        const contactEl = document.getElementById('contact');
        if (fCta && heroEl && contactEl) {
            const showCTA = { hero: false, contact: false };

            const updateCTA = () => {
                fCta.classList.toggle('show', showCTA.hero && !showCTA.contact);
            };

            new IntersectionObserver((entries) => {
                showCTA.hero = !entries[0].isIntersecting;
                updateCTA();
            }, { threshold: 0 }).observe(heroEl);

            new IntersectionObserver((entries) => {
                showCTA.contact = entries[0].isIntersecting;
                updateCTA();
            }, { threshold: 0 }).observe(contactEl);
        }
    };

    // UI - Form Handling
    const initForm = () => {
        document.querySelectorAll('.ff input,.ff select,.ff textarea').forEach((f) => {
            f.addEventListener('focus', () => { f.closest('.ff').classList.add('active'); });
            f.addEventListener('blur', () => { f.closest('.ff').classList.remove('active'); });
        });

        if (cForm) {
            cForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const checks = [
                    { id: 'f1', ff: 'ff1', fe: 'fe1', ok: (v) => v.trim().length >= 2 },
                    {
                        id: 'f2',
                        ff: 'ff2',
                        fe: 'fe2',
                        ok: (v) => {
                            const digits = v.replace(/\D/g, '');
                            return digits.length >= 10 && digits.length <= 15;
                        }
                    },
                    { id: 'f3', ff: 'ff3', fe: 'fe3', ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
                    { id: 'f4', ff: 'ff4', fe: 'fe4', ok: (v) => v.trim() !== '' }
                ];

                checks.forEach((c) => {
                    const ff = document.getElementById(c.ff);
                    const fe = document.getElementById(c.fe);
                    if (ff) ff.classList.remove('err');
                    if (fe) fe.classList.remove('show');
                });

                let valid = true;
                checks.forEach((c) => {
                    const field = document.getElementById(c.id);
                    const value = field ? field.value : '';
                    if (field && !c.ok(value)) {
                        const ff = document.getElementById(c.ff);
                        const fe = document.getElementById(c.fe);
                        if (ff) ff.classList.add('err');
                        if (fe) fe.classList.add('show');
                        valid = false;
                    }
                });

                if (valid) {
                    this.reset();
                    const ok = document.getElementById('fOk');
                    if (ok) {
                        ok.classList.add('show');
                        setTimeout(() => { ok.classList.remove('show'); }, 5000);
                    }
                }
            });
        }
    };

    // UI - Gallery
    const getCatLabel = (cat) => ({ mbbs: 'Medical', eng: 'Engineering', mba: 'MBA', nursing: 'Nursing', law: 'Law', other: 'General' }[cat] || 'General');

    const guessCategory = (name) => {
        const n = name.toLowerCase();
        if (/mbbs|bds|medical|dental|neet/.test(n)) return 'mbbs';
        if (/engineer|be|btech|mtech|kcet|comedk/.test(n)) return 'eng';
        if (/mba|pgdm|management/.test(n)) return 'mba';
        if (/nurs|gnm/.test(n)) return 'nursing';
        if (/law|llb|clat/.test(n)) return 'law';
        return 'other';
    };

    const getNiceTitle = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const renderGallery = () => {
        if (!gGrid || !gCount || !gEmpty) return;
        const filtered = activeFil === 'all' ? posters : posters.filter((p) => p.cat === activeFil);

        gGrid.querySelectorAll('.g-tile').forEach((el) => { el.remove(); });
        gGrid.querySelectorAll('.g-ph').forEach((el) => {
            el.style.display = posters.length === 0 ? '' : 'none';
        });

        if (filtered.length === 0 && posters.length > 0) {
            gEmpty.classList.add('show');
            gGrid.style.display = 'none';
        } else {
            gEmpty.classList.remove('show');
            gGrid.style.display = '';
        }

        filtered.forEach((p, i) => {
            const tile = document.createElement('div');
            tile.className = 'g-tile';
            tile.innerHTML = `
        <img src="${p.src}" alt="${p.name}" loading="lazy">
        <div class="g-over">
          <span class="g-over-tag">${getCatLabel(p.cat)}</span>
          <span class="g-over-title">${getNiceTitle(p.name)}</span>
        </div>
        <button class="g-del" data-i="${p.id}" aria-label="Delete poster">✕</button>
      `;

            tile.addEventListener('click', (e) => {
                if (e.target.closest('.g-del')) return;
                lbIdx = i;
                openLightbox(filtered);
            });

            tile.querySelector('.g-del').addEventListener('click', (e) => {
                e.stopPropagation();
                posters = posters.filter((x) => x.id !== p.id);
                renderGallery();
            });
            gGrid.appendChild(tile);
        });

        const count = posters.length;
        gCount.textContent = count === 0 ? '0 posters uploaded' : `${count} poster${count > 1 ? 's' : ''} uploaded`;
    };

    const openLightbox = (list) => {
        if (!lb || !lbImg || !lbTag || !lbTitle) return;
        if (!list.length) return;
        const p = list[lbIdx];
        lbImg.src = p.src;
        lbTag.textContent = getCatLabel(p.cat);
        lbTitle.textContent = getNiceTitle(p.name);
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        const showNav = list.length > 1;
        if (lbPrev) lbPrev.style.display = showNav ? '' : 'none';
        if (lbNext) lbNext.style.display = showNav ? '' : 'none';
    };

    const closeLightbox = () => {
        if (!lb || !lbImg) return;
        lb.classList.remove('open');
        lbImg.src = '';
        document.body.style.overflow = '';
    };

    const initGallery = () => {
        if (upInput) {
            upInput.addEventListener('change', function() {
                const files = Array.from(this.files);
                let loaded = 0;
                if (!files.length) return;
                files.forEach((file) => {
                    if (!file.type.startsWith('image/')) { loaded++; return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        posters.push({ src: ev.target.result, name: file.name, cat: guessCategory(file.name), id: Date.now() + Math.random() });
                        loaded++;
                        if (loaded === files.length) renderGallery();
                    };
                    reader.readAsDataURL(file);
                });
                this.value = '';
            });
        }

        gFilters.forEach((btn) => {
            btn.addEventListener('click', () => {
                gFilters.forEach((b) => { b.classList.remove('on'); });
                btn.classList.add('on');
                activeFil = btn.dataset.f;
                renderGallery();
            });
        });

        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        if (lb) {
            lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

            // Swipe support
            let swipeX = 0;
            lb.addEventListener('touchstart', (e) => { swipeX = e.touches[0].clientX; }, { passive: true });
            lb.addEventListener('touchend', (e) => {
                const dx = e.changedTouches[0].clientX - swipeX;
                if (Math.abs(dx) < 50) return;
                const filtered = activeFil === 'all' ? posters : posters.filter((p) => p.cat === activeFil);
                if (filtered.length < 2) return;
                lbIdx = dx < 0 ? (lbIdx + 1) % filtered.length : (lbIdx - 1 + filtered.length) % filtered.length;
                openLightbox(filtered);
            }, { passive: true });
        }

        if (lbPrev) lbPrev.addEventListener('click', () => {
            const filtered = activeFil === 'all' ? posters : posters.filter((p) => p.cat === activeFil);
            if (!filtered.length) return;
            lbIdx = (lbIdx - 1 + filtered.length) % filtered.length;
            openLightbox(filtered);
        });
        if (lbNext) lbNext.addEventListener('click', () => {
            const filtered = activeFil === 'all' ? posters : posters.filter((p) => p.cat === activeFil);
            if (!filtered.length) return;
            lbIdx = (lbIdx + 1) % filtered.length;
            openLightbox(filtered);
        });

        document.addEventListener('keydown', (e) => {
            if (!lb || !lb.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            const filtered = activeFil === 'all' ? posters : posters.filter((p) => p.cat === activeFil);
            if (!filtered.length) return;
            if (e.key === 'ArrowLeft') {
                lbIdx = (lbIdx - 1 + filtered.length) % filtered.length;
                openLightbox(filtered);
            }
            if (e.key === 'ArrowRight') {
                lbIdx = (lbIdx + 1) % filtered.length;
                openLightbox(filtered);
            }
        });

        renderGallery();
    };

    // Entry
    return {
        init: () => {
            initDrawer();
            initReveal();
            initFloatingCTA();
            initForm();
            initGallery();
        }
    };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', AdmissionEdge.init);