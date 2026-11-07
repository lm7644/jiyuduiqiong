/* 金生丽水 · 丽江五族文化线上展馆 —— 核心交互（原生 JS，零依赖） */
(function () {
  'use strict';

  /* —— 滚动进度（金沙线） —— */
  var progress = document.getElementById('progress');
  var topBtn = document.getElementById('top');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (topBtn) {
      if (h.scrollTop > 600) topBtn.classList.add('show');
      else topBtn.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* —— 移动端菜单 —— */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  /* —— 导航「专题」下拉（点击切换；hover/focus 由 CSS 承担） —— */
  document.querySelectorAll('.drop').forEach(function (drop) {
    var btn = drop.querySelector('.drop-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.querySelectorAll('.drop.open').forEach(function (o) {
        if (o !== drop) { o.classList.remove('open'); var b = o.querySelector('.drop-btn'); if (b) b.setAttribute('aria-expanded', 'false'); }
      });
    });
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) { drop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drop.classList.contains('open')) { drop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  });

  /* —— 滚动渐显 —— */
  var revealEls = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* —— 数字计数 —— */
  function animateNum(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var dur = 1600, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && nums.length) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateNum(en.target); io2.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io2.observe(el); });
  } else {
    nums.forEach(function (el) {
      var v = el.getAttribute('data-count');
      el.textContent = parseFloat(v).toLocaleString();
    });
  }

  /* —— 灯箱画廊 —— */
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCap = lightbox.querySelector('.cap');
    var group = [], gi = 0;
    function openLB(fig) {
      group = Array.prototype.slice.call(document.querySelectorAll('figure.fig'));
      gi = group.indexOf(fig);
      showLB();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function showLB() {
      var f = group[gi];
      if (!f) return;
      var img = f.querySelector('img');
      var cap = f.querySelector('figcaption');
      lbImg.src = img.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt || '';
      lbCap.innerHTML = cap ? cap.innerHTML : '';
    }
    function closeLB() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    document.addEventListener('click', function (e) {
      var fig = e.target.closest && e.target.closest('figure.fig');
      /* 卡片式图组本身是跳转链接：交给链接导航，不再叠开灯箱 */
      if (fig && !fig.closest('a')) { openLB(fig); return; }
      if (e.target.closest('#lightbox .x') || e.target === lightbox) closeLB();
      if (lightbox.classList.contains('open')) {
        if (e.target.closest('#lightbox .next')) { gi = (gi + 1) % group.length; showLB(); }
        if (e.target.closest('#lightbox .prev')) { gi = (gi - 1 + group.length) % group.length; showLB(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowRight') { gi = (gi + 1) % group.length; showLB(); }
      if (e.key === 'ArrowLeft') { gi = (gi - 1 + group.length) % group.length; showLB(); }
    });
  }

  /* —— 非遗手风琴 —— */
  document.querySelectorAll('.ich-item .q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement;
      var a = item.querySelector('.a');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.ich-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.a').style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* —— 时间线时代筛选 —— */
  var tlChips = document.querySelectorAll('.tl-filter .chip');
  if (tlChips.length) {
    tlChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        tlChips.forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        var era = chip.getAttribute('data-era');
        document.querySelectorAll('.tl-item').forEach(function (it) {
          if (era === 'all' || it.getAttribute('data-era') === era) it.classList.remove('hide');
          else it.classList.add('hide');
        });
      });
    });
  }

  /* —— 资源目录分类筛选 + 文字搜索（组合过滤） —— */
  var resChips = document.querySelectorAll('.res-filter .chip');
  var resSearch = document.getElementById('resSearch');
  var resList = document.querySelectorAll('.res');
  var resEmpty = null;
  function applyResFilter() {
    var cat = 'all';
    var onChip = document.querySelector('.res-filter .chip.on');
    if (onChip) cat = onChip.getAttribute('data-cat');
    var q = resSearch ? resSearch.value.trim().toLowerCase() : '';
    var shown = 0;
    resList.forEach(function (r) {
      var okCat = (cat === 'all' || r.getAttribute('data-cat') === cat);
      var okText = !q || r.textContent.toLowerCase().indexOf(q) !== -1;
      if (okCat && okText) { r.classList.remove('hide'); shown++; }
      else r.classList.add('hide');
    });
    if (resEmpty) resEmpty.style.display = shown ? 'none' : 'block';
  }
  if (resChips.length) {
    resChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        resChips.forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        applyResFilter();
      });
    });
  }
  if (resSearch) {
    resEmpty = document.createElement('p');
    resEmpty.className = 'res-empty';
    resEmpty.textContent = '没有匹配的资源——换个关键词试试（如：东巴、彝文、语言、纪录片）。';
    resSearch.parentElement.insertBefore(resEmpty, resSearch.nextSibling);
    resSearch.addEventListener('input', applyResFilter);
  }

  /* —— 普通话朗读（Web Speech，特征检测 + 优雅降级） —— */
  window.speakZh = null;
  if ('speechSynthesis' in window) {
    var pickedVoice = null;
    function pickFrom(list) {
      for (var i = 0; i < list.length; i++) {
        var l = (list[i].lang || '').toLowerCase().replace('_', '-');
        if (l === 'zh-cn' || l === 'zh') return list[i];
      }
      return null;
    }
    function initVoices() {
      var vs = speechSynthesis.getVoices();
      if (vs && vs.length) pickedVoice = pickFrom(vs);
    }
    initVoices();
    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
      speechSynthesis.onvoiceschanged = initVoices;
    }
    window.speakZh = function (text, rate) {
      if (!text) return;
      try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        if (pickedVoice) u.voice = pickedVoice;
        u.rate = rate || 0.92;
        speechSynthesis.speak(u);
      } catch (e) { /* 朗读失败静默 */ }
    };
  }

  /* —— 年份 —— */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
