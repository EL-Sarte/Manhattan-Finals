const reportsStorageKey = "homelinkReports";
const trackSearchForm = document.querySelector("#track-search-form");
const trackNumberInput = document.querySelector("#track-report-number");
const trackNotice = document.querySelector("#track-notice");
const trackReport = document.querySelector("#track-report");
const trackStatus = document.querySelector("#track-status");
const trackTimeline = document.querySelector("#track-timeline");
const trackOutcome = document.querySelector("#track-outcome");

const demoReportsRequest = fetch("data/reports.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not load sample reports.");
    }
    return response.json();
  })
  .catch(() => ({}));

const timelineSteps = [
  { title: "Submitted", copy: "Your report was received." },
  { title: "Under review", copy: "An administrator checks the details." },
  { title: "In progress", copy: "The issue is assigned and being handled." },
  { title: "Resolved", copy: "The issue is fixed and the report is closed." }
];

const statusInfo = {
  "submitted": { label: "Submitted", step: 0, tone: "" },
  "under-review": { label: "Under review", step: 1, tone: "" },
  "needs-info": { label: "Needs more information", step: 1, tone: "is-warn" },
  "in-progress": { label: "In progress", step: 2, tone: "" },
  "resolved": { label: "Resolved", step: 3, tone: "is-verdict" },
  "rejected": { label: "Rejected", step: 1, tone: "is-bad" },
  "duplicate": { label: "Duplicate", step: 1, tone: "is-warn" }
};

const readReports = () => JSON.parse(localStorage.getItem(reportsStorageKey) || "{}");

const formatDate = (value, withTime = false) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    return "Not provided";
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", ...(withTime ? { timeStyle: "short" } : {}) }).format(date);
};

const setValue = (selector, value) => {
  document.querySelector(selector).textContent = value || "Not provided";
};

const buildTimeline = (info) => {
  trackTimeline.replaceChildren();
  timelineSteps.forEach((step, index) => {
    const item = document.createElement("li");
    const marker = document.createElement("span");
    const title = document.createElement("h4");
    const description = document.createElement("p");
    const finished = info.step === 3 && index === 3;
    const state = finished || index < info.step ? "complete" : index === info.step ? "current" : "upcoming";

    item.className = `track-step is-${state}`;
    marker.className = "track-step-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = state === "complete" ? "✓" : String(index + 1);
    title.className = "track-step-title";
    title.textContent = `${step.title}${state === "complete" ? " (done)" : state === "current" ? " (current step)" : ""}`;
    description.className = "track-step-copy";
    description.textContent = step.copy;
    if (state === "current") {
      item.setAttribute("aria-current", "step");
    }
    item.append(marker, title, description);
    trackTimeline.append(item);
  });
};

const outcomeFor = (report) => {
  if (report.status === "resolved") {
    return ["Resolution", "Issue resolved", report.note || "This report has been resolved."];
  }
  if (report.status === "rejected") {
    return ["Reason", "Report rejected", report.note || "The administrators could not act on this report. The record is kept for auditing."];
  }
  if (report.status === "needs-info") {
    return ["Action needed", "More information required", report.note || "Please send the missing details to the administrator."];
  }
  if (report.status === "duplicate") {
    return ["Linked report", "Already being handled", report.note || "This issue was reported earlier and is already being handled."];
  }
  return null;
};

const displayReport = (report, isDemo) => {
  const info = statusInfo[report.status] || statusInfo.submitted;
  trackNotice.hidden = true;
  trackReport.hidden = false;
  trackNumberInput.value = report.reportNumber;

  setValue("#track-category", report.category);
  setValue("#track-report-heading", report.reportNumber);
  setValue("#track-description", report.description);
  setValue("#track-detail", report.detail);
  setValue("#track-location", [report.area, report.location].filter(Boolean).join(", "));
  setValue("#track-observed", formatDate(report.observedAt, true));
  setValue("#track-submitted", formatDate(report.submittedAt));
  setValue("#track-method", report.contactMethod);

  trackStatus.textContent = info.label;
  trackStatus.className = `track-status ${info.tone}`.trim();

  const hasPhoto = Boolean(report.photoName);
  document.querySelector("#track-photo-label").hidden = !hasPhoto;
  document.querySelector("#track-photo").hidden = !hasPhoto;
  if (hasPhoto) {
    setValue("#track-photo", `${report.photoName} (image file is not kept in this demo)`);
  }

  buildTimeline(info);

  const outcome = outcomeFor(report);
  trackOutcome.hidden = !outcome;
  if (outcome) {
    setValue("#track-outcome-kicker", outcome[0]);
    setValue("#track-outcome-title", outcome[1]);
    setValue("#track-outcome-copy", outcome[2]);
  }

  if (isDemo) {
    trackNotice.textContent = "Sample report shown for demonstration. This is not a real report.";
    trackNotice.hidden = false;
  }
};

const loadReport = async (reportNumber) => {
  trackReport.hidden = true;
  const normalized = reportNumber.trim().toUpperCase();
  try {
    const demoReports = await demoReportsRequest;
    let saved = {};
    try {
      saved = readReports();
    } catch {
      saved = {};
    }
    const report = saved[normalized] || demoReports[normalized];
    if (!report) {
      trackNotice.textContent = `We could not find ${normalized || "that number"}. Check your reference number and try again.`;
      trackNotice.hidden = false;
      return;
    }
    displayReport(report, Boolean(report.isDemo));
  } catch {
    trackNotice.textContent = "Reports could not be loaded. Try again.";
    trackNotice.hidden = false;
  }
};

trackSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const reportNumber = trackNumberInput.value.trim().toUpperCase();
  if (!reportNumber) {
    trackNotice.textContent = "Enter your reference number, like HL-2026-001.";
    trackNotice.hidden = false;
    trackNumberInput.focus();
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("report", reportNumber);
  window.history.replaceState(null, "", nextUrl);
  loadReport(reportNumber);
});

const requestedReport = new URLSearchParams(window.location.search).get("report");
if (requestedReport) {
  loadReport(requestedReport);
}
