// These image URLs give the hero a fresh, relevant photo on each page load.
const heroImages = [
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2200&q=85"
];

// `document` represents the current webpage, and lets JavaScript find its elements.
// `querySelectorAll` finds every element that matches these CSS selectors.
const heroes = document.querySelectorAll(".hero, .report-hero");

// Pick one image at random and apply it to the hero present on this page.
const randomImage = heroImages[Math.floor(Math.random() * heroImages.length)];
// `forEach` runs this function once for each matching hero element.
heroes.forEach((hero) => {
  // `.style` lets JavaScript read or change an element's inline CSS styles.
  // `setProperty` sets a CSS property by name; here it sets a custom property used by CSS.
  hero.style.setProperty("--hero-image", `url("${randomImage}")`);
});