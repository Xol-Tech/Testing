// RetroUI.js - Phase 1: Canvas setup, screen buffer, and basic text rendering

console.log("PHASE 1: RetroUI.js loaded.");

// --- Global variables from original script (keep these) ---
const COLS = 80;
const ROWS = 25;
let CHAR_WIDTH;
let CHAR_HEIGHT;
let FONT_SIZE;
const FONT_FAMILY = "monospace";

// This variable is present from the original HTML, but we won't use it yet.
let lslApiUrl = window.lslApiUrl || '';
console.log("PHASE 1: window.lslApiUrl accessed (value won't be used in this test):", lslApiUrl);


// --- Canvas and Context (keep these) ---
const canvas = document.getElementById("retroScreen");
const ctx = canvas ? canvas.getContext("2d") : null;
console.log("PHASE 1: Canvas element:", canvas, "Context:", ctx);


// --- Retro Terminal Core Logic (re-introduce these fully) ---
let screenBuffer = []; // This will hold our characters
let cursorX = 0; // Not used for this static text, but part of structure
let cursorY = 0; // Not used for this static text, but part of structure
let frameCounter = 0; // Used for cursor blink, but terminal not accepting input yet
let currentInputLine = ""; // Not used for this test
let acceptingInput = false; // Set to false to hide cursor for this test

function setCanvasAndCharDimensions() {
    console.log("PHASE 1: setCanvasAndCharDimensions called.");
    if (!canvas) {
        console.error("PHASE 1 ERROR: Canvas element is NULL in setCanvasAndCharDimensions!");
        return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    CHAR_WIDTH = canvas.width / COLS;
    CHAR_HEIGHT = canvas.height / ROWS;
    FONT_SIZE = Math.max(1, CHAR_HEIGHT * 0.8);
    if (ctx) { // Ensure ctx exists before trying to set font
        ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
        ctx.textBaseline = "top"; // Important for text positioning
    }
    console.log("PHASE 1: Canvas dimensions and font set. Width:", canvas.width, "Height:", canvas.height);
}

function initScreenBuffer() {
    console.log("PHASE 1: initScreenBuffer called.");
    for (let y = 0; y < ROWS; y++) {
        screenBuffer[y] = [];
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" }; // Default green
        }
    }
    console.log("PHASE 1: Screen buffer initialized.");
}

// Re-introduce core drawing functions for text
function printChar(char, x, y, color) {
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return; // Bounds check
    screenBuffer[y][x] = { char: char, color: color };
}

function printString(str, x, y, color) {
    for (let i = 0; i < str.length; i++) {
        printChar(str[i], x + i, y, color);
    }
}

function writeLine(text, color) {
    // This simplified version just prints to a fixed line for test
    clearLine(cursorY); // Clear current line
    printString(text, 0, cursorY, color); // Print text at cursor
    cursorY++;
    if (cursorY >= ROWS) {
        scrollScreen();
        cursorY = ROWS - 1;
    }
    cursorX = 0;
}

function scrollScreen() {
    // Shift all lines up
    for (let y = 0; y < ROWS - 1; y++) {
        screenBuffer[y] = screenBuffer[y + 1];
    }
    // Clear the last line
    screenBuffer[ROWS - 1] = [];
    for (let x = 0; x < COLS; x++) {
        screenBuffer[ROWS - 1][x] = { char: " ", color: "#0F0" };
    }
}

function clearLine(y) {
    if (y >= 0 && y < ROWS) {
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" };
        }
    }
}

function clearScreen() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" };
        }
    }
    cursorX = 0;
    cursorY = 0;
}


function renderScreen() {
    if (!ctx || !canvas) { // Make sure context and canvas exist
        console.error("renderScreen: Context or Canvas is null, cannot draw.");
        requestAnimationFrame(renderScreen);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000"; // Black background from CSS should already be here, but drawing it explicitly
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`; // Re-set font in loop, good practice
    ctx.textBaseline = "top";

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = screenBuffer[y][x];
            ctx.fillStyle = cell.color;
            ctx.fillText(cell.char, x * CHAR_WIDTH, y * CHAR_HEIGHT);
        }
    }

    // No cursor drawing for now, as acceptingInput is false
    // if (acceptingInput && frameCounter % 20 < 10) {
    //     ctx.fillStyle = "#0F0";
    //     ctx.fillRect(cursorX * CHAR_WIDTH, cursorY * CHAR_HEIGHT + CHAR_HEIGHT - 2, CHAR_WIDTH, 2);
    // }

    frameCounter++;
    requestAnimationFrame(renderScreen); // Keep the animation loop going
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("PHASE 1: DOMContentLoaded fired. Starting initialization sequence.");
    setCanvasAndCharDimensions();
    initScreenBuffer();

    // Now, put some test text into the buffer
    clearScreen(); // Ensure clean slate
    writeLine("Loading Retro Computer...", "#0F0");
    writeLine("-------------------------", "#0F0");
    writeLine("If you see this text, canvas drawing is working!", "#0F0");
    writeLine("Testing basic terminal rendering completed.", "orange");
    writeLine("Awaiting further instructions...", "gray");

    renderScreen(); // Start the animation loop

    // All LSL API related calls and demo starting functions are OMITTED for this test phase.
    // We want to see if the terminal *itself* renders.

    console.log("PHASE 1: Initialization complete. Terminal rendering should be active.");
});

window.addEventListener("resize", () => {
    console.log("PHASE 1: Window resized event triggered.");
    setCanvasAndCharDimensions(); // Recalculate dimensions on resize
    renderScreen(); // Force a redraw
});

// All other functions (callLSLAPI, startTerminalDemo, displayNextLSLMessage, etc.) are NOT included in this version.
