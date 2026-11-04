// These image URLs give the hero a fresh, relevant photo on each page load.
const heroImages = [
  "https://images.unsplash.com/photo-1580041065738-e72023775cdc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "https://images.unsplash.com/photo-1700126689261-1f5bdfe5adcc?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "https://images.unsplash.com/photo-1630699144057-7d5249ef4e6a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  "https://images.unsplash.com/photo-1624204386084-dd8c05e32226?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
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