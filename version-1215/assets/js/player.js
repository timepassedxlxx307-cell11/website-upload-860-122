import { H as Hls } from "./hls-local.js";

function setupPlayer(wrapper) {
  const video = wrapper.querySelector("video");
  const startButton = wrapper.querySelector("[data-player-start]");
  const sourceUrl = wrapper.dataset.src || video.dataset.src || "";
  let hls = null;
  let initialized = false;

  function initialize() {
    if (initialized || !sourceUrl) {
      return Promise.resolve();
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      return new Promise((resolve) => {
        hls.on(Hls.Events.MANIFEST_PARSED, resolve);
        hls.on(Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            console.warn("HLS 播放源加载出现问题：", data.type, data.details);
          }
          resolve();
        });
      });
    }

    video.src = sourceUrl;
    return Promise.resolve();
  }

  async function play() {
    await initialize();
    try {
      await video.play();
      wrapper.classList.add("is-playing");
    } catch (error) {
      console.warn("浏览器阻止了自动播放，请再次点击播放器。", error);
    }
  }

  if (startButton) {
    startButton.addEventListener("click", play);
  }

  video.addEventListener("play", function () {
    wrapper.classList.add("is-playing");
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      wrapper.classList.remove("is-playing");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll("[data-hls-player]").forEach(setupPlayer);
