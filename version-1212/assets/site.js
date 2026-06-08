(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileNav() {
        var button = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-nav]');
        if (!button || !panel) return;
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) return;
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (!slides.length) return;
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        function stop() {
            if (timer) clearInterval(timer);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCardFilter() {
        var input = qs('[data-filter-input]');
        if (!input) return;
        var cards = qsa('[data-card]');
        input.addEventListener('input', function () {
            var term = normalize(input.value);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
                card.classList.toggle('hidden-card', term && haystack.indexOf(term) === -1);
            });
        });
    }

    function resolveUrl(path) {
        return String(path || '');
    }

    function setupPlayer(videoId, overlayId, url) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !url) return;
        var initialized = false;
        function attach() {
            if (initialized) return;
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function play() {
            attach();
            if (overlay) overlay.classList.add('hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) play();
        });
    }

    function initSearchPage() {
        var root = qs('[data-search-page]');
        if (!root || !window.SITE_MOVIES) return;
        var input = qs('[data-search-keyword]', root);
        var category = qs('[data-search-category]', root);
        var year = qs('[data-search-year]', root);
        var results = qs('[data-search-results]', root);
        var note = qs('[data-search-note]', root);
        var params = new URLSearchParams(location.search);
        if (params.get('q') && input) input.value = params.get('q');
        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + movie.url + '"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-tag">' + escapeHtml(movie.category) + '</span></a>',
                '<div class="card-body"><h2 class="card-title"><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
                '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>·</span><span>' + escapeHtml(movie.region) + '</span><span>·</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<p class="card-summary">' + escapeHtml(movie.oneLine) + '</p></div>',
                '</article>'
            ].join('');
        }
        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        function render() {
            var keyword = normalize(input && input.value);
            var cat = category && category.value;
            var yr = year && year.value;
            var list = window.SITE_MOVIES.filter(function (movie) {
                var matchKeyword = !keyword || normalize(movie.title + ' ' + movie.oneLine + ' ' + movie.genre + ' ' + movie.tags).indexOf(keyword) !== -1;
                var matchCat = !cat || movie.category === cat;
                var matchYear = !yr || movie.year === yr;
                return matchKeyword && matchCat && matchYear;
            }).slice(0, 120);
            results.innerHTML = list.map(card).join('');
            note.textContent = list.length ? '为你找到以下相关影片' : '暂无匹配结果，可尝试更换关键词或分类';
        }
        [input, category, year].forEach(function (node) {
            if (node) node.addEventListener('input', render);
            if (node) node.addEventListener('change', render);
        });
        render();
    }

    window.setupPlayer = setupPlayer;
    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initCardFilter();
        initSearchPage();
    });
})();
