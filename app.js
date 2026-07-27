const loaderRoot = document.documentElement;
const loaderCount = document.querySelector(".loader-count");
const backgroundMusic = document.querySelector("#background-music");
let loaderFinished = false;
let musicIsStarting = false;
let musicAudioContext;
let musicSource;
let musicGain;
let webAudioUnavailable = false;

const removeMusicStartListeners = () => {
  document.removeEventListener("pointerdown", startBackgroundMusic, true);
  document.removeEventListener("keydown", startBackgroundMusic, true);
};

const startBackgroundMusic = async () => {
  if (!backgroundMusic || musicIsStarting || !backgroundMusic.paused) return;

  musicIsStarting = true;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (AudioContextClass && !webAudioUnavailable) {
      try {
        if (!musicAudioContext) {
          musicAudioContext = new AudioContextClass();
          musicSource = musicAudioContext.createMediaElementSource(backgroundMusic);
          musicGain = musicAudioContext.createGain();
          musicGain.gain.value = 0;
          musicSource.connect(musicGain);
          musicGain.connect(musicAudioContext.destination);
        }

        await musicAudioContext.resume();
      } catch {
        webAudioUnavailable = true;
      }
    }

    backgroundMusic.volume = musicGain ? 1 : 0;
    await backgroundMusic.play();
    removeMusicStartListeners();

    const targetVolume = 0.03;
    const fadeDuration = 2400;

    if (musicGain && musicAudioContext) {
      const fadeStartedAt = musicAudioContext.currentTime;
      musicGain.gain.cancelScheduledValues(fadeStartedAt);
      musicGain.gain.setValueAtTime(0, fadeStartedAt);
      musicGain.gain.linearRampToValueAtTime(
        targetVolume,
        fadeStartedAt + fadeDuration / 1000,
      );
    } else {
      const fadeStartedAt = performance.now();

      const raiseVolume = (now) => {
        const progress = Math.min((now - fadeStartedAt) / fadeDuration, 1);
        backgroundMusic.volume = targetVolume * progress;

        if (progress < 1) {
          window.requestAnimationFrame(raiseVolume);
        }
      };

      window.requestAnimationFrame(raiseVolume);
    }
  } catch {
    musicIsStarting = false;
  }
};

if (backgroundMusic) {
  document.addEventListener("pointerdown", startBackgroundMusic, {
    capture: true,
    passive: true,
  });
  document.addEventListener("keydown", startBackgroundMusic, true);
}

const finishLoader = () => {
  if (loaderFinished) return;

  loaderFinished = true;
  loaderRoot.classList.add("loader-complete");
  loaderRoot.classList.add("site-ready");

  window.setTimeout(() => {
    loaderRoot.classList.remove("loader-active");
    startTextReveal();
  }, 1400);
};

const textRevealTargets = document.querySelectorAll(
  [".intro", ".ride-copy", ".gallery-copy", "footer > div", ".footer-logo"].join(
    ",",
  ),
);

const startTextReveal = () => {
  if (!("IntersectionObserver" in window)) {
    loaderRoot.classList.remove("text-reveal-enabled");
    return;
  }

  const textRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          !entry.isIntersecting ||
          entry.target.dataset.textRevealPlayed === "true"
        ) {
          return;
        }

        entry.target.dataset.textRevealPlayed = "true";
        textRevealObserver.unobserve(entry.target);
        entry.target.classList.add("text-reveal");
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  textRevealTargets.forEach((element) => textRevealObserver.observe(element));
};

if (loaderCount) {
  const pageLoaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => {
          window.addEventListener("load", resolve, { once: true });
        });

  const counterFinished = new Promise((resolve) => {
    let value = 0;

    const counterTimer = window.setInterval(() => {
      value += 1;
      loaderCount.textContent = String(value);

      if (value === 100) {
        window.clearInterval(counterTimer);
        window.setTimeout(resolve, 350);
      }
    }, 35);
  });

  Promise.all([pageLoaded, counterFinished]).then(finishLoader);
  window.setTimeout(finishLoader, 10000);
} else {
  finishLoader();
}
