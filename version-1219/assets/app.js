(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            var opened = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function(carousel) {
        var track = carousel.querySelector("[data-hero-track]");
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function render(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            track.style.transform = "translateX(-" + (current * 100) + "%)";
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function move(step) {
            render(current + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                move(1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                move(1);
                restart();
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                render(Number(dot.getAttribute("data-slide-dot")) || 0);
                restart();
            });
        });

        render(0);
        restart();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
        var scope = panel.nextElementSibling || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var search = panel.querySelector("[data-filter-search]");
        var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = search ? normalize(search.value) : "";
            var active = {};

            selects.forEach(function(select) {
                active[select.getAttribute("data-filter-field")] = normalize(select.value);
            });

            cards.forEach(function(card) {
                var text = normalize(card.getAttribute("data-filter"));
                var matched = !keyword || text.indexOf(keyword) !== -1;

                Object.keys(active).forEach(function(key) {
                    var value = active[key];
                    if (!value) {
                        return;
                    }
                    var cardValue = normalize(card.getAttribute("data-" + key));
                    if (cardValue !== value) {
                        matched = false;
                    }
                });

                card.classList.toggle("is-hidden", !matched);
            });
        }

        if (search) {
            search.addEventListener("input", applyFilters);
        }

        selects.forEach(function(select) {
            select.addEventListener("change", applyFilters);
        });
    });
}());
