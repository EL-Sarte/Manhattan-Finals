const menuButton = document.querySelector(".navbar-toggler");
const navigation = document.querySelector("#site-navigation");

// On small screens, the button reveals the navigation and reports its state to assistive technology.
// `addEventListener` tells the browser to run a function when a particular event happens.
// The `click` event happens when the user clicks or activates the menu button.
menuButton.addEventListener("click", () => {
  // `getAttribute` reads an attribute from an HTML element.
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  // `setAttribute` writes or updates an HTML attribute. `aria-*` attributes describe
  // the menu's state and label to assistive technologies such as screen readers.
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  menuButton.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  // `toggle` adds the class when its second argument is true, and removes it when false.
  navigation.classList.toggle("show", !isExpanded);
});

// Selecting a navigation link closes the mobile menu again.
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    // `remove` deletes the `show` class so the navigation closes.
    navigation.classList.remove("show");
  }
});