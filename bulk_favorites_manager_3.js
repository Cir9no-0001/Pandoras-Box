/*
Favorites Cleaner 3.0.0
File Name: bulk_favorites_manager_3.js
Author: Stanley Chen
Date: 08/16/2026

Description: Final script for managing favorites in bulk. Two staged system this time: 
First it scans and collects all bad favorites, then it deletes them in a second stage 
using AJAX payload deletion. This avoids issues with the page reloading and losing 
track of items/page.

Find your csrfToken: [F12] -> [Network] -> [*.php] -> [Request Headers] -> [X-Csrf-Token]
Or just click [*.php] and copy as cURL then you'll see it as -H ^"x-csrf-token:[YOUR TOKEN]"^

*/

// IIFE for isolation from global and to run it immediately
(function () {
  // Enables strict mode to catch common JavaScript mistakes and prevent accidental globals.
  "use strict";

  // CONFIGURATION
  const CONFIG = {
    csrfToken: "PUT_CSRF_TOKEN_HERE",
    deleteEndpoint: "/includes/remove_fav.php",
    blacklistSelector: "a.remove_fav_link.a_blacklisted",
    nextButtonSelector: 'button.page-link[aria-label="Next"]',
    scanDelay: 1000,
    deleteDelay: 500,
  };

  // Set live state values
  let state = {
    isRunning: false,
    mode: "scan",
    currentPage: 1,
    ids: new Set(),
    observer: null,
    deletingIndex: 0,
  };

  // Prints formatted status messages with the current page number.
  const log = (msg) => {
    console.log(`Page ${state.currentPage}: ${msg}`);
  };

  // Setup sleep function
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Function to scan the page and record IDs of blacklisted items
  function scanPage() {
    let buttons = document.querySelectorAll(CONFIG.blacklistSelector);

    buttons.forEach((btn) => {
      if (btn.id && !state.ids.has(btn.id)) {
        state.ids.add(btn.id);
        btn.style.background = "red";

        log("Saved ID: " + btn.id);
      }
    });

    log("Total IDs: " + state.ids.size);
  }

  // Next page if exists, starts deletion process if last page is reached
  // TO-DO: MAKE IT SO USER CAN STOP SEARCH MANUALLY OR ADD FILTERS
  function goNext() {
    let next = document.querySelector(CONFIG.nextButtonSelector);

    if (!next) {
      log("Finished scanning.");
      console.log("Collected IDs:", [...state.ids]);
      startDeleting();
      return;
    }

    state.currentPage++;
    log("Going next page...");

    next.click();
  }

  // Add delays to scanPage() and goNext() functions above
  async function scanLoop() {
    if (!state.isRunning) return;

    await sleep(CONFIG.scanDelay);
    scanPage();

    await sleep(CONFIG.scanDelay);
    goNext();
  }

  // Sends POST request to server for deletion of item with ID parameter
  async function deleteID(id) {
    let response = await fetch(CONFIG.deleteEndpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

        "X-CSRF-Token": CONFIG.csrfToken,

        "X-Requested-With": "XMLHttpRequest",
      },

      body: "gallery_id=" + encodeURIComponent(id),
    });

    let text = await response.text();

    log(`Deleted ${id}: ${text}`);
  }

  // Evicerate all the items with blacklisted IDs from favorites
  async function deleteLoop() {
    let ids = [...state.ids];
    for (let i = 0; i < ids.length; i++) {
      if (!state.isRunning) return;

      await deleteID(ids[i]);

      await sleep(CONFIG.deleteDelay);
    }

    log("Deletion complete.");

    stopCleaner();
  }

  // Switches the script into deletion mode and begins removing collected favorites.
  function startDeleting() {
    state.mode = "delete";
    log("Starting deletion of " + state.ids.size + " favorites");

    deleteLoop();
  }

  // Watches the webpage for HTML changes and automatically triggers scanning when new page content loads.
  function startObserver() {
    state.observer = new MutationObserver(() => {
      if (!state.isRunning) return;

      if (state.mode === "scan") scanLoop();
    });

    state.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Initializes the cleaner and begins scanning pages.
  function start() {
    if (state.isRunning) {
      console.log("Already running");

      return;
    }

    state.isRunning = true;
    state.mode = "scan";
    state.currentPage = 1;

    log("Cleaner started");

    startObserver();
    scanLoop();
  }

  // Killswitch
  function stop() {
    state.isRunning = false;
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    console.log("Cleaner stopped");

    console.log("Stored IDs:", [...state.ids]);
  }

  // ONLY EXPOSE THESE TO CONSOLE
  window.startCleaner = start;
  window.stopCleaner = stop;

  console.log("Loaded.");
  console.log("Start: startCleaner()");
  console.log("Stop: stopCleaner()");
})();
