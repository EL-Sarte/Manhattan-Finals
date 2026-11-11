const reportForm = document.querySelector("#report-form");
const categorySelect = document.querySelector("#report-category");
const detailSelect = document.querySelector("#report-detail");
const descriptionInput = document.querySelector("#incident-description");
const wordCount = document.querySelector("#word-count");
const observedInput = document.querySelector("#date-observed");
const contactInput = document.querySelector("#contact-number");
const emailInput = document.querySelector("#email-address");
const methodSelect = document.querySelector("#contact-method");
const photoInput = document.querySelector("#report-photo");
const reportFormStatus = document.querySelector("#report-form-status");
const reportsStorageKey = "homelinkReports";
const maxPhotoSize = 5 * 1024 * 1024;
const maxWords = 500;

const problemTypes = {
  "Maintenance": ["Plumbing or water leak", "Electrical hazard", "Broken light", "Damaged door or gate", "Elevator", "Other maintenance"],
  "Pests": ["Rats", "Cockroaches", "Termites", "Stray animals", "Other pests"],
  "Documentation": ["Permit or clearance", "Access card or sticker", "Billing or records", "Other document"],
  "Community members": ["Noise", "Parking violation", "Disturbance", "Other concern"]
};

categorySelect.addEventListener("change", () => {
  const types = problemTypes[categorySelect.value] || [];
  detailSelect.replaceChildren();
  detailSelect.append(new Option(types.length ? "Choose one" : "Choose a category first", ""));
  types.forEach((type) => detailSelect.append(new Option(type, type)));
  detailSelect.disabled = types.length === 0;
});

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

descriptionInput.addEventListener("input", () => {
  wordCount.textContent = `${countWords(descriptionInput.value)} of ${maxWords} words. Do not include passwords or private ID numbers.`;
});

const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
const nowValue = now.toISOString().slice(0, 16);
observedInput.max = nowValue;

const presetCategory = new URLSearchParams(window.location.search).get("category");
if (presetCategory && problemTypes[presetCategory]) {
  categorySelect.value = presetCategory;
  categorySelect.dispatchEvent(new Event("change"));
}

reportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  reportFormStatus.hidden = true;

  const cleanNumber = contactInput.value.replace(/[\s-]/g, "");
  contactInput.setCustomValidity(/^(\+63|0)9\d{9}$/.test(cleanNumber) ? "" : "Invalid number");

  emailInput.required = methodSelect.value === "Email";

  const words = countWords(descriptionInput.value);
  descriptionInput.setCustomValidity(words >= 1 && words <= maxWords ? "" : "Invalid description");

  observedInput.setCustomValidity(observedInput.value && observedInput.value > nowValue ? "Future date" : "");

  const photo = photoInput.files[0];
  const photoIsValid = !photo || (["image/png", "image/jpeg"].includes(photo.type) && photo.size <= maxPhotoSize);
  photoInput.setCustomValidity(photoIsValid ? "" : "Invalid photo");

  reportForm.classList.add("was-validated");

  if (!reportForm.checkValidity()) {
    const problemFields = reportForm.querySelectorAll("input:invalid, select:invalid, textarea:invalid");
    const problems = problemFields.length;
    reportFormStatus.textContent = `Please fix ${problems} field${problems === 1 ? "" : "s"} marked with a warning before submitting.`;
    reportFormStatus.hidden = false;
    problemFields[0].focus();
    return;
  }

  const reportNumber = `HL-2026-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const report = {
    reportNumber,
    status: "submitted",
    name: document.querySelector("#reporter-name").value.trim(),
    contact: cleanNumber,
    email: emailInput.value.trim(),
    contactMethod: methodSelect.value,
    needsInterpreter: document.querySelector("#interpreter").checked,
    category: categorySelect.value,
    detail: detailSelect.value,
    description: descriptionInput.value.trim(),
    observedAt: observedInput.value,
    area: document.querySelector("#residence-area").value,
    location: document.querySelector("#location-text").value.trim(),
    photoName: photo ? photo.name : "",
    submittedAt: new Date().toISOString()
  };

  try {
    const savedReports = JSON.parse(localStorage.getItem(reportsStorageKey) || "{}");
    savedReports[reportNumber] = report;
    localStorage.setItem(reportsStorageKey, JSON.stringify(savedReports));
    window.location.href = `confirmation.html?report=${encodeURIComponent(reportNumber)}`;
  } catch {
    reportFormStatus.textContent = "This browser could not save the report. Check your storage settings and try again.";
    reportFormStatus.hidden = false;
  }
});

reportForm.addEventListener("input", (event) => {
  event.target.setCustomValidity("");
});
