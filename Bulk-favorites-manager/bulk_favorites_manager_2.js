/*
Program Name: Favorites Cleaner 2.0
Author: Stanley Chen
Date: 09/28/2025

Description: Extension of the legacy favorites cleaner.
*/

// Disable the confirmation popups
window.confirm = () => true;

// Setup sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Main cleaning function
async function autoCleanFavorites() {
  console.log("Starting Auto-Clean Process...");
  let currentPage = 1;

  while (true) {
    console.log(`\nProcessing Page: ${currentPage}`);

    const buttons = document.querySelectorAll(
      "a.remove_fav_link.a_blacklisted",
    );

    // Do nothing if clean or remove blacklisted items and reset counter
    if (buttons.length === 0) {
      console.log("Page is clean.");
    } else {
      console.log(`Found ${buttons.length} blacklisted items. Deleting...`);
      buttons.forEach((btn) => {
        const card = btn.closest(".thumb");
        if (card) {
          card.style.backgroundColor = "red";
        }
        btn.click();
      });

      currentPage = 1;
      await sleep(1750);
      continue;
    }

    // Go to next page if exists
    const nextBtn = document.querySelector(
      'button.page-link[aria-label="Next"]',
    );
    if (!nextBtn) {
      console.log("No 'Next' button found. Process Complete!");

      break;
    }
    console.log("Moving to next page...");
    nextBtn.click();
    currentPage++;

    await sleep(2000);
  }
}

autoCleanFavorites();
