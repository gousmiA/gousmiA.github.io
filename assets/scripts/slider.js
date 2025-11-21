/* ==========================================
   AUTO SLIDER : Reportage <-> Thèse
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

  const slider = document.querySelector(".feature-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".feature-slide"));
  if (slides.length < 2) return;

  let current = 0;

  function goToNextSlide() {
    const prev = current;
    const next = (current + 1) % slides.length;

    const prevSlide = slides[prev];
    const nextSlide = slides[next];

    // reset classes
    slides.forEach(s => {
      s.classList.remove("leaving-right", "entering-left", "is-current");
    });

    // old slide → slide out to the right
    prevSlide.classList.add("leaving-right");

    // new slide → start from left
    nextSlide.style.transform = "translateX(-100%)";
    nextSlide.style.opacity = "0";

    // trigger the animation
    requestAnimationFrame(() => {
      nextSlide.classList.add("entering-left", "is-current");
      nextSlide.style.transform = "";
      nextSlide.style.opacity = "";
    });

    current = next;
  }

  // Automatic transition every 8 seconds
  setInterval(goToNextSlide, 8000);
});
