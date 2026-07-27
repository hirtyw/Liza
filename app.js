const loaderRoot = document.documentElement;
const loaderCount = document.querySelector(".loader-count");
let loaderFinished = false;

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
