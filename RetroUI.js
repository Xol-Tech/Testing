// RetroUI.js - Test 6: LSL API Integration with On-Screen Debugging
// This script aims to integrate LSL API calls and display debug messages directly on the terminal.
// --- Global variables (from your original script) ---
const COLS = 80;
const ROWS = 25;
let CHAR_WIDTH;
let CHAR_HEIGHT;
let FONT_SIZE;
const FONT_FAMILY = "monospace"; // Default fallback font
// This variable is provided by the LSL script via window.lslApiUrl
let lslApiUrl = window.lslApiUrl || ''; // Get the URL, default to empty string if not set

// --- Canvas and Context (Declared but not immediately assigned) ---
// These will be assigned inside the DOMContentLoaded listener to ensure the canvas element exists.
let canvas = null;
let ctx = null;

// --- Debugging Log Functions ---
// These functions will write messages directly to the screenBuffer for on-screen debugging.
let debugLineCounter = 0; // Tracks the line for debug messages

function resetDebugLog() {
    debugLineCounter = 0;
}

function logToScreen(message, color = "white") {
    // Ensure the screen buffer is initialized before logging
    if (screenBuffer.length === 0) {
        initScreenBuffer();
    }
    // Use a dedicated area for debug messages, e.g., the top few lines
    // This will overwrite previous debug messages in a rotating fashion if too many.
    const debugY = debugLineCounter % ROWS; // Wrap around if too many messages
    writeLineAt(message, 0, debugY, color); // Use a new helper to write at specific Y
    debugLineCounter++;
}

// Helper function to write a line at a specific Y coordinate without advancing cursorY
function writeLineAt(text, x, y, color) {
    if (y < 0 || y >= ROWS) return; // Bounds check
    clearLine(y); // Clear the line before writing
    const display_text = text.substring(0, COLS); // Truncate text if too long
    printString(display_text, x, y, color); // Print the string
}

// Specific logging functions for different message types
function logInfo(message) { logToScreen(`INFO: ${message}`, "cyan"); }
function logDebug(message) { logToScreen(`DEBUG: ${message}`, "gray"); }
function logSuccess(message) { logToScreen(`SUCCESS: ${message}`, "lime"); }
function logError(message) { logToScreen(`ERROR: ${message}`, "red"); }
function logLSLMessage(message) { logToScreen(`LSL: ${message}`, "yellow"); }


// --- Retro Terminal Core Logic (Confirmed working from Test 5) ---
let screenBuffer = []; // Stores the characters and their colors for the screen
let cursorX = 0;       // Current cursor X position
let cursorY = 0;       // Current cursor Y position
let frameCounter = 0;  // Used for animation frame tracking
let acceptingInput = false; // Set to false to avoid drawing cursor for this test

// Sets the canvas dimensions and calculates character dimensions based on window size.
function setCanvasAndCharDimensions() {
    // Ensure canvas and ctx are available before attempting to use them
    if (!canvas || !ctx) {
        logError("Canvas or Context not found in setCanvasAndCharDimensions! This indicates an initialization issue.");
        return;
    }
    canvas.width = window.innerWidth;  // Set canvas width to window's inner width
    canvas.height = window.innerHeight; // Set canvas height to window's inner height
    CHAR_WIDTH = canvas.width / COLS;   // Calculate character width
    CHAR_HEIGHT = canvas.height / ROWS; // Calculate character height
    // FONT SIZE ADJUSTMENT: Shrunk by 10% (0.8 * 0.9 = 0.72)
    FONT_SIZE = Math.max(1, CHAR_HEIGHT * 0.72); // Calculate font size, ensuring it's at least 1px
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`; // Set the drawing font
    ctx.textBaseline = "top"; // Align text to the top of the character cell
    logDebug(`Canvas dimensions set: ${canvas.width}x${canvas.height}`); // Log debug info
}

// Initializes the screen buffer with empty characters and default color.
function initScreenBuffer() {
    for (let y = 0; y < ROWS; y++) {
        screenBuffer[y] = [];
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" }; // Default green color
        }
    }
    logDebug("Screen buffer initialized."); // Log debug info
}

// Prints a single character to the screen buffer at specified coordinates.
function printChar(char, x, y, color) {
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return; // Bounds check
    screenBuffer[y][x] = { char: char, color: color }; // Update the buffer cell
}

// Prints a string to the screen buffer starting at specified coordinates.
function printString(str, x, y, color) {
    for (let i = 0; i < str.length; i++) {
        printChar(str[i], x + i, y, color); // Print each character of the string
    }
}

// Writes a line of text to the terminal, handling scrolling if necessary.
function writeLine(text, color) {
    if (cursorY >= ROWS) { // If cursor is past the last row, scroll up
        scrollScreen();
        cursorY = ROWS - 1; // Move cursor to the last row
    }
    clearLine(cursorY); // Clear the current line before writing
    // Truncate text if it's too long for the line to avoid visual overflow
    const display_text = text.substring(0, COLS);
    printString(display_text, 0, cursorY, color); // Print the text at the current cursor line
    cursorY++; // Advance cursor to the next line
    cursorX = 0; // Reset cursor X to the beginning of the line
}

// Scrolls the entire screen buffer up by one line.
function scrollScreen() {
    for (let y = 0; y < ROWS - 1; y++) {
        screenBuffer[y] = screenBuffer[y + 1]; // Move each row up
    }
    screenBuffer[ROWS - 1] = []; // Clear the last row
    for (let x = 0; x < COLS; x++) {
        screenBuffer[ROWS - 1][x] = { char: " ", color: "#0F0" }; // Fill last row with empty chars
    }
}

// Clears a specific line in the screen buffer.
function clearLine(y) {
    if (y >= 0 && y < ROWS) { // Bounds check
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" }; // Fill line with empty chars
        }
    }
}

// Clears the entire screen buffer and resets cursor position.
function clearScreen() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" }; // Fill all cells with empty chars
        }
    }
    cursorX = 0; // Reset cursor X
    cursorY = 0; // Reset cursor Y
    resetDebugLog(); // Also reset debug log counter
}

// The main rendering loop that draws the screen buffer to the canvas.
function renderScreen() {
    // This check ensures that drawing only happens if canvas and context are valid.
    // It will keep requesting animation frames until they are.
    if (!ctx || !canvas) {
        requestAnimationFrame(renderScreen);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    ctx.fillStyle = "#000"; // Set fill style to black
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with black
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`; // Set font for drawing
    ctx.textBaseline = "top"; // Align text to the top
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = screenBuffer[y][x];
            if (cell && cell.char !== " ") { // Only draw if character is not empty
                ctx.fillStyle = cell.color; // Set character color
                ctx.fillText(cell.char, x * CHAR_WIDTH, y * CHAR_HEIGHT); // Draw character
            }
        }
    }
    frameCounter++; // Increment frame counter
    requestAnimationFrame(renderScreen); // Request next animation frame
}

// --- LSL API Communication Functions ---

// Function to call the LSL API via fetch.
async function callLSLAPI(cmd, args) {
    if (!window.lslApiUrl) {
        logError("LSL API URL not set in window.lslApiUrl.");
        return;
    }

    // Construct the URL with command and arguments
    const url = `${window.lslApiUrl}?cmd=${encodeURIComponent(cmd)}${args ? `&args=${encodeURIComponent(args)}` : ''}`;
    logInfo(`API Call: ${cmd} Args: ${args}`);
    logDebug(`Fetch URL: ${url}`);

    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json'); // Request JSON content
        headers.append('Accept', 'application/json');      // Expect JSON response

        // Extract the recipient ID (capability key) from the lslApiUrl
        const urlParts = window.lslApiUrl.split('/');
        const recipientId = urlParts[urlParts.length - 1];
        if (recipientId) {
            headers.append('X-SecondLife-Recipient-Id', recipientId); // Add SL-specific header
            logDebug(`Adding X-SecondLife-Recipient-Id: ${recipientId}`);
        }

        // Perform the fetch request
        const response = await fetch(url, {
            method: 'GET', // Explicitly GET method
            headers: headers // Attach custom headers
        });

        if (response.ok) { // Check if response status is OK (200-299)
            const data = await response.json(); // Parse JSON response
            logSuccess(`Fetch Status: ${response.status} OK`);
            logSuccess(`API Response (JSON): ${JSON.stringify(data)}`);
            if (data && data.messages) { // If messages are present in the response
                logSuccess(`Messages received: ${data.messages.length}`);
                data.messages.forEach(msg => logLSLMessage(msg)); // Log each message
            }
        } else { // Handle non-OK responses (e.g., 404, 500)
            const errorText = await response.text(); // Get raw error text
            logError(`Fetch Status: ${response.status} ${response.statusText}`);
            logError(`API Error Response: ${errorText}`);
        }
    } catch (error) { // Catch network errors or other exceptions
        logError(`Fetch Error: ${error.message}`);
    }
}

// Function to display messages received from LSL.
function displayNextLSLMessage(messages) {
    if (messages.length > 0) {
        const message = messages[0];
        writeLine(`LSL Msg: ${message.substring(0, COLS - 2)}`, "white"); // Display the first message
    } else {
        writeLine("LSL reported no new messages.", "gray"); // Inform if no messages
    }
}

// Function to start the terminal demo, including an initial LSL API call.
function startTerminalDemo() {
    writeLine("Starting terminal demo...", "yellow");
    // Make an initial call to the LSL API to get messages or initial data
    callLSLAPI("get_messages", ""); // Replace "get_messages" and "" with your actual command/args
}

// --- Initialization on DOMContentLoaded ---
// This ensures the script runs only after the entire HTML document has been loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    // CRITICAL FIX: Re-assign canvas and ctx here to ensure they are available
    // This addresses potential timing issues where getElementById might fail if called too early.
    canvas = document.getElementById("retroScreen");
    ctx = canvas ? canvas.getContext("2d") : null;

    if (!canvas) {
        // If canvas is still not found, log a fatal error.
        // In a real SL scenario, this would indicate a serious problem with the HTML template.
        logError("FATAL: Canvas element 'retroScreen' not found in DOM!");
        // We cannot draw to the canvas if it's not found, so we return.
        return;
    }

    if (!ctx) {
        // If context cannot be obtained, log a fatal error.
        logError("FATAL: Could not get 2D rendering context for canvas!");
        return; // Stop further execution if context is unavailable
    }

    logSuccess("Canvas and Context successfully obtained on DOMContentLoaded!");

    // 1. Initial setup of canvas and screen buffer
    setCanvasAndCharDimensions(); // Set dimensions based on the now-available canvas
    initScreenBuffer(); // Initialize the screen buffer

    // 2. Display initial boot messages (from Test 5)
    clearScreen(); // Clear the screen before displaying boot messages
    writeLine("Retro Computer v1.0 Booting...", "#0F0");
    writeLine("-----------------------------", "#0F0");
    writeLine("Second Life Viewer Test Mode Active.", "yellow");
    writeLine("Canvas dimensions: " + canvas.width + "x" + canvas.height, "white");
    writeLine("Char dimensions: " + CHAR_WIDTH.toFixed(2) + "x" + CHAR_HEIGHT.toFixed(2), "white");
    writeLine("Font size: " + FONT_SIZE.toFixed(2) + "px", "white");
    writeLine("Text rendering confirmed!", "lime");
    writeLine("Core terminal logic works!", "cyan");

    // 3. Initiate LSL API communication debugging
    writeLine("Checking LSL API URL...", "gray");
    if (lslApiUrl) {
        writeLine(`LSL API URL found: ${lslApiUrl.substring(0, COLS - 2)}`, "white");
        startTerminalDemo(); // Proceed to start the demo which calls LSL API
    } else {
        writeLine("LSL API URL NOT found in window.lslApiUrl!", "red");
        writeLine("Check LSL script's G_HTML_TEMPLATE.", "red");
    }
    // 4. Start the main rendering loop
    renderScreen(); // Begin the continuous rendering loop
    // 5. Add window resize listener (important for dynamic UIs in SL)
    window.addEventListener("resize", () => {
        writeLine("Window resized. Recalculating dimensions.", "gray");
        setCanvasAndCharDimensions(); // Recalculate dimensions on resize
        // screenBuffer contents will be re-rendered by renderScreen loop automatically
    });
});
