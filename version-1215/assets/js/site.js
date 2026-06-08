(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

    if (slides.length > 1) {
      start();
    }
  }

  function setupGlobalSearchForms() {
    document.querySelectorAll(".global-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var target = form.dataset.searchTarget || "search.html";
        var query = input ? input.value.trim() : "";
        var connector = target.indexOf("?") === -1 ? "?" : "&";

        window.location.href = query ? target + connector + "q=" + encodeURIComponent(query) : target;
      });
    });
  }

  function setupPageFilter() {
    document.querySelectorAll("[data-page-filter]").forEach(function (form) {
      var input = form.querySelector("input");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

      if (!input || cards.length === 0) {
        return;
      }

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.textContent
          ].join(" ").toLowerCase();

          card.classList.toggle("is-hidden-by-filter", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<a class=\"movie-card\" href=\"" + escapeAttribute(movie.url) + "\" data-title=\"" + escapeAttribute(movie.title) + "\" data-year=\"" + escapeAttribute(movie.year) + "\" data-region=\"" + escapeAttribute(movie.region) + "\" data-type=\"" + escapeAttribute(movie.type) + "\">",
      "  <span class=\"movie-poster-wrap\">",
      "    <span class=\"poster-frame\" data-title=\"" + escapeAttribute(movie.title) + "\">",
      "      <img class=\"poster-img\" src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\" onerror=\"markPosterMissing(this)\">",
      "    </span>",
      "    <span class=\"movie-year\">" + escapeHtml(movie.year || "") + "</span>",
      "    <span class=\"play-mask\">立即观看</span>",
      "  </span>",
      "  <span class=\"movie-card-body\">",
      "    <strong>" + escapeHtml(movie.title) + "</strong>",
      "    <span class=\"movie-line\">" + escapeHtml(movie.oneLine || "") + "</span>",
      "    <span class=\"movie-meta\"><em>" + escapeHtml(movie.region || "") + "</em><em>" + escapeHtml(movie.type || "") + "</em></span>",
      "    <span class=\"tag-row\">" + tags + "</span>",
      "  </span>",
      "</a>"
    ].join("");
  }

  function setupSearchPage() {
    var index = window.MOVIE_SEARCH_INDEX || null;
    var form = document.querySelector("[data-search-page-form]");
    var input = document.getElementById("searchInput");
    var typeFilter = document.getElementById("typeFilter");
    var summary = document.getElementById("searchSummary");
    var results = document.getElementById("searchResults");

    if (!index || !form || !input || !summary || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function runSearch() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = typeFilter ? typeFilter.value : "";
      var matched = index.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.typeGroup,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase();
        var keywordMatched = keyword ? haystack.indexOf(keyword) !== -1 : true;
        var typeMatched = typeValue ? movie.typeGroup === typeValue || movie.type.indexOf(typeValue) !== -1 : true;

        return keywordMatched && typeMatched;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCardTemplate).join("");
      summary.textContent = "找到 " + matched.length + " 条结果" + (keyword ? "：" + input.value.trim() : "");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });

    input.addEventListener("input", runSearch);

    if (typeFilter) {
      typeFilter.addEventListener("change", runSearch);
    }

    runSearch();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  ready(function () {
    setupNavigation();
    setupHeroCarousel();
    setupGlobalSearchForms();
    setupPageFilter();
    setupSearchPage();
  });
})();
