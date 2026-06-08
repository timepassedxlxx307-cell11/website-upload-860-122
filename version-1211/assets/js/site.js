(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
            button.textContent = panel.classList.contains("open") ? "×" : "☰";
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var progress = hero.querySelector(".hero-progress span");
        var index = 0;
        var timer = null;

        function runProgress() {
            if (!progress) {
                return;
            }
            progress.classList.remove("run");
            void progress.offsetWidth;
            progress.classList.add("run");
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
            runProgress();
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        if (slides.length > 0) {
            show(0);
            start();
        }
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid, .list-stack"));
        if (grids.length === 0) {
            return;
        }
        var textInput = document.querySelector(".page-filter-input");
        var selects = Array.prototype.slice.call(document.querySelectorAll(".page-filter-select"));
        var message = document.querySelector("[data-result-message]");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var searchInput = document.querySelector(".search-page-input");

        if (textInput && q) {
            textInput.value = q;
        }
        if (searchInput) {
            searchInput.value = q;
        }

        function valueOf(card, key) {
            return (card.getAttribute("data-" + key) || "").toLowerCase();
        }

        function apply() {
            var query = textInput ? textInput.value.trim().toLowerCase() : "";
            var filters = {};
            selects.forEach(function (select) {
                var key = select.getAttribute("data-filter");
                var value = select.value.trim().toLowerCase();
                if (key && value) {
                    filters[key] = value;
                }
            });
            var cards = Array.prototype.slice.call(document.querySelectorAll(".filterable-card"));
            var visible = 0;
            cards.forEach(function (card) {
                var search = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = !query || search.indexOf(query) !== -1;
                Object.keys(filters).forEach(function (key) {
                    if (valueOf(card, key) !== filters[key]) {
                        matched = false;
                    }
                });
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (message) {
                message.textContent = query ? "已匹配到 " + visible + " 个结果" : "";
            }
        }

        if (textInput) {
            textInput.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    function setupSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("form[action$='search.html']"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = form.getAttribute("action");
                }
            });
        });
    }

    window.initializePlayer = function (source) {
        var video = document.getElementById("video-player");
        if (!video || !source) {
            return;
        }
        var overlay = document.getElementById("player-overlay");
        var loading = document.getElementById("player-loading");
        var errorBox = document.getElementById("player-error");
        var toggle = document.getElementById("player-toggle");
        var mute = document.getElementById("player-mute");
        var fullscreen = document.getElementById("player-fullscreen");
        var hls = null;
        var attached = false;

        function showLoading(value) {
            if (loading) {
                loading.classList.toggle("show", value);
            }
        }

        function showError(message) {
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add("show");
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            showLoading(true);
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    showLoading(false);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            showLoading(false);
                            showError("视频暂时无法播放");
                        }
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    showLoading(false);
                }, { once: true });
            } else {
                showLoading(false);
                showError("当前浏览器无法播放该视频");
            }
        }

        function play() {
            attach();
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {
                    showLoading(false);
                });
            }
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
            if (toggle) {
                toggle.textContent = "暂停";
            }
        });

        video.addEventListener("pause", function () {
            if (toggle) {
                toggle.textContent = "▶";
            }
        });

        video.addEventListener("canplay", function () {
            showLoading(false);
        });

        video.addEventListener("error", function () {
            showLoading(false);
            showError("视频暂时无法播放");
        });

        video.addEventListener("click", togglePlay);

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (toggle) {
            toggle.addEventListener("click", togglePlay);
        }
        if (mute) {
            mute.addEventListener("click", function () {
                video.muted = !video.muted;
                mute.textContent = video.muted ? "静音" : "音量";
            });
        }
        if (fullscreen) {
            fullscreen.addEventListener("click", function () {
                var box = document.querySelector(".player-shell") || video;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (box.requestFullscreen) {
                    box.requestFullscreen();
                }
            });
        }
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSearchForms();
    });
})();
