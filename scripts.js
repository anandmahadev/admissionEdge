// Drawer
var hamBtn = document.getElementById('hamBtn');
var drawer = document.getElementById('drawer');
if (hamBtn && drawer) {
  hamBtn.addEventListener('click', function () {
    hamBtn.classList.toggle('open');
    drawer.classList.toggle('open');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  });
}

function closeD() {
  if (hamBtn && drawer) {
    hamBtn.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('click', function (e) {
  if (hamBtn && drawer) {
    if (!hamBtn.contains(e.target) && !drawer.contains(e.target)) closeD();
  }
});

// Reveal
var revObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e, i) {
    if (e.isIntersecting) {
      setTimeout(function () { e.target.classList.add('in'); }, i * 50);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.rv').forEach(function (el) { revObs.observe(el); });

// Floating CTA
var fCta = document.getElementById('fCta');
var heroEl = document.getElementById('hero');
if (fCta && heroEl) {
  new IntersectionObserver(function (entries) {
    fCta.classList.toggle('show', !entries[0].isIntersecting);
  }, { threshold: 0 }).observe(heroEl);
}

// Form focus
document.querySelectorAll('.ff input,.ff select,.ff textarea').forEach(function (f) {
  f.addEventListener('focus', function () { f.closest('.ff').classList.add('active'); });
  f.addEventListener('blur', function () { f.closest('.ff').classList.remove('active'); });
});

// Form submit
var cForm = document.getElementById('cForm');
if (cForm) {
  cForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var checks = [
      { id: 'f1', ff: 'ff1', fe: 'fe1', ok: function (v) { return v.trim().length >= 2; } },
      { id: 'f2', ff: 'ff2', fe: 'fe2', ok: function (v) { return /^\+?[\d\s\-]{10,14}$/.test(v.replace(/\s/g, '')); } },
      { id: 'f3', ff: 'ff3', fe: 'fe3', ok: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
      { id: 'f4', ff: 'ff4', fe: 'fe4', ok: function (v) { return v !== ''; } }
    ];
    checks.forEach(function (c) {
      var ff = document.getElementById(c.ff);
      var fe = document.getElementById(c.fe);
      if (ff) ff.classList.remove('err');
      if (fe) fe.classList.remove('show');
    });
    var valid = true;
    checks.forEach(function (c) {
      var field = document.getElementById(c.id);
      if (field && !c.ok(field.value)) {
        var ff = document.getElementById(c.ff);
        var fe = document.getElementById(c.fe);
        if (ff) ff.classList.add('err');
        if (fe) fe.classList.add('show');
        valid = false;
      }
    });
    if (valid) {
      this.reset();
      var ok = document.getElementById('fOk');
      if (ok) {
        ok.classList.add('show');
        setTimeout(function () { ok.classList.remove('show'); }, 5000);
      }
    }
  });
}

// ── GALLERY ──
var upInput = document.getElementById('upInput');
var gGrid = document.getElementById('gGrid');
var gCount = document.getElementById('gCount');
var gEmpty = document.getElementById('gEmpty');
var gFilters = document.querySelectorAll('.gf');

var posters = [];
var activeFil = 'all';
var lbIdx = 0;

function getLabel(cat) {
  return { mbbs: 'Medical', eng: 'Engineering', mba: 'MBA', nursing: 'Nursing', law: 'Law', other: 'General' }[cat] || 'General';
}
function guessCategory(name) {
  var n = name.toLowerCase();
  if (/mbbs|bds|medical|dental|neet/.test(n)) return 'mbbs';
  if (/engineer|be|btech|mtech|kcet|comedk/.test(n)) return 'eng';
  if (/mba|pgdm|management/.test(n)) return 'mba';
  if (/nurs|gnm/.test(n)) return 'nursing';
  if (/law|llb|clat/.test(n)) return 'law';
  return 'other';
}
function niceTitle(name) {
  return name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function render() {
  if (!gGrid || !gCount || !gEmpty) return;
  var filtered = activeFil === 'all' ? posters : posters.filter(function (p) { return p.cat === activeFil; });

  // Remove real tiles
  gGrid.querySelectorAll('.g-tile').forEach(function (el) { el.remove(); });

  // Show/hide placeholders
  gGrid.querySelectorAll('.g-ph').forEach(function (el) {
    el.style.display = posters.length === 0 ? '' : 'none';
  });

  if (filtered.length === 0 && posters.length > 0) {
    gEmpty.classList.add('show');
    gGrid.style.display = 'none';
  } else {
    gEmpty.classList.remove('show');
    gGrid.style.display = '';
  }

  filtered.forEach(function (p, i) {
    var tile = document.createElement('div');
    tile.className = 'g-tile';
    tile.innerHTML =
      '<img src="' + p.src + '" alt="' + p.name + '" loading="lazy">' +
      '<div class="g-over"><span class="g-over-tag">' + getLabel(p.cat) + '</span><span class="g-over-title">' + niceTitle(p.name) + '</span></div>' +
      '<button class="g-del" data-i="' + p.id + '">&#x2715;</button>';

    tile.addEventListener('click', function (e) {
      if (e.target.closest('.g-del')) return;
      lbIdx = i;
      openLB(filtered);
    });
    tile.querySelector('.g-del').addEventListener('click', function (e) {
      e.stopPropagation();
      posters = posters.filter(function (x) { return x.id !== p.id; });
      render();
    });
    gGrid.appendChild(tile);
  });

  gCount.textContent = posters.length === 0
    ? '0 posters uploaded'
    : posters.length + ' poster' + (posters.length > 1 ? 's' : '') + ' uploaded';
}

if (upInput) {
  upInput.addEventListener('change', function () {
    var files = Array.from(this.files);
    var loaded = 0;
    if (!files.length) return;
    files.forEach(function (file) {
      if (!file.type.startsWith('image/')) { loaded++; return; }
      var reader = new FileReader();
      reader.onload = function (ev) {
        posters.push({ src: ev.target.result, name: file.name, cat: guessCategory(file.name), id: Date.now() + Math.random() });
        loaded++;
        if (loaded === files.length) render();
      };
      reader.readAsDataURL(file);
    });
    this.value = '';
  });
}

gFilters.forEach(function (btn) {
  btn.addEventListener('click', function () {
    gFilters.forEach(function (b) { b.classList.remove('on'); });
    btn.classList.add('on');
    activeFil = btn.dataset.f;
    render();
  });
});

// Lightbox
var lb = document.getElementById('lb');
var lbImg = document.getElementById('lbImg');
var lbTag = document.getElementById('lbTag');
var lbTitle = document.getElementById('lbTitle');
var lbClose = document.getElementById('lbClose');
var lbPrev = document.getElementById('lbPrev');
var lbNext = document.getElementById('lbNext');

function openLB(list) {
  if (!lb || !lbImg || !lbTag || !lbTitle) return;
  var p = list[lbIdx];
  lbImg.src = p.src;
  lbTag.textContent = getLabel(p.cat);
  lbTitle.textContent = niceTitle(p.name);
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  var show = list.length > 1;
  if (lbPrev) lbPrev.style.display = show ? '' : 'none';
  if (lbNext) lbNext.style.display = show ? '' : 'none';
}
function closeLB() {
  if (!lb || !lbImg) return;
  lb.classList.remove('open');
  lbImg.src = '';
  document.body.style.overflow = '';
}
if (lbClose) lbClose.addEventListener('click', closeLB);
if (lb) {
  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLB();
  });
}
if (lbPrev) {
  lbPrev.addEventListener('click', function () {
    var filtered = activeFil === 'all' ? posters : posters.filter(function (p) { return p.cat === activeFil; });
    lbIdx = (lbIdx - 1 + filtered.length) % filtered.length;
    openLB(filtered);
  });
}
if (lbNext) {
  lbNext.addEventListener('click', function () {
    var filtered = activeFil === 'all' ? posters : posters.filter(function (p) { return p.cat === activeFil; });
    lbIdx = (lbIdx + 1) % filtered.length;
    openLB(filtered);
  });
}

// Swipe
var swipeX = 0;
if (lb) {
  lb.addEventListener('touchstart', function (e) { swipeX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - swipeX;
    if (Math.abs(dx) < 50) return;
    var filtered = activeFil === 'all' ? posters : posters.filter(function (p) { return p.cat === activeFil; });
    if (filtered.length < 2) return;
    lbIdx = dx < 0 ? (lbIdx + 1) % filtered.length : (lbIdx - 1 + filtered.length) % filtered.length;
    openLB(filtered);
  }, { passive: true });
}

document.addEventListener('keydown', function (e) {
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLB();
  var filtered = activeFil === 'all' ? posters : posters.filter(function (p) { return p.cat === activeFil; });
  if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + filtered.length) % filtered.length; openLB(filtered); }
  if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % filtered.length; openLB(filtered); }
});

render();
