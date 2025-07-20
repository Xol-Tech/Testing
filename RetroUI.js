// RetroUI.js (Add these console.logs strategically)

console.log("RetroUI.js: Script file started loading."); // Add at the very top

const canvas = document.getElementById("retroScreen");
console.log("RetroUI.js: Canvas element found:", canvas); // Check if canvas is found (should not be null)
const ctx = canvas ? canvas.getContext("2d") : null;
console.log("RetroUI.js: Canvas context obtained:", ctx); // Check if context is obtained (should not be null)

const COLS = 80;
const ROWS = 25;

let CHAR_WIDTH;
let CHAR_HEIGHT;
let FONT_SIZE;
const FONT_FAMILY = "monospace";

let lslApiUrl = window.lslApiUrl || '';

// --- Communication setup for LSL API calls ---
// ... (rest of callLSLAPI function) ...

// --- Retro Terminal Core Logic ---
let screenBuffer = [];
let cursorX = 0;
let cursorY = 0;
let frameCounter = 0;
let currentInputLine = "";
let acceptingInput = false;

function setCanvasAndCharDimensions() {
    console.log("setCanvasAndCharDimensions: Function started.");
    if (!canvas) {
        console.error("setCanvasAndCharDimensions: Canvas element is NULL!");
        return; // Exit if canvas is not found
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    CHAR_WIDTH = canvas.width / COLS;
    CHAR_HEIGHT = canvas.height / ROWS;
    FONT_SIZE = Math.max(1, CHAR_HEIGHT * 0.8);
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    console.log("setCanvasAndCharDimensions: Canvas dimensions set.");
    // No call to renderScreen() here for now, it's called from DOMContentLoaded
}

function initScreenBuffer() {
    console.log("initScreenBuffer: Initializing screen buffer.");
    for (let y = 0; y < ROWS; y++) {
        screenBuffer[y] = [];
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" };
        }
    }
    console.log("initScreenBuffer: Screen buffer initialized.");
}

function renderScreen() {
    // This function runs in a loop, so only log sparingly or for errors
    if (!ctx) {
        console.error("renderScreen: Canvas context is NULL! Cannot draw.");
        requestAnimationFrame(renderScreen); // Keep trying to animate even if error
        return;
    }
    // console.log("renderScreen: Drawing frame."); // Avoid logging every frame, too noisy

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = "top";

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = screenBuffer[y][x];
            ctx.fillStyle = cell.color;
            ctx.fillText(cell.char, x * CHAR_WIDTH, y * CHAR_HEIGHT);
        }
    }

    // Draw cursor
    if (acceptingInput && frameCounter % 20 < 10) {
        ctx.fillStyle = "#0F0";
        ctx.fillRect(cursorX * CHAR_WIDTH, cursorY * CHAR_HEIGHT + CHAR_HEIGHT - 2, CHAR_WIDTH, 2);
    }

    frameCounter++;
    requestAnimationFrame(renderScreen);
}

// ... (rest of writeLine, scrollScreen, clearScreen, printString, printChar) ...

// --- Terminal Demo & Input Handling ---
// ... (all the async functions and event listener) ...

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: Event fired. Starting initialization sequence.");
    setCanvasAndCharDimensions();
    initScreenBuffer();
    renderScreen(); // Start the animation loop

    if (lslApiUrl) {
        console.log("DOMContentLoaded: LSL API URL received:", lslApiUrl);
        startTerminalDemo(); // Start the terminal demo once LSL URL is known
    } else {
        console.error("DOMContentLoaded: LSL API URL not found in window.lslApiUrl. Check your LSL script's G_HTML_TEMPLATE injection.");
        writeLine("Error: LSL API URL not found.", "red"); // This might not show if drawing not working
        writeLine("Check browser console for details.", "red");
    }
});

window.addEventListener("resize", () => {
    console.log("Window resized. Recalculating dimensions.");
    setCanvasAndCharDimensions();
});
