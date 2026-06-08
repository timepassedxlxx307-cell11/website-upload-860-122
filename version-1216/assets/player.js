(function () {
    function initPlayer(shell) {
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".play-overlay");
        var stream = video ? video.getAttribute("data-hls") : "";
        var hlsInstance = null;

        if (!video || !overlay || !stream) {
            return;
        }

        function attachStream() {
            if (video.getAttribute("src") || hlsInstance) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function playVideo() {
            attachStream();
            overlay.classList.add("is-hidden");
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
    }

    document.querySelectorAll(".player-shell").forEach(initPlayer);
})();
