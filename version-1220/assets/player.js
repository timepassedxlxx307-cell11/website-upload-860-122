import { H as Hls } from "./hls.js";

export function initMoviePlayer(src) {
  var video = document.querySelector("[data-player-video]");
  var shell = document.querySelector("[data-player-shell]");
  var cover = document.querySelector("[data-player-cover]");
  if (!video || !shell || !cover || !src) {
    return;
  }

  var loaded = false;

  function attach() {
    if (loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = src;
    }
    loaded = true;
  }

  function play() {
    attach();
    shell.classList.add("is-playing");
    video.setAttribute("controls", "controls");
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  cover.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (!loaded) {
      play();
    }
  });
}
