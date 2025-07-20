// RetroUI.js - Test 3: Cyan Background + Red Square + Green Circle
// This should show a cyan screen with a red square and a green circle.
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("retroScreen");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            ctx.fillStyle = "cyan";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "red";
            ctx.fillRect(50, 50, 100, 100);

            // Draw a green circle
            ctx.fillStyle = "green";
            ctx.beginPath(); // Start a new path
            ctx.arc(canvas.width - 60, 60, 50, 0, Math.PI * 2); // Circle at top-right
            ctx.fill(); // Fill the path
        }
    }
});
