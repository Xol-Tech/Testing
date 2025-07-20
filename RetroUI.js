// RetroUI.js - Test 4: Simple Fixed Font FillText Test
// This script should display a black background with two lines of text:
// "HELLO WORLD" in white, and "MONOSPACE TEST" in lime green.

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("retroScreen");
    // Ensure canvas and its 2D context are available
    if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            // Set canvas dimensions to fill the available space
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // 1. Clear the canvas with a black background
            ctx.fillStyle = "#000"; // Black color
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill entire canvas

            // 2. Draw the first line of text
            // Use a very common, standard sans-serif font and a fixed, clearly visible size
            ctx.font = "24px Arial"; // 24 pixels high, Arial font
            ctx.fillStyle = "white"; // White text for good contrast on black
            ctx.textBaseline = "top"; // Position text from its top edge

            // Draw "HELLO WORLD" at coordinates (50, 50)
            ctx.fillText("HELLO WORLD", 50, 50);

            // 3. Draw the second line of text
            // Use a common monospace font and a larger fixed size
            ctx.font = "40px 'Courier New', monospace"; // 40 pixels high, Courier New (or any generic monospace)
            ctx.fillStyle = "lime"; // Lime green text for good contrast
            ctx.textBaseline = "top"; // Keep text baseline consistent

            // Draw "MONOSPACE TEST" at coordinates (50, 100), below the first line
            ctx.fillText("MONOSPACE TEST", 50, 100);
        } else {
            // This error would indicate getContext('2d') failed
            // console.error("Canvas 2D context not available.");
        }
    } else {
        // This error would indicate getElementById('retroScreen') failed
        // console.error("Canvas element with ID 'retroScreen' not found.");
    }
});

// No animation loop, LSL API interaction, or other complex logic for this isolated test.
// We are only testing static text drawing.
