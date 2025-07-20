// RetroUI.js - Test 5: Core Terminal Rendering (Dynamic Dimensions + screenBuffer Text)
// This script aims to display a functional-looking terminal with static, pre-defined messages.

// --- Global variables (from your original script) ---
const COLS = 80;
const ROWS = 25;
let CHAR_WIDTH;
let CHAR_HEIGHT;
let FONT_SIZE;
const FONT_FAMILY = "monospace"; // We know 'monospace' works from Test 4

// This variable is provided by the LSL script, but will NOT be used in this test.
let lslApiUrl = window.lslApiUrl || '';

// --- Canvas and Context ---
const canvas = document.getElementById("retroScreen");
const ctx = canvas ? canvas.getContext("2d") : null;

// --- Retro Terminal Core Logic (from your original script - re-introduced) ---
let screenBuffer = []; // This array will hold the characters to display
let cursorX = 0; // Current cursor column
let cursorY = 0; // Current cursor row
let frameCounter = 0; // Used for cursor blink, but not actively displaying cursor yet
let acceptingInput = false; // Set to false to ensure no cursor is drawn for this test

// Function to calculate and set canvas and character dimensions
function setCanvasAndCharDimensions() {
    if (!canvas || !ctx) return; // Exit if canvas or context isn't ready

    // Set canvas dimensions to match the window (prim media size)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Calculate individual character cell dimensions
    CHAR_WIDTH = canvas.width / COLS;
    CHAR_HEIGHT = canvas.height / ROWS;

    // Calculate font size, ensuring it's at least 1px to be visible
    FONT_SIZE = Math.max(1, CHAR_HEIGHT * 0.8);

    // Apply the font settings to the canvas context
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = "top"; // Important for consistent text positioning
}

// Function to initialize the screen buffer with empty spaces
function initScreenBuffer() {
    for (let y = 0; y < ROWS; y++) {
        screenBuffer[y] = []; // Create a row
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" }; // Fill with default green spaces
        }
    }
}

// Function to print a single character to the buffer
function printChar(char, x, y, color) {
    // Basic bounds check
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return;
    screenBuffer[y][x] = { char: char, color: color };
}

// Function to print a string to the buffer
function printString(str, x, y, color) {
    for (let i = 0; i < str.length; i++) {
        printChar(str[i], x + i, y, color);
    }
}

// Function to write a full line of text, handling scrolling
function writeLine(text, color) {
    // Scroll the screen up if the cursor is at the last row
    if (cursorY >= ROWS) {
        scrollScreen();
        cursorY = ROWS - 1; // Move cursor to the new last row after scrolling
    }
    clearLine(cursorY); // Clear the line before writing new text
    printString(text, 0, cursorY, color); // Print text starting at column 0
    cursorY++; // Move cursor to the next line
    cursorX = 0; // Reset cursor column
}

// Function to scroll the entire screen up by one line
function scrollScreen() {
    // Shift all lines up (line y takes content of line y+1)
    for (let y = 0; y < ROWS - 1; y++) {
        screenBuffer[y] = screenBuffer[y + 1];
    }
    // Clear the last line to create a new empty line at the bottom
    screenBuffer[ROWS - 1] = [];
    for (let x = 0; x < COLS; x++) {
        screenBuffer[ROWS - 1][x] = { char: " ", color: "#0F0" };
    }
}

// Function to clear a specific line in the buffer
function clearLine(y) {
    if (y >= 0 && y < ROWS) {
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" };
        }
    }
}

// Function to clear the entire screen buffer and reset cursor
function clearScreen() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" };
        }
    }
    cursorX = 0;
    cursorY = 0;
}

// The main rendering loop, called repeatedly by requestAnimationFrame
function renderScreen() {
    if (!ctx || !canvas) {
        // If canvas/context aren't ready, reschedule the render and exit
        requestAnimationFrame(renderScreen);
        return;
    }

    // 1. Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000"; // Ensure background is black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Re-apply font settings (important as context state can be reset or lost)
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = "top";

    // 3. Draw each character from the screen buffer
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = screenBuffer[y][x];
            // Only draw if the cell contains a character (not just a space)
            if (cell && cell.char !== " ") {
                ctx.fillStyle = cell.color; // Set character color
                // Draw text at calculated position based on cell grid
                ctx.fillText(cell.char, x * CHAR_WIDTH, y * CHAR_HEIGHT);
            }
        }
    }

    // (Cursor drawing logic commented out for this test)
    // if (acceptingInput && frameCounter % 20 < 10) {
    //     ctx.fillStyle = "#0F0";
    //     ctx.fillRect(cursorX * CHAR_WIDTH, cursorY * CHAR_HEIGHT + CHAR_HEIGHT - 2, CHAR_WIDTH, 2);
    // }

    frameCounter++; // Increment frame counter
    requestAnimationFrame(renderScreen); // Request next frame for continuous animation
}

// --- Initialization when DOM is ready ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial setup steps
    setCanvasAndCharDimensions(); // Calculate and set dimensions/font
    initScreenBuffer(); // Initialize the empty screen buffer

    // Populate the screenBuffer with static test messages
    clearScreen(); // Ensure a clean slate
    writeLine("Retro Computer v1.0 Booting...", "#0F0");
    writeLine("-----------------------------", "#0F0");
    writeLine("Second Life Viewer Test Mode Active.", "yellow");
    writeLine("Canvas dimensions: " + canvas.width + "x" + canvas.height, "white"); // Display actual canvas size
    writeLine("Char dimensions: " + CHAR_WIDTH.toFixed(2) + "x" + CHAR_HEIGHT.toFixed(2), "white"); // Display calculated char size
    writeLine("Font size: " + FONT_SIZE.toFixed(2) + "px", "white"); // Display calculated font size
    writeLine("Text rendering confirmed!", "lime");
    writeLine("If you see this, the core terminal works!", "cyan");
    writeLine("Awaiting LSL API integration...", "gray");

    // Start the rendering loop
    renderScreen();

    // LSL API related calls (like startTerminalDemo) are intentionally OMITTED for this test phase.
    // window.addEventListener("resize", () => { ... }); // Re-add this later, if dynamic resize needed.
});

// All LSL API related functions (callLSLAPI, startTerminalDemo, displayNextLSLMessage, etc.)
// are NOT included in this version to isolate the problem.
