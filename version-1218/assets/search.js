(function () {
    var data = window.MovieSearchIndex || [];
    var input = document.querySelector('[data-search-input]');
    var button = document.querySelector('[data-search-button]');
    var results = document.querySelector('[data-search-results]');
    var meta = document.querySelector('[data-search-meta]');
    if (!input || !results || !meta) {
        return;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function card(movie) {
        var tags = [movie.type, movie.region, movie.year].concat(movie.tags || []).slice(0, 6).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">'
            + '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">'
            + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
            + '<span class="poster-play">播放</span>'
            + '</a>'
            + '<div class="movie-card-body">'
            + '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>'
            + '<p>' + escapeHtml(movie.oneLine) + '</p>'
            + '<div class="movie-tags">' + tags + '</div>'
            + '</div>'
            + '</article>';
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function search() {
        var query = normalize(input.value.trim());
        if (!query) {
            results.innerHTML = data.slice(0, 36).map(card).join('');
            meta.textContent = '热门推荐';
            return;
        }
        var matched = data.filter(function (movie) {
            var text = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ');
            return normalize(text).indexOf(query) !== -1;
        }).slice(0, 120);
        results.innerHTML = matched.map(card).join('');
        meta.textContent = matched.length ? '搜索结果' : '暂无匹配内容';
    }

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    if (preset) {
        input.value = preset;
    }

    input.addEventListener('input', search);
    if (button) {
        button.addEventListener('click', search);
    }
    search();
})();
