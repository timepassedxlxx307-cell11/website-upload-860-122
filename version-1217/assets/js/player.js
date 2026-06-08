(function () {
  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-player-layer]");
    var button = document.querySelector("[data-player-button]");
    var prepared = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      prepare();
      video.setAttribute("controls", "controls");

      if (layer) {
        layer.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    if (layer) {
      layer.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
