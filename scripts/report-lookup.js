const reportLookupForm = document.querySelector("#report-lookup-form");
const reportNumberInput = document.querySelector("#report-number");
const reportLookupFeedback = document.querySelector("#report-lookup-feedback");
const reportsStorageKey = "suriReports";

// Only reports saved in this browser can be looked up in this frontend demo.
reportLookupForm.addEventListener("submit", (event) => {
  // Stop the browser's normal form submission, which would reload or navigate away.
  event.preventDefault();

  // `.value` is the text currently entered in the input; `.trim()` removes
  // whitespace from the beginning and end before checking whether it is empty.
  if (!reportNumberInput.value.trim()) {
    reportNumberInput.value = "";
    // Move keyboard focus to the input and ask the browser to show its validation message.
    reportNumberInput.focus();
    reportNumberInput.reportValidity();
    return;
  }

  // `try` runs code that might fail, such as reading unavailable or invalid saved data.
  try {
    // JSON is a text format for storing data. `JSON.parse` turns that text into
    // JavaScript values, such as the object of saved reports used below.
    const savedReports = JSON.parse(localStorage.getItem(reportsStorageKey) || "{}");
    const reportNumber = reportNumberInput.value.trim().toUpperCase();

    if (!savedReports[reportNumber]) {
      reportLookupFeedback.textContent = "No report with that number was found in this browser.";
      reportLookupFeedback.hidden = false;
      return;
    }

    window.location.href = `track.html?report=${encodeURIComponent(reportNumber)}`;
  // `catch` runs if an error happens in the `try` block, so the page can show feedback.
  } catch {
    reportLookupFeedback.textContent = "Reports could not be read from this browser's local storage.";
    reportLookupFeedback.hidden = false;
  }
});