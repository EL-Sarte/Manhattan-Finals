const reportsStorageKey = "homelinkReports";
const reportNumber = (new URLSearchParams(window.location.search).get("report") || "").toUpperCase();
const receipt = document.querySelector("#confirm-card");
const emptyState = document.querySelector("#confirm-empty");

let report = null;
try {
  report = JSON.parse(localStorage.getItem(reportsStorageKey) || "{}")[reportNumber];
} catch {
  report = null;
}

if (report) {
  document.querySelector("#confirm-number").textContent = report.reportNumber;
  document.querySelector("#confirm-category").textContent = report.detail ? `${report.category}: ${report.detail}` : report.category;
  document.querySelector("#confirm-location").textContent = `${report.area}, ${report.location}`;
  document.querySelector("#confirm-method").textContent = report.contactMethod;
  document.querySelector("#confirm-method-text").textContent = report.contactMethod === "Visit the HOA office"
    ? "asking you to visit the HOA office"
    : report.contactMethod.toLowerCase();
  document.querySelector("#confirm-track").href = `track.html?report=${encodeURIComponent(report.reportNumber)}`;
  receipt.hidden = false;
} else {
  emptyState.hidden = false;
}
