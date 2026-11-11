const lookupForm = document.querySelector("#report-lookup-form");
const lookupInput = document.querySelector("#report-number");
const lookupFeedback = document.querySelector("#report-lookup-feedback");

lookupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const reportNumber = lookupInput.value.trim().toUpperCase();

  if (!/^HL-\d{4}-[A-Z0-9]{3,5}$/.test(reportNumber)) {
    lookupFeedback.textContent = "Enter a reference number like HL-2026-001.";
    lookupFeedback.hidden = false;
    lookupInput.focus();
    return;
  }

  window.location.href = `track.html?report=${encodeURIComponent(reportNumber)}`;
});
