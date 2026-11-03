/*
Program Name: Favorites Cleaner 1.0.0
Author: Stanley Chen
Date: 02/17/2025

Description: Legacy one-page favorites cleaner. Detects blacklisted favorites on the currently loaded gallery page, 
highlights matching thumbnails, and removes items through simulated button clicks.

*/

const buttons = document.querySelectorAll(
  'a.remove_fav_link.a_blacklisted, a[id*="remove_fav_link"].a_blacklisted',
);

if (buttons.length === 0) {
  console.log("No blacklisted items found on this page.");
} else {
  console.log(`Found ${buttons.length} blacklisted items. Deleting...`);

  buttons.forEach((btn) => {
    const card = btn.closest(".thumb");

    if (card) {
      card.style.backgroundColor = "red";
    }

    btn.click();
  });

  console.log(
    "Done! Scroll down to load more blacklisted items and run again if needed.",
  );
}
