// RetroUI.js - MINIMAL TEST FOR CANVAS DRAWING

// This console.log might not be visible in SL's limited console access,
// but it's good for desktop browser tests.
console.log("TEST: RetroUI.js loaded and attempting basic canvas draw.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("TEST: DOMContentLoaded fired.");

    const canvas = document.getElementById("retroScreen");
    console.log("TEST: Canvas element found:", canvas); // Check if canvas is actually found

    if (canvas) {
        const ctx = canvas.getContext("2d");
        console.log("TEST: Canvas 2D context obtained:", ctx); // Check if context is obtained

        if (ctx) {
            // Set canvas dimensions - crucial! Default is often 300x150 or 0x0.
            // We'll set it to fill the available space.
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            console.log("TEST: Canvas dimensions set to:", canvas.width, "x", canvas.height);

            // Draw a bright, distinct colored rectangle
            ctx.fillStyle = "cyan"; // A very noticeable color
            ctx.fillRect(0, 0, canvas.width, canvas.height / 2); // Fill the top half of the canvas

            console.log("TEST: Drew a cyan rectangle filling top half.");

        } else {
            // If getContext('2d') returns null
            console.error("TEST ERROR: Could not get 2D rendering context for canvas!");
        }
    } else {
        // If getElementById returns null
        console.error("TEST ERROR: Canvas element with ID 'retroScreen' not found in the DOM!");
    }
});

// No other functions, no LSL API calls, no loops, no complex logic.
