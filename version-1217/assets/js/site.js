(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");

    if (navButton && nav) {
      navButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 6000);
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function (form) {
      var scope = form.parentElement || document;
      var search = form.querySelector("[data-movie-search]");
      var region = form.querySelector("[data-region-filter]");
      var type = form.querySelector("[data-type-filter]");
      var year = form.querySelector("[data-year-filter]");
      var empty = scope.querySelector("[data-empty-state]");

      function currentValue(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function applyFilter() {
        var keyword = currentValue(search);
        var regionValue = currentValue(region);
        var typeValue = currentValue(type);
        var yearValue = currentValue(year);
        var visible = 0;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesRegion = !regionValue || currentData(card, "region") === regionValue;
          var matchesType = !typeValue || currentData(card, "type") === typeValue;
          var matchesYear = !yearValue || currentData(card, "year") === yearValue;
          var matches = matchesKeyword && matchesRegion && matchesType && matchesYear;

          card.classList.toggle("is-filtered-out", !matches);

          if (matches) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      function currentData(card, name) {
        return (card.getAttribute("data-" + name) || "").trim().toLowerCase();
      }

      [search, region, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilter);
          element.addEventListener("change", applyFilter);
        }
      });
    });
  });
})();
