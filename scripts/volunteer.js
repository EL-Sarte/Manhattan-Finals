const volunteerSection = document.querySelector(".volunteer-section");
const volunteerBackground = document.querySelector(".volunteer-parallax");
const volunteerButton = document.querySelector("#volunteer-button");
const volunteerFeedback = document.querySelector("#volunteer-feedback");
// Check the device setting that asks websites to reduce motion and animation.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Store the scheduled animation ID so we don't queue duplicate updates.
let animationFrame = null;

// Keep the image layer at the viewport top while the section moves beneath it.
const updateParallax = () => {
  // The frame has started, so clear its ID to allow another update to be scheduled.
  animationFrame = null;

  if (reduceMotion.matches) {
    volunteerBackground.style.transform = "";
    return;
  }

  // `getBoundingClientRect` gives the section's position relative to the visible window.
  const sectionTop = volunteerSection.getBoundingClientRect().top;
  volunteerBackground.style.transform = `translate3d(0, ${-sectionTop}px, 0)`;
};

const requestParallaxUpdate = () => {
  if (animationFrame === null) {
    // Run the update at the browser's next animation frame for smoother movement.
    animationFrame = window.requestAnimationFrame(updateParallax);
  }
};

// Recalculate after scrolling, resizing, or when the reduced-motion preference changes.
// `passive` tells the browser this scroll listener will not cancel scrolling.
window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", requestParallaxUpdate);
reduceMotion.addEventListener("change", requestParallaxUpdate);
requestParallaxUpdate();

// The volunteer registration flow will connect in a later project step.
// When the button is clicked, show a status message in the page.
volunteerButton.addEventListener("click", () => {
  volunteerFeedback.textContent = "Volunteer registration will be available soon.";
  volunteerFeedback.hidden = false;
});