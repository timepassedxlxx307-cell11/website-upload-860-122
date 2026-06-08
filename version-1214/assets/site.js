(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navToggle = $('[data-nav-toggle]');
  var navLinks = $('[data-nav-links]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = $('[data-hero-slider]');

  if (hero) {
    var slides = $$('.hero-slide', hero);
    var dots = $$('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  function text(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function runFilter(area) {
    var input = $('[data-search-input]', area);
    var typeSelect = $('[data-type-filter]', area);
    var regionSelect = $('[data-region-filter]', area);
    var empty = $('[data-empty-state]', area);
    var cards = $$('.movie-card', area);
    var query = text(input && input.value);
    var type = text(typeSelect && typeSelect.value);
    var region = text(regionSelect && regionSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = text(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
      var cardType = text(card.getAttribute('data-type'));
      var cardRegion = text(card.getAttribute('data-region'));
      var matched = (!query || haystack.indexOf(query) !== -1) && (!type || cardType === type) && (!region || cardRegion === region);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  $$('[data-filter-area]').forEach(function (area) {
    var input = $('[data-search-input]', area);
    var typeSelect = $('[data-type-filter]', area);
    var regionSelect = $('[data-region-filter]', area);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (input && q) {
      input.value = q;
    }

    [input, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', function () {
          runFilter(area);
        });
        control.addEventListener('change', function () {
          runFilter(area);
        });
      }
    });

    runFilter(area);
  });
})();
