/* ==========================================================================
   Drug Interaction Checker - Frontend JavaScript (MVP)
   Pure Vanilla JS - No external libraries, frameworks, or APIs required.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Fictional Sample Medicine List
  const SAMPLE_MEDICINES = [
    "Demo Medicine A",
    "Demo Medicine B",
    "Demo Medicine C",
    "Demo Medicine D",
    "Demo Medicine E"
  ];

  // 2. Fictional Demo Interaction Data (for Demo Medicine A + Demo Medicine B)
  const DEMO_INTERACTION_RECORD = {
    pair: ["Demo Medicine A", "Demo Medicine B"],
    status: "Fictional Demo Record",
    classification: "Demo Only",
    description: "This is fictional sample information used to demonstrate the frontend.",
    source: "Fictional project test data"
  };

  // 3. DOM Element References
  const heroCheckBtn = document.getElementById("hero-check-btn");
  const navCtaButtons = document.querySelectorAll("[data-scroll-target]");
  const checkSection = document.getElementById("check-interaction");

  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  const interactionForm = document.getElementById("interaction-form");
  const medicineOneInput = document.getElementById("medicine-one-input");
  const medicineTwoInput = document.getElementById("medicine-two-input");
  const medicineOneDropdown = document.getElementById("medicine-one-dropdown");
  const medicineTwoDropdown = document.getElementById("medicine-two-dropdown");
  const clearOneBtn = document.getElementById("clear-one-btn");
  const clearTwoBtn = document.getElementById("clear-two-btn");
  const resetBtn = document.getElementById("reset-btn");

  const validationMessage = document.getElementById("validation-message");
  const validationText = document.getElementById("validation-text");
  const resultContainer = document.getElementById("result-container");
  const resultCard = document.getElementById("result-card");

  // Application state for selected medicines
  const state = {
    firstMedicine: "",
    secondMedicine: ""
  };

  // Track active keyboard index in dropdowns
  const activeOptionIndex = {
    one: -1,
    two: -1
  };

  // ========================================================================
  // Helper Functions
  // ========================================================================

  // Scroll smoothly to the Medicine Selection section
  function scrollToSelectionSection() {
    if (checkSection) {
      checkSection.scrollIntoView({ behavior: "smooth", block: "start" });
      // Focus the first input slightly after scroll starts
      setTimeout(function () {
        medicineOneInput.focus({ preventScroll: true });
      }, 350);
    }
  }

  // Show a friendly validation message
  function showValidationError(message) {
    validationText.textContent = message;
    validationMessage.hidden = false;
  }

  // Hide the validation message
  function hideValidationError() {
    validationText.textContent = "";
    validationMessage.hidden = true;
  }

  // Normalize typed input against the sample list (case-insensitive)
  function findExactMedicine(value) {
    const trimmed = value.trim().toLowerCase();
    return (
      SAMPLE_MEDICINES.find(function (med) {
        return med.toLowerCase() === trimmed;
      }) || ""
    );
  }

  // Show or hide the clear ('x') button inside an input
  function updateClearButtons() {
    clearOneBtn.hidden = medicineOneInput.value.trim() === "";
    clearTwoBtn.hidden = medicineTwoInput.value.trim() === "";
  }

  // Escape HTML safely before inserting text into result markup
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ========================================================================
  // Dropdown Search & Suggestion Logic
  // ========================================================================

  function closeDropdown(slot) {
    const isFirst = slot === "one";
    const input = isFirst ? medicineOneInput : medicineTwoInput;
    const dropdown = isFirst ? medicineOneDropdown : medicineTwoDropdown;

    dropdown.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeOptionIndex[slot] = -1;
  }

  function closeAllDropdowns() {
    closeDropdown("one");
    closeDropdown("two");
  }

  function renderDropdown(slot) {
    const isFirst = slot === "one";
    const input = isFirst ? medicineOneInput : medicineTwoInput;
    const dropdown = isFirst ? medicineOneDropdown : medicineTwoDropdown;
    const otherSelected = isFirst ? state.secondMedicine : state.firstMedicine;

    const query = input.value.trim().toLowerCase();

    // Filter medicines matching the user's search text
    const matches = SAMPLE_MEDICINES.filter(function (medicine) {
      return medicine.toLowerCase().includes(query);
    });

    dropdown.innerHTML = "";
    activeOptionIndex[slot] = -1;

    if (matches.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "suggestion-empty";
      emptyItem.textContent = "No matching sample medicine found.";
      dropdown.appendChild(emptyItem);
    } else {
      matches.forEach(function (medicine, index) {
        const li = document.createElement("li");
        li.className = "suggestion-item";
        li.setAttribute("role", "option");
        li.dataset.value = medicine;
        li.dataset.index = String(index);

        const isAlreadyUsedInOther =
          otherSelected !== "" && otherSelected.toLowerCase() === medicine.toLowerCase();

        const nameSpan = document.createElement("span");
        nameSpan.textContent = medicine;
        li.appendChild(nameSpan);

        if (isAlreadyUsedInOther) {
          li.classList.add("is-disabled");
          li.setAttribute("aria-disabled", "true");

          const hintSpan = document.createElement("span");
          hintSpan.className = "suggestion-hint";
          hintSpan.textContent = "Already selected";
          li.appendChild(hintSpan);
        }

        // Prevent input blur before click finishes
        li.addEventListener("mousedown", function (event) {
          event.preventDefault();
        });

        li.addEventListener("click", function () {
          selectMedicine(slot, medicine);
        });

        dropdown.appendChild(li);
      });
    }

    dropdown.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function selectMedicine(slot, medicineName) {
    const isFirst = slot === "one";
    const input = isFirst ? medicineOneInput : medicineTwoInput;
    const otherMedicine = isFirst ? state.secondMedicine : state.firstMedicine;

    // Prevent selecting the same medicine twice
    if (otherMedicine && otherMedicine.toLowerCase() === medicineName.toLowerCase()) {
      showValidationError(
        "Please select two different medicines. \"" +
          medicineName +
          "\" is already chosen in the other field."
      );
      closeDropdown(slot);
      return;
    }

    if (isFirst) {
      state.firstMedicine = medicineName;
    } else {
      state.secondMedicine = medicineName;
    }

    input.value = medicineName;
    updateClearButtons();
    hideValidationError();
    closeDropdown(slot);
  }

  // Handle typing, focusing, and keyboard navigation on a search input
  function setupMedicineInput(slot) {
    const isFirst = slot === "one";
    const input = isFirst ? medicineOneInput : medicineTwoInput;
    const dropdown = isFirst ? medicineOneDropdown : medicineTwoDropdown;
    const clearBtn = isFirst ? clearOneBtn : clearTwoBtn;

    input.addEventListener("focus", function () {
      const otherSlot = isFirst ? "two" : "one";
      closeDropdown(otherSlot);
      renderDropdown(slot);
    });

    input.addEventListener("input", function () {
      // Sync typed text with state if it exactly matches a valid medicine
      const exact = findExactMedicine(input.value);
      if (isFirst) {
        state.firstMedicine = exact;
      } else {
        state.secondMedicine = exact;
      }

      updateClearButtons();
      hideValidationError();
      renderDropdown(slot);
    });

    input.addEventListener("keydown", function (event) {
      const items = dropdown.querySelectorAll(".suggestion-item");
      if (dropdown.hidden && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        renderDropdown(slot);
        return;
      }

      if (items.length === 0) {
        if (event.key === "Escape") {
          closeDropdown(slot);
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeOptionIndex[slot] = (activeOptionIndex[slot] + 1) % items.length;
        highlightOption(items, activeOptionIndex[slot]);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeOptionIndex[slot] =
          activeOptionIndex[slot] <= 0 ? items.length - 1 : activeOptionIndex[slot] - 1;
        highlightOption(items, activeOptionIndex[slot]);
      } else if (event.key === "Enter" && !dropdown.hidden && activeOptionIndex[slot] >= 0) {
        event.preventDefault();
        const chosen = items[activeOptionIndex[slot]];
        if (chosen && chosen.dataset.value) {
          selectMedicine(slot, chosen.dataset.value);
        }
      } else if (event.key === "Escape") {
        closeDropdown(slot);
      }
    });

    clearBtn.addEventListener("click", function () {
      input.value = "";
      if (isFirst) {
        state.firstMedicine = "";
      } else {
        state.secondMedicine = "";
      }
      updateClearButtons();
      hideValidationError();
      renderDropdown(slot);
      input.focus();
    });
  }

  function highlightOption(items, targetIndex) {
    items.forEach(function (item, idx) {
      if (idx === targetIndex) {
        item.classList.add("is-active");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("is-active");
      }
    });
  }

  // ========================================================================
  // Interaction Checking & Result Rendering
  // ========================================================================

  function isDemoMatchPair(med1, med2) {
    const pair = [med1.toLowerCase(), med2.toLowerCase()];
    return (
      pair.includes(DEMO_INTERACTION_RECORD.pair[0].toLowerCase()) &&
      pair.includes(DEMO_INTERACTION_RECORD.pair[1].toLowerCase())
    );
  }

  function renderResult(med1, med2) {
    const safeMed1 = escapeHtml(med1);
    const safeMed2 = escapeHtml(med2);

    if (isDemoMatchPair(med1, med2)) {
      resultCard.innerHTML =
        '<div class="result-header">' +
        '  <div>' +
        '    <p class="result-kicker">Selected Medicines</p>' +
        '    <h3 class="result-pair-title">' + safeMed1 + " + " + safeMed2 + "</h3>" +
        "  </div>" +
        '  <div class="result-status-label">' +
        '    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '      <circle cx="12" cy="12" r="10" />' +
        '      <line x1="12" y1="16" x2="12" y2="12" />' +
        '      <line x1="12" y1="8" x2="12.01" y2="8" />' +
        "    </svg>" +
        "    <span>" + escapeHtml(DEMO_INTERACTION_RECORD.status) + "</span>" +
        "  </div>" +
        "</div>" +
        '<div class="result-details-grid">' +
        '  <div class="result-detail-item">' +
        '    <p class="detail-label">Status</p>' +
        '    <p class="detail-value">' + escapeHtml(DEMO_INTERACTION_RECORD.status) + "</p>" +
        "  </div>" +
        '  <div class="result-detail-item">' +
        '    <p class="detail-label">Classification</p>' +
        '    <p class="detail-value">' + escapeHtml(DEMO_INTERACTION_RECORD.classification) + "</p>" +
        "  </div>" +
        '  <div class="result-detail-item">' +
        '    <p class="detail-label">Source</p>' +
        '    <p class="detail-value">' + escapeHtml(DEMO_INTERACTION_RECORD.source) + "</p>" +
        "  </div>" +
        "</div>" +
        '<div class="result-description-block">' +
        "  <h4>Description</h4>" +
        "  <p>" + escapeHtml(DEMO_INTERACTION_RECORD.description) + "</p>" +
        "</div>";
    } else {
      resultCard.innerHTML =
        '<div class="result-header">' +
        '  <div>' +
        '    <p class="result-kicker">Selected Medicines</p>' +
        '    <h3 class="result-pair-title">' + safeMed1 + " + " + safeMed2 + "</h3>" +
        "  </div>" +
        '  <div class="result-status-label is-neutral">' +
        '    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />' +
        '      <line x1="12" y1="9" x2="12" y2="13" />' +
        '      <line x1="12" y1="17" x2="12.01" y2="17" />' +
        "    </svg>" +
        "    <span>No Matching Sample Record</span>" +
        "  </div>" +
        "</div>" +
        '<div class="result-no-match-box">' +
        '  <p class="result-no-match-heading">No matching sample record found in this demonstration.</p>' +
        '  <p class="result-no-match-note">' +
        "    Important: A missing record does not mean this medicine combination is safe. " +
        "    This student demonstration only contains one fictional test pair (Demo Medicine A and Demo Medicine B) and does not provide real medical data. Always consult a qualified doctor or pharmacist." +
        "  </p>" +
        "</div>";
    }

    resultContainer.hidden = false;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    closeAllDropdowns();

    const firstCandidate = findExactMedicine(medicineOneInput.value);
    const secondCandidate = findExactMedicine(medicineTwoInput.value);

    // 1. Validate that both medicines are entered/selected
    if (medicineOneInput.value.trim() === "" || medicineTwoInput.value.trim() === "") {
      showValidationError("Please select both the first and second medicines before checking.");
      return;
    }

    // 2. Validate that inputs match valid sample medicines
    if (!firstCandidate) {
      showValidationError("Please choose a valid sample medicine from the First Medicine list.");
      medicineOneInput.focus();
      return;
    }

    if (!secondCandidate) {
      showValidationError("Please choose a valid sample medicine from the Second Medicine list.");
      medicineTwoInput.focus();
      return;
    }

    // 3. Prevent checking the same medicine twice
    if (firstCandidate.toLowerCase() === secondCandidate.toLowerCase()) {
      showValidationError("Please select two different medicines. You cannot compare the same medicine with itself.");
      return;
    }

    // Store canonical names and display result
    state.firstMedicine = firstCandidate;
    state.secondMedicine = secondCandidate;
    medicineOneInput.value = firstCandidate;
    medicineTwoInput.value = secondCandidate;
    updateClearButtons();

    hideValidationError();
    renderResult(firstCandidate, secondCandidate);
  }

  function handleReset() {
    state.firstMedicine = "";
    state.secondMedicine = "";

    medicineOneInput.value = "";
    medicineTwoInput.value = "";
    updateClearButtons();

    closeAllDropdowns();
    hideValidationError();

    resultCard.innerHTML = "";
    resultContainer.hidden = true;
  }

  // ========================================================================
  // Event Listeners Initialization
  // ========================================================================

  setupMedicineInput("one");
  setupMedicineInput("two");

  interactionForm.addEventListener("submit", handleFormSubmit);
  resetBtn.addEventListener("click", handleReset);

  // Scroll to Medicine Selection when Check Now is clicked
  if (heroCheckBtn) {
    heroCheckBtn.addEventListener("click", scrollToSelectionSection);
  }

  navCtaButtons.forEach(function (button) {
    button.addEventListener("click", scrollToSelectionSection);
  });

  // Close dropdowns when clicking outside comboboxes
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".combobox-wrapper")) {
      closeAllDropdowns();
    }
  });

  // Mobile Menu Toggle
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", function () {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", String(!isExpanded));
      mobileNav.hidden = isExpanded;
    });

    mobileNavLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }
});
