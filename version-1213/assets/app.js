(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function setupForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './search.html';
        window.location.href = target + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupScrollButtons() {
    document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
        var row = document.getElementById(id);
        if (!row) {
          return;
        }
        var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
        row.scrollBy({ left: direction * 520, behavior: 'smooth' });
      });
    });
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-fill]').forEach(function (button) {
      button.addEventListener('click', function () {
        var panel = button.closest('.filter-panel');
        var input = panel ? panel.querySelector('[data-filter-input]') : null;
        if (input) {
          input.value = button.getAttribute('data-filter-fill') || '';
          input.dispatchEvent(new Event('input'));
        }
      });
    });

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      var targetSelector = input.getAttribute('data-filter-target');
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) {
        return;
      }
      input.addEventListener('input', function () {
        var query = text(input.value);
        target.querySelectorAll('[data-card]').forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' ');
          card.classList.toggle('hidden-by-filter', query && text(haystack).indexOf(query) === -1);
        });
      });
    });
  }

  function buildCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var link = document.createElement('a');
    link.className = 'poster-link';
    link.href = './' + movie.file;
    link.setAttribute('aria-label', movie.title);

    var image = document.createElement('img');
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = 'lazy';

    var badge = document.createElement('span');
    badge.className = 'poster-badge';
    badge.textContent = movie.type;

    link.appendChild(image);
    link.appendChild(badge);

    var body = document.createElement('div');
    body.className = 'movie-card-body';

    var title = document.createElement('a');
    title.className = 'movie-title';
    title.href = './' + movie.file;
    title.textContent = movie.title;

    var line = document.createElement('p');
    line.textContent = movie.oneLine;

    var meta = document.createElement('div');
    meta.className = 'movie-meta';
    [movie.year, movie.region, movie.genre].forEach(function (item) {
      var span = document.createElement('span');
      span.textContent = item;
      meta.appendChild(span);
    });

    var tags = document.createElement('div');
    tags.className = 'tag-row';
    (movie.tags || []).slice(0, 3).forEach(function (tag) {
      var tagSpan = document.createElement('span');
      tagSpan.textContent = tag;
      tags.appendChild(tagSpan);
    });

    body.appendChild(title);
    body.appendChild(line);
    body.appendChild(meta);
    body.appendChild(tags);
    article.appendChild(link);
    article.appendChild(body);
    return article;
  }

  function setupSearchPage() {
    var results = document.getElementById('search-results');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.getElementById('search-page-input');
    var summary = document.getElementById('search-summary');
    if (input) {
      input.value = query;
    }
    var normalized = text(query);
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ');
      return !normalized || text(haystack).indexOf(normalized) !== -1;
    }).slice(0, 240);

    results.innerHTML = '';
    matches.forEach(function (movie) {
      results.appendChild(buildCard(movie));
    });

    if (summary) {
      summary.textContent = query ? '“' + query + '” 的搜索结果' : '输入关键词即可浏览匹配影片';
    }
  }

  window.setupMoviePlayer = function (source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function loadSource() {
      if (loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
      loaded = true;
    }

    function start() {
      loadSource();
      button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupForms();
    setupMobileNav();
    setupHero();
    setupScrollButtons();
    setupFilters();
    setupSearchPage();
  });
})();
