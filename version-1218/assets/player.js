(function () {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    var layer = document.querySelector('[data-player-layer]');
    var configNode = document.getElementById('player-config');
    if (!video || !button || !configNode) {
        return;
    }

    var source = '';
    try {
        source = JSON.parse(configNode.textContent || '{}').src || '';
    } catch (error) {
        source = '';
    }

    var attached = false;
    var hls = null;

    function attachSource() {
        if (attached || !source) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function startPlayback() {
        attachSource();
        if (layer) {
            layer.classList.add('is-hidden');
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                if (layer) {
                    layer.classList.remove('is-hidden');
                }
            });
        }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener('play', function () {
        if (layer) {
            layer.classList.add('is-hidden');
        }
    });
    video.addEventListener('pause', function () {
        if (layer && video.currentTime === 0) {
            layer.classList.remove('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
})();
