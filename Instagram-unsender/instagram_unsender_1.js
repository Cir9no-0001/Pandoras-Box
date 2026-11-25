/*
File Name: instagram_unsender_1.js
Author: Stanley Chen
Date: 08/16/2026

Description: Script to unsend an Instagram message (precursor to Katharsis)

How to Use:
1. Open Instagram in your browser and navigate to the conversation containing the message you want to unsend.
2. Open the browser's developer console (usually by pressing F12 or right-clicking and selecting "Inspect").
3. Copy and paste this script into the console.
4. Replace "[PLACEHOLDER FOR YOUR IG USERNAME]" with your actual Instagram username in the script and run.
6. Hover over the message you want to unsend, and the script will automatically find and click the necessary buttons to unsend it.

*/

(async () => {
    const username = "[PLACEHOLDER FOR YOUR IG USERNAME]";

    const optionSelector =
        `svg[aria-label="See more options for message from ${username}"]`;

    let processing = false;
    let completed = false;

    const sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    const findOptionsButton = () => {
        const svg = document.querySelector(optionSelector);

        if (!svg) return null;

        return svg.closest('[role="button"]') || svg.parentElement;
    };

    const findMenuUnsend = () => {
        return [...document.querySelectorAll('[role="button"]')]
            .find(el => {
                const text = el.innerText?.trim();
                return text === "Unsend" || text === "UnsendUnsend";
            });
    };

    const findConfirmationButton = () => {
        return [...document.querySelectorAll("button")]
            .find(el =>
                el.innerText?.trim() === "Unsend"
            );
    };

    const run = async () => {

        if (processing || completed) return;

        const optionsButton = findOptionsButton();

        if (!optionsButton) return;

        processing = true;

        console.log("Found your message.");
        console.log("Opening message options...");

        optionsButton.click();

        await sleep(600);

        const menuUnsend = findMenuUnsend();

        if (!menuUnsend) {
            console.log("Could not find menu Unsend.");
            processing = false;
            return;
        }

        console.log("Found menu Unsend.");
        console.log("Clicking it...");

        menuUnsend.click();

        await sleep(800);

        const confirmation = findConfirmationButton();

        if (!confirmation) {
            console.log(
                "Confirmation button wasn't found."
            );

            processing = false;
            return;
        }

        console.log("Found confirmation button.");
        console.log("Confirming UNSEND...");

        confirmation.click();

        await sleep(1500);

        completed = true;

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("SINGLE UNSEND COMPLETE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━");

        console.log(
            "The test script has stopped."
        );
    };

    window.__igSingleUnsend =
        setInterval(run, 250);

    console.log("Ready.");
    console.log("Hover over ONE message you sent.");

    console.log(
        "To stop manually:"
    );

    console.log(
        "clearInterval(window.__igSingleUnsend)"
    );
})();