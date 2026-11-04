const reportsStorageKey = "suriReports";
const trackSearchForm = document.querySelector("#track-search-form");
const trackNumberInput = document.querySelector("#track-report-number");
const trackNotice = document.querySelector("#track-notice");
const trackReport = document.querySelector("#track-report");
const trackStatus = document.querySelector("#track-status");
const trackTimeline = document.querySelector("#track-timeline");
const trackVerdict = document.querySelector("#track-verdict");
// `fetch` requests the sample data file. Promises let the page continue while it loads.
const demoReportsRequest = fetch("data/reports.json")
  .then((response) => {
    if (!response.ok) {
      // `throw` creates an error that can be handled by the `catch` below.
      throw new Error("Could not load sample reports.");
    }

    return response.json();
  })
  .catch(() => ({}));

const timelineSteps = [
  { title: "Report submitted", copy: "Your report has been saved." },
  { title: "AI analysis", copy: "The submitted content is checked for known or similar reports." },
  { title: "Community review", copy: "Reviewers assess reports that need a human decision." },
  { title: "Verdict published", copy: "The final assessment is shown on this report." }
];

// Read saved report data from this browser and parse its JSON text into an object.
const readReports = () => JSON.parse(localStorage.getItem(reportsStorageKey) || "{}");

// Turn a date value into a readable date, while handling missing or invalid values.
const formatDate = (value) => {
  if (!value) {
    return "Not provided";
  }

  const localDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = localDateMatch
    ? new Date(Number(localDateMatch[1]), Number(localDateMatch[2]) - 1, Number(localDateMatch[3]))
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

const setValue = (selector, value) => {
  // `textContent` displays text without treating it as HTML markup.
  document.querySelector(selector).textContent = value || "Not provided";
};

// Build the progress list by creating HTML elements and adding them to the page.
const buildTimeline = (report) => {
  const currentStep = report.status === "verdict"
    ? 3
    : report.status === "community-review"
      ? 2
      : 1;

  trackTimeline.replaceChildren();

  timelineSteps.forEach((step, index) => {
    const item = document.createElement("li");
    const marker = document.createElement("span");
    const content = document.createElement("div");
    const title = document.createElement("h4");
    const description = document.createElement("p");
    const state = index < currentStep ? "complete" : index === currentStep ? "current" : "upcoming";

    item.className = `track-step is-${state}`;
    marker.className = "track-step-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = state === "complete" ? "✓" : String(index + 1).padStart(2, "0");
    content.className = "track-step-content";
    title.className = "track-step-title";
    title.textContent = step.title;
    description.className = "track-step-copy";
    description.textContent = step.copy;

    if (state === "current") {
      item.setAttribute("aria-current", "step");
    }

    content.append(title, description);
    item.append(marker, content);
    trackTimeline.append(item);
  });
};

const displayReport = (report, isExample = false) => {
  trackNotice.hidden = true;
  trackReport.hidden = false;
  trackNumberInput.value = report.reportNumber;

  setValue("#track-category", report.category);
  setValue("#track-report-heading", report.reportNumber);
  setValue("#track-description", report.description);
  setValue("#track-sender", report.sender);
  setValue("#track-date-received", formatDate(report.receivedDate));
  setValue("#track-location", report.location);
  setValue("#track-submitted", formatDate(report.submittedAt));

  const statusLabel = report.status === "verdict"
    ? "Verdict published"
    : report.status === "community-review"
      ? "Community review"
      : "Pending review";

  trackStatus.textContent = statusLabel;
  // `toggle` adds or removes this CSS class depending on whether a verdict is published.
  trackStatus.classList.toggle("is-verdict", report.status === "verdict");

  const messageRow = document.querySelector("#track-message-row");
  messageRow.hidden = !report.suspiciousText;
  if (report.suspiciousText) {
    setValue("#track-message", report.suspiciousText);
  }

  const screenshotRow = document.querySelector("#track-screenshot-row");
  screenshotRow.hidden = !report.screenshotName;
  if (report.screenshotName) {
    setValue("#track-screenshot", `${report.screenshotName} (image file is not retained in this demo)`);
  }

  buildTimeline(report);
  trackVerdict.hidden = report.status !== "verdict";

  if (report.status === "verdict") {
    setValue("#track-verdict-title", report.verdict || "Verdict published");
    setValue("#track-verdict-copy", report.verdictDetails || "This verdict was added to this report after review.");
  }

  if (isExample) {
    trackNotice.textContent = "Sample report shown for demonstration. This is not a real report or assessment.";
    trackNotice.hidden = false;
  }
};

// `async` allows this function to wait for data with `await` without blocking the page.
const loadReport = async (reportNumber) => {
  trackReport.hidden = true;

  try {
    const normalizedNumber = reportNumber.trim().toUpperCase();
    // Load both data sources together, then use whichever contains this report number.
    const [demoReports, savedReports] = await Promise.all([
      demoReportsRequest,
      Promise.resolve(readReports())
    ]);
    const report = savedReports[normalizedNumber] || demoReports[normalizedNumber];

    if (!report) {
      trackNotice.textContent = "No report with that number was found. Check the number and try again.";
      trackNotice.hidden = false;
      return;
    }

    displayReport(report, Boolean(report.isDemo));
  } catch {
    trackNotice.textContent = "Reports could not be loaded. Check this browser's local storage and try again.";
    trackNotice.hidden = false;
  }
};

trackSearchForm.addEventListener("submit", (event) => {
  // Handle the search ourselves instead of letting the browser reload the page.
  event.preventDefault();
  const reportNumber = trackNumberInput.value.trim().toUpperCase();
  const nextUrl = new URL(window.location.href);
  // Update the address bar's report parameter so this report can be linked or refreshed.
  nextUrl.searchParams.set("report", reportNumber);
  window.history.replaceState(null, "", nextUrl);
  loadReport(reportNumber);
});

// Read query parameters from the page URL, such as ?report=SR-... or ?demo=verdict.
const parameters = new URLSearchParams(window.location.search);
const requestedReport = parameters.get("report") || (
  parameters.get("demo") === "verdict" ? "SR-20261025-1003" : ""
);

if (requestedReport) {
  loadReport(requestedReport);
}