(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === index);
        });
    }

    function startTimer() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    function resetTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startTimer();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(index - 1);
            resetTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(index + 1);
            resetTimer();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            resetTimer();
        });
    });

    startTimer();

    Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]')).forEach(function (input) {
        var scope = input.closest('section') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.textContent
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
            });
        });
    });
})();
