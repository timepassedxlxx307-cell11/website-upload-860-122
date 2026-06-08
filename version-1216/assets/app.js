(function () {
    var body = document.body;
    var toggle = document.querySelector(".menu-toggle");

    if (toggle) {
        toggle.addEventListener("click", function () {
            var opened = body.classList.toggle("menu-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var active = 0;
    var timer;

    function setSlide(index) {
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

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            setSlide(active + 1);
        }, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(timer);
            setSlide(Number(dot.getAttribute("data-target") || 0));
            startCarousel();
        });
    });

    setSlide(0);
    startCarousel();

    var catalogSearch = document.querySelector(".catalog-search");
    var catalogFilters = Array.prototype.slice.call(document.querySelectorAll(".catalog-filter"));
    var catalogCards = Array.prototype.slice.call(document.querySelectorAll(".catalog-card"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyQueryFromUrl() {
        if (!catalogSearch) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            catalogSearch.value = q;
        }
    }

    function filterCatalog() {
        if (!catalogCards.length) {
            return;
        }
        var keyword = normalize(catalogSearch ? catalogSearch.value : "");
        var selected = {};
        catalogFilters.forEach(function (filter) {
            selected[filter.getAttribute("data-filter")] = normalize(filter.value);
        });
        catalogCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category")
            ].join(" "));
            var keep = !keyword || haystack.indexOf(keyword) !== -1;
            Object.keys(selected).forEach(function (key) {
                var value = selected[key];
                if (value && haystack.indexOf(value) === -1) {
                    keep = false;
                }
            });
            card.classList.toggle("is-hidden", !keep);
        });
    }

    applyQueryFromUrl();
    filterCatalog();

    if (catalogSearch) {
        catalogSearch.addEventListener("input", filterCatalog);
    }
    catalogFilters.forEach(function (filter) {
        filter.addEventListener("change", filterCatalog);
    });
})();
