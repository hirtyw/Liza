const revealTargets = document.querySelectorAll(
  [
    ".intro",
    ".group-ten",
    ".band",
    ".ride-copy",
    ".gallery-copy",
    ".photo-card",
    "footer > div",
    ".footer-logo",
  ].join(","),
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("content-reveal");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -5% 0px",
    },
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
}
