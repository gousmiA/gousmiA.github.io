/* ==========================================
   AUTO SLIDER : Reportage <-> Thèse
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".feature-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".feature-slide"));
  const prevBtn = slider.querySelector(".slider-arrow-left");
  const nextBtn = slider.querySelector(".slider-arrow-right");

  if (!slides.length) return;

  let current = 0;
  const INTERVAL_MS = 8000;
  let timer = null;

  // assure qu'un seul slide est current au départ
  slides.forEach((s, i) => {
    if (i === 0) {
      s.classList.add("is-current");
      s.style.opacity = "1";
      s.style.transform = "translateX(0)";
    } else {
      s.classList.remove("is-current");
      s.style.opacity = "0";
      s.style.transform = "translateX(100%)";
    }
  });

  function animateTo(nextIndex, direction) {
    if (nextIndex === current) return;

    const currentSlide = slides[current];
    const nextSlide = slides[nextIndex];

    // reset transitions
    slides.forEach(s => {
      s.style.transition = "none";
    });

    // état de départ
    currentSlide.style.opacity = "1";
    currentSlide.style.transform = "translateX(0)";
    nextSlide.style.opacity = "0";
    nextSlide.style.transform =
      direction === "next" ? "translateX(-100%)" : "translateX(100%)";

    nextSlide.classList.add("is-current");

    // force reflow
    nextSlide.offsetHeight;

    // activer les transitions
    currentSlide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
    nextSlide.style.transition = "transform 0.6s ease, opacity 0.6s ease";

    requestAnimationFrame(() => {
      currentSlide.style.transform =
        direction === "next" ? "translateX(120%)" : "translateX(-120%)";
      currentSlide.style.opacity = "0";

      nextSlide.style.transform = "translateX(0)";
      nextSlide.style.opacity = "1";
    });

    // nettoyer à la fin
    currentSlide.addEventListener(
      "transitionend",
      function handler() {
        currentSlide.classList.remove("is-current");
        currentSlide.style.transition = "";
        currentSlide.style.transform = "translateX(100%)";
        currentSlide.removeEventListener("transitionend", handler);
      }
    );

    current = nextIndex;
  }

  function goNext() {
    const nextIndex = (current + 1) % slides.length;
    animateTo(nextIndex, "next");
  }

  function goPrev() {
    const prevIndex = (current - 1 + slides.length) % slides.length;
    animateTo(prevIndex, "prev");
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(goNext, INTERVAL_MS);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // auto-rotation
  startTimer();

  // flèches manuelles
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goNext();
      startTimer();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goPrev();
      startTimer();
    });
  }

  // pause auto sur hover (desktop)
  slider.addEventListener("mouseenter", stopTimer);
  slider.addEventListener("mouseleave", startTimer);

  // pause auto pendant le touch (mobile)
  slider.addEventListener("touchstart", stopTimer, { passive: true });
  slider.addEventListener("touchend", startTimer);
});
