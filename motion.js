(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = document.querySelectorAll(
    [
      ".then-card",
      ".film > h2",
      ".film-lead",
      ".film-frame",
      ".walk > h2",
      ".walk-lead",
      ".work-grid article",
      ".tour-lead",
      ".tour-stop",
      ".day-end",
      ".tools h2",
      ".tool-grid article",
      ".shop-guide",
      ".offer-grid article",
      ".req-grid article",
      ".contacts",
    ].join(",")
  );

  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("is-in"));
    return;
  }

  document.documentElement.classList.add("has-motion");

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  nodes.forEach((el) => io.observe(el));

  const film = document.querySelector(".film-frame video");
  if (film) {
    const play = () => {
      const pending = film.play();
      if (pending) pending.catch(() => {});
    };
    const vo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) play();
          else film.pause();
        }
      },
      { threshold: 0.45 }
    );
    vo.observe(film);
  }
})();
