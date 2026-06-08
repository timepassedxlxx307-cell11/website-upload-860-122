(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function rootPath() {
    return document.body.getAttribute("data-root") || "./";
  }

  function bindSearchForms() {
    document.querySelectorAll("form[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = rootPath() + "search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
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
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function bindSearchPage() {
    var grid = document.querySelector("[data-search-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (input && q) {
      input.value = q;
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value.trim() : "");
      var category = select ? select.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-keywords") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region"));
        var cardCategory = card.getAttribute("data-category") || "";
        var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = !category || cardCategory === category;
        var matched = matchedText && matchedCategory;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  ready(function () {
    bindSearchForms();
    bindMobileMenu();
    bindHero();
    bindSearchPage();
  });
}());
