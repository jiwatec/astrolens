/**
 * script.js — Vanilla JS client for Astronomy Picture Gallery
 * NASA APOD hero + NASA Images API gallery + lightbox + starfield
 */
(function () {
  'use strict';

  /* ── DOM ─────────────────────────────────────────────── */
  var $loader     = document.getElementById('loader');
  var $error      = document.getElementById('error-state');
  var $errorMsg   = document.getElementById('error-message');
  var $btnRetry   = document.getElementById('btn-retry');
  var $canvas     = document.getElementById('starfield');
  var $navTabs    = document.querySelectorAll('.nav__tab');
  var $btnRandom  = document.getElementById('btn-randomize');

  var $secApod    = document.getElementById('section-apod');
  var $apodImg    = document.getElementById('apod-image');
  var $apodTitle  = document.getElementById('apod-title');
  var $statDate   = document.getElementById('stat-date');
  var $statCopy   = document.getElementById('stat-copy');
  var $statType   = document.getElementById('stat-type');
  var $apodDesc   = document.getElementById('apod-description');

  var $secGal     = document.getElementById('section-gallery');
  var $galHead    = document.getElementById('gallery-heading');
  var $galCount   = document.getElementById('gallery-count');
  var $galGrid    = document.getElementById('gallery-grid');

  var $lightbox   = document.getElementById('lightbox');
  var $lbClose    = document.getElementById('lightbox-close');
  var $lbImg      = document.getElementById('lightbox-image');
  var $lbTitle    = document.getElementById('lightbox-title');
  var $lbDesc     = document.getElementById('lightbox-desc');

  /* ── Community DOM ──────────────────────────────────── */
  var $secComm    = document.getElementById('section-community');
  var $compMsg    = document.getElementById('compose-message');
  var $compTopic  = document.getElementById('compose-topic');
  var $compChars  = document.getElementById('compose-chars');
  var $btnPost    = document.getElementById('btn-post-comment');
  var $commentFeed  = document.getElementById('comment-feed');
  var $commentEmpty = document.getElementById('comment-empty');
  var $filterChips  = document.querySelectorAll('.filter-chip');
  var activeTopic = 'all';

  var activeTab = 'random';

  /* ── Helpers ─────────────────────────────────────────── */
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }
  function hideAll() { hide($loader); hide($error); hide($secApod); hide($secGal); hide($lightbox); hide($secComm); }
  function showLoader() { hideAll(); show($loader); }
  function showError(msg) { hideAll(); $errorMsg.textContent = msg; show($error); }

  /* ── API fetch with JSON safety ──────────────────────── */
  function apiFetch(url) {
    return fetch(url).then(function (res) {
      return res.text();
    }).then(function (text) {
      try { return JSON.parse(text); }
      catch (_) { throw new Error('Invalid server response'); }
    }).then(function (json) {
      if (!json.success) throw new Error(json.error || 'Request failed');
      return json.data;
    });
  }

  /* ══════════════════════════════════════════════════════════
     SKELETON CARDS (shown instantly while data loads)
     ══════════════════════════════════════════════════════════ */
  function showSkeletons(count) {
    $galGrid.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var skel = document.createElement('div');
      skel.className = 'gallery-card skeleton';
      skel.innerHTML =
        '<div class="gallery-card__image-wrap skeleton__shimmer"></div>' +
        '<div class="gallery-card__body">' +
          '<div class="skeleton__line skeleton__line--title"></div>' +
          '<div class="skeleton__line"></div>' +
          '<div class="skeleton__line skeleton__line--short"></div>' +
        '</div>';
      $galGrid.appendChild(skel);
    }
  }

  /* ══════════════════════════════════════════════════════════
     APOD — Picture of the Day
     ══════════════════════════════════════════════════════════ */
  function loadAPOD() {
    showLoader();
    var expectedTab = activeTab;
    apiFetch('/api/apod').then(function (data) {
      /* If user switched tabs while fetching, discard this response */
      if (activeTab !== expectedTab) return;

      if (data.media_type === 'video') {
        $apodImg.src = data.image_url || '';
        $apodImg.alt = 'Video — see description';
      } else {
        $apodImg.classList.add('loading');
        $apodImg.onload = function () { $apodImg.classList.remove('loading'); };
        $apodImg.onerror = function () { $apodImg.classList.remove('loading'); };
        $apodImg.src = data.image_url;
        $apodImg.alt = data.title;
      }
      $apodTitle.textContent = data.title;
      $statDate.textContent  = data.date;
      $statType.textContent  = data.media_type === 'video' ? 'Video' : 'Image';
      
      var copyText = data.copyright ? data.copyright.substring(0, 15) : 'NASA / Public';
      if (data.copyright && data.copyright.length > 15) copyText += '...';
      $statCopy.textContent  = copyText;

      $apodDesc.textContent  = data.description;
      
      hideAll();
      show($secApod);
    }).catch(function (err) {
      if (activeTab !== expectedTab) return;
      console.error('APOD:', err);
      showError(err.message || 'NASA APOD temporarily unavailable. Try the gallery tabs above!');
    });
  }

  /* ══════════════════════════════════════════════════════════
     GALLERY — NASA Images API
     ══════════════════════════════════════════════════════════ */
  function createCard(item, idx) {
    var card = document.createElement('div');
    card.className = 'gallery-card';
    card.style.animationDelay = (idx * 60) + 'ms';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    var img = document.createElement('img');
    img.className = 'gallery-card__image';
    img.alt = item.title;
    img.loading = 'lazy';
    img.src = item.image_url;

    var wrap = document.createElement('div');
    wrap.className = 'gallery-card__image-wrap';
    wrap.appendChild(img);

    var body = document.createElement('div');
    body.className = 'gallery-card__body';

    var h3 = document.createElement('h3');
    h3.className = 'gallery-card__title';
    h3.textContent = item.title;

    var p = document.createElement('p');
    p.className = 'gallery-card__snippet';
    p.textContent = item.description;

    body.appendChild(h3);
    body.appendChild(p);
    card.appendChild(wrap);
    card.appendChild(body);

    card.addEventListener('click', function () { openLightbox(item); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });
    return card;
  }

  function loadGallery(category) {
    /* Show section immediately with skeletons */
    hideAll();
    $galHead.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    $galCount.textContent = 'Loading…';
    show($secGal);
    showSkeletons(8);

    var expectedTab = activeTab;
    apiFetch('/api/gallery?category=' + encodeURIComponent(category)).then(function (images) {
      if (activeTab !== expectedTab) return;
      $galCount.textContent = images.length + ' image' + (images.length !== 1 ? 's' : '');
      $galGrid.innerHTML = '';
      images.forEach(function (item, i) {
        $galGrid.appendChild(createCard(item, i));
      });
    }).catch(function (err) {
      if (activeTab !== expectedTab) return;
      console.error('Gallery:', err);
      showError(err.message || 'Failed to load gallery. Try again.');
    });
  }

  /* ══════════════════════════════════════════════════════════
     LIGHTBOX
     ══════════════════════════════════════════════════════════ */
  function openLightbox(item) {
    $lbImg.src = item.hd_url || item.image_url;
    $lbImg.alt = item.title;
    $lbImg.onerror = function () { $lbImg.src = item.image_url; };
    $lbTitle.textContent = item.title;
    $lbDesc.textContent  = item.description;
    show($lightbox);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    hide($lightbox);
    document.body.style.overflow = '';
  }

  $lbClose.addEventListener('click', closeLightbox);
  $lightbox.addEventListener('click', function (e) { if (e.target === $lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$lightbox.classList.contains('hidden')) closeLightbox();
  });

  /* ══════════════════════════════════════════════════════════
     COMMUNITY — Anonymous Discussion
     ══════════════════════════════════════════════════════════ */

  /** Format a timestamp into a human-readable "time ago" string */
  function timeAgo(dateStr) {
    var now = Date.now();
    var then = new Date(dateStr).getTime();
    var diff = Math.max(0, now - then);
    var seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 30) return days + 'd ago';
    var months = Math.floor(days / 30);
    return months + 'mo ago';
  }

  /** Get initials from an alias like "Cosmic Voyager" → "CV" */
  function getInitials(alias) {
    var parts = (alias || '').split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return (alias || '?')[0];
  }

  /** Render a single comment card DOM element */
  function createCommentCard(comment, highlight) {
    var card = document.createElement('div');
    card.className = 'comment-card';
    if (highlight) card.className += ' just-posted';
    card.style.animationDelay = '0ms';

    var avatar = document.createElement('div');
    avatar.className = 'comment-card__avatar';
    avatar.style.background = comment.avatar_color || '#9E6DFF';
    avatar.textContent = getInitials(comment.alias);

    var body = document.createElement('div');
    body.className = 'comment-card__body';

    var meta = document.createElement('div');
    meta.className = 'comment-card__meta';

    var aliasEl = document.createElement('span');
    aliasEl.className = 'comment-card__alias';
    aliasEl.textContent = comment.alias;

    var topicEl = document.createElement('span');
    topicEl.className = 'comment-card__topic';
    topicEl.textContent = comment.topic || 'general';

    var timeEl = document.createElement('span');
    timeEl.className = 'comment-card__time';
    timeEl.textContent = timeAgo(comment.created_at);

    meta.appendChild(aliasEl);
    meta.appendChild(topicEl);
    meta.appendChild(timeEl);

    var msg = document.createElement('p');
    msg.className = 'comment-card__message';
    msg.textContent = comment.message;

    body.appendChild(meta);
    body.appendChild(msg);
    card.appendChild(avatar);
    card.appendChild(body);

    return card;
  }

  /** Load comments from the API */
  function loadComments(topic) {
    var url = '/api/comments';
    if (topic && topic !== 'all') url += '?topic=' + encodeURIComponent(topic);

    $commentFeed.innerHTML = '';
    hide($commentEmpty);

    apiFetch(url).then(function (comments) {
      if (!comments || comments.length === 0) {
        show($commentEmpty);
        return;
      }
      hide($commentEmpty);
      comments.forEach(function (c, i) {
        var card = createCommentCard(c, false);
        card.style.animationDelay = (i * 40) + 'ms';
        $commentFeed.appendChild(card);
      });
    }).catch(function (err) {
      console.error('Comments:', err);
      $commentFeed.innerHTML = '<p style="color: var(--clr-text-dim); text-align: center; padding: 2rem;">Could not load comments.</p>';
    });
  }

  /** Post a new anonymous comment */
  function postComment() {
    var message = $compMsg.value.trim();
    var topic = $compTopic.value;
    if (!message || message.length < 2) return;

    $btnPost.classList.add('sending');
    $btnPost.textContent = 'Sending…';

    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, topic: topic }),
    })
    .then(function (res) { return res.json(); })
    .then(function (json) {
      $btnPost.classList.remove('sending');
      $btnPost.textContent = 'Transmit';
      if (!json.success) {
        alert(json.error || 'Failed to post.');
        return;
      }
      /* Prepend the new comment with a highlight */
      var card = createCommentCard(json.data, true);
      $commentFeed.insertBefore(card, $commentFeed.firstChild);
      hide($commentEmpty);

      /* Clear compose area */
      $compMsg.value = '';
      $compChars.textContent = '0 / 1000';
      $compChars.className = 'compose__charcount';

      /* Remove highlight after 3s */
      setTimeout(function () { card.classList.remove('just-posted'); }, 3000);
    })
    .catch(function (err) {
      console.error('Post error:', err);
      $btnPost.classList.remove('sending');
      $btnPost.textContent = 'Transmit';
      alert('Network error. Try again.');
    });
  }

  /* ── Community event listeners ──────────────────────── */
  $btnPost.addEventListener('click', postComment);

  /* Character counter */
  $compMsg.addEventListener('input', function () {
    var len = $compMsg.value.length;
    $compChars.textContent = len + ' / 1000';
    $compChars.className = 'compose__charcount';
    if (len > 900) $compChars.classList.add('at-limit');
    else if (len > 700) $compChars.classList.add('near-limit');
  });

  /* Ctrl+Enter to post */
  $compMsg.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      postComment();
    }
  });

  /* Topic filter chips */
  $filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var topic = chip.getAttribute('data-topic');
      if (topic === activeTopic) return;
      $filterChips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      activeTopic = topic;
      loadComments(topic);
    });
  });

  /** Show the community section */
  function showCommunity() {
    hideAll();
    show($secComm);
    loadComments(activeTopic);
  }

  /* ══════════════════════════════════════════════════════════
     TAB NAVIGATION
     ══════════════════════════════════════════════════════════ */
  $navTabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = btn.getAttribute('data-tab');
      if (tab === activeTab) return;
      $navTabs.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeTab = tab;
      if (tab === 'random') loadAPOD();
      else if (tab === 'community') showCommunity();
      else loadGallery(tab);
    });
  });

  $btnRetry.addEventListener('click', function () {
    if (activeTab === 'random') loadAPOD();
    else if (activeTab === 'community') showCommunity();
    else loadGallery(activeTab);
  });

  if ($btnRandom) {
    $btnRandom.addEventListener('click', loadAPOD);
  }

  /* ══════════════════════════════════════════════════════════
     STARFIELD (Canvas)
     ══════════════════════════════════════════════════════════ */
  (function () {
    var ctx = $canvas.getContext('2d');
    var stars = [], N = 260;

    function resize() { $canvas.width = window.innerWidth; $canvas.height = window.innerHeight; }
    function seed() {
      stars = [];
      for (var i = 0; i < N; i++) {
        stars.push({
          x: Math.random() * $canvas.width, y: Math.random() * $canvas.height,
          r: Math.random() * 1.3 + 0.3, s: Math.random() * 0.002 + 0.0005,
          p: Math.random() * 6.28,
        });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.28);
        ctx.fillStyle = 'rgba(210,218,255,' + a + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    resize(); seed(); requestAnimationFrame(draw);
    window.addEventListener('resize', function () { resize(); seed(); });
  })();

  /* ── Boot ────────────────────────────────────────────── */
  loadAPOD();
})();
