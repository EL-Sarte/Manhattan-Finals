const reportForm = document.querySelector("#report-form");
const receivedDateInput = document.querySelector("#date-received");
const screenshotInput = document.querySelector("#report-screenshot");
const locationTextMode = document.querySelector("#location-mode-text");
const locationMapMode = document.querySelector("#location-mode-map");
const locationTextPanel = document.querySelector("#location-text-panel");
const locationMapPanel = document.querySelector("#location-map-panel");
const locationTextInput = document.querySelector("#location-text");
const locationMapInput = document.querySelector("#location-map");
const reportFormStatus = document.querySelector("#report-form-status");
const maxScreenshotSize = 10 * 1024 * 1024;
const reportsStorageKey = "suriReports";

// `Date` gets the current time. Adjust it to local time before filling in today's date.
const localToday = new Date();
localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
const todayValue = localToday.toISOString().slice(0, 10);
receivedDateInput.max = todayValue;
receivedDateInput.value = todayValue;

// Only the selected location method is visible and required.
// This function reads which option is checked, then updates the matching form fields.
const updateLocationMode = () => {
  const useMap = locationMapMode.checked;
  locationTextPanel.hidden = useMap;
  locationMapPanel.hidden = !useMap;
  locationTextInput.disabled = useMap;
  locationTextInput.required = !useMap;
  locationMapInput.disabled = !useMap;
  locationMapInput.required = useMap;
  // `setCustomValidity` sets a browser validation message; an empty string clears it.
  locationTextInput.setCustomValidity("");
  locationMapInput.setCustomValidity("");
};

// A `change` event runs when a form control's selected value changes.
locationTextMode.addEventListener("change", updateLocationMode);
locationMapMode.addEventListener("change", updateLocationMode);

// This function returns true for valid coordinates or a Google Maps link, and false otherwise.
const isValidMapLocation = (value) => {
  const trimmedValue = value.trim();
  const coordinates = trimmedValue.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);

  if (coordinates) {
    const latitude = Number(coordinates[1]);
    const longitude = Number(coordinates[2]);
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  return /^https?:\/\/(?:maps\.app\.goo\.gl|maps\.google\.[a-z.]+|www\.google\.[a-z.]+\/maps)\//i.test(trimmedValue);
};

reportForm.addEventListener("submit", (event) => {
  // Handle the form with JavaScript instead of letting the browser reload the page.
  event.preventDefault();
  reportFormStatus.hidden = true;

  receivedDateInput.setCustomValidity(
    receivedDateInput.value > todayValue ? "The received date cannot be in the future." : ""
  );

  // `files` contains the files selected in a file input; `[0]` is the first one.
  const screenshot = screenshotInput.files[0];
  const screenshotIsValid = !screenshot || (
    // `includes` checks whether the allowed file-type list contains this file's type.
    ["image/png", "image/jpeg", "image/webp"].includes(screenshot.type) &&
    screenshot.size <= maxScreenshotSize
  );
  screenshotInput.setCustomValidity(screenshotIsValid ? "" : "Choose a PNG, JPG, or WebP image no larger than 10 MB.");

  if (locationMapMode.checked && locationMapInput.value.trim()) {
    locationMapInput.setCustomValidity(
      isValidMapLocation(locationMapInput.value) ? "" : "Enter a Google Maps link or valid latitude and longitude."
    );
  } else {
    locationMapInput.setCustomValidity("");
  }

  reportForm.classList.add("was-validated");

  // `reportValidity` asks the browser to check the form and show any validation messages.
  if (!reportForm.reportValidity()) {
    return;
  }

  const reportNumber = `SR-${todayValue.replace(/-/g, "")}-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const location = locationMapMode.checked ? locationMapInput.value.trim() : locationTextInput.value.trim();
  // An object groups the report's related information into named properties.
  const report = {
    reportNumber,
    status: "pending",
    category: reportForm.elements.category.selectedOptions[0].textContent,
    description: document.querySelector("#incident-description").value.trim(),
    suspiciousText: document.querySelector("#suspicious-text").value.trim(),
    screenshotName: screenshot ? screenshot.name : "",
    sender: document.querySelector("#sender").value.trim(),
    receivedDate: receivedDateInput.value,
    email: document.querySelector("#email-address").value.trim(),
    locationMode: locationMapMode.checked ? "map" : "text",
    location,
    submittedAt: new Date().toISOString(),
    verdict: ""
  };

  // `try` lets us handle errors that may occur while reading or writing browser storage.
  try {
    // `JSON.parse` converts saved JSON text into JavaScript data; `JSON.stringify` converts it back.
    const savedReports = JSON.parse(localStorage.getItem(reportsStorageKey) || "{}");
    savedReports[reportNumber] = report;
    localStorage.setItem(reportsStorageKey, JSON.stringify(savedReports));
    window.location.href = `track.html?report=${encodeURIComponent(reportNumber)}`;
  // `catch` runs if storage access or JSON conversion fails.
  } catch {
    reportFormStatus.textContent = "This browser could not save the report locally. Check browser storage settings and try again.";
    reportFormStatus.hidden = false;
  }
});

reportForm.addEventListener("input", (event) => {
  // Clear a previous custom error as soon as the user edits that field.
  event.target.setCustomValidity("");
});