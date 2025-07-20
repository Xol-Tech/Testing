// RetroUI.js - Test 6: LSL API Integration with On-Screen Debugging
// This script aims to integrate LSL API calls and display debug messages directly on the terminal.

// --- Global variables (from your original script) ---
const COLS = 80;
const ROWS = 25;
let CHAR_WIDTH;
let CHAR_HEIGHT;
let FONT_SIZE;
const FONT_FAMILY = "monospace";

// This variable is provided by the LSL script via window.lslApiUrl
let lslApiUrl = window.lslApiUrl || ''; // Get the URL, default to empty string if not set

// --- Canvas and Context ---
const canvas = document.getElementById("retroScreen");
const ctx = canvas ? canvas.getContext("2d") : null;

// --- Retro Terminal Core Logic (Confirmed working from Test 5) ---
let screenBuffer = [];
let cursorX = 0;
let cursorY = 0;
let frameCounter = 0;
let acceptingInput = false; // Set to false to avoid drawing cursor for this test

function setCanvasAndCharDimensions() {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    CHAR_WIDTH = canvas.width / COLS;
    CHAR_HEIGHT = canvas.height / ROWS;
    FONT_SIZE = Math.max(1, CHAR_HEIGHT * 0.8);
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = "top";
}

function initScreenBuffer() {
    for (let y = 0; y < ROWS; y++) {
        screenBuffer[y] = [];
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" };
        }
    }
}

function printChar(char, x, y, color) {
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return;
    screenBuffer[y][x] = { char: char, color: color };
}

function printString(str, x, y, color) {
    for (let i = 0; i < str.length; i++) {
        printChar(str[i], x + i, y, color);
    }
}

function writeLine(text, color) {
    if (cursorY >= ROWS) {
        scrollScreen();
        cursorY = ROWS - 1;
    }
    clearLine(cursorY);
    // Truncate text if it's too long for the line to avoid visual overflow
    const display_text = text.substring(0, COLS);
    printString(display_text, 0, cursorY, color);
    cursorY++;
    cursorX = 0;
}

function scrollScreen() {
    for (let y = 0; y < ROWS - 1; y++) {
        screenBuffer[y] = screenBuffer[y + 1];
    }
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
    if (!ctx || !canvas) {
        requestAnimationFrame(renderScreen);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = "top";

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = screenBuffer[y][x];
            if (cell && cell.char !== " ") {
                ctx.fillStyle = cell.color;
                ctx.fillText(cell.char, x * CHAR_WIDTH, y * CHAR_HEIGHT);
            }
        }
    }
    frameCounter++;
    requestAnimationFrame(renderScreen);
}

// --- LSL API Communication Functions (Re-introduced with debug messages) ---

// Original function from your script - now with extensive debugging output
function callLSLAPI(cmd, args) {
    if (!lslApiUrl) {
        writeLine("ERROR: lslApiUrl is EMPTY!", "red");
        writeLine("Cannot call LSL API without a URL.", "red");
        return;
    }
    writeLine(`API Call: ${cmd} Args: ${args}`, "yellow");
    let url = `${lslApiUrl}?cmd=${encodeURIComponent(cmd)}`;
    if (args) {
        url += `&args=${encodeURIComponent(args)}`;
    }
    writeLine(`Fetch URL: ${url.substring(0, COLS - 2)}`, "gray"); // Display URL, truncated

    fetch(url)
        .then(response => {
            writeLine(`Fetch Status: ${response.status} ${response.statusText}`, "yellow");
            if (!response.ok) {
                // If response is not OK (e.g., 404, 500), try to read error message
                return response.text().then(text => {
                    throw new Error(`HTTP Error! Status: ${response.status}, Body: ${text.substring(0, COLS - 2)}`);
                });
            }
            return response.json(); // Expecting JSON response
        })
        .then(data => {
            writeLine("API Response (JSON):", "lime");
            // Attempt to stringify and display part of the JSON response
            try {
                const dataString = JSON.stringify(data);
                writeLine(dataString.substring(0, COLS), "lime"); // Display up to a full line
            } catch (e) {
                writeLine("Error stringifying JSON response.", "orange");
            }

            // Check if 'messages' array exists and is an array
            if (data && data.messages && Array.isArray(data.messages)) {
                writeLine(`Messages received: ${data.messages.length}`, "lime");
                displayNextLSLMessage(data.messages); // Process and display the messages
            } else {
                writeLine("LSL Response missing 'messages' array or wrong format.", "orange");
            }
        })
        .catch(error => {
            writeLine(`FETCH ERROR: ${error.message.substring(0, COLS)}`, "red");
            writeLine("Check LSL script/permissions.", "red");
        });
}

// Function to display messages from LSL (will just print the first one for this test)
function displayNextLSLMessage(messages) {
    if (messages.length > 0) {
        const message = messages[0];
        writeLine(`LSL Msg: ${message.substring(0, COLS - 2)}`, "white"); // Display the message
    } else {
        writeLine("LSL reported no new messages.", "gray");
    }
    // For this test, we are not setting up continuous polling.
    // In your full application, you might use setInterval here to poll regularly.
    // setInterval(() => callLSLAPI("get_messages", ""), 5000); // Example for continuous polling
}


// Function to start the terminal demo (now includes initial LSL call)
function startTerminalDemo() {
    writeLine("Starting terminal demo...", "yellow");
    // Make an initial call to the LSL API to get messages or initial data
    callLSLAPI("get_messages", ""); // Replace "get_messages" and "" with your actual command/args
    // If you want continuous polling, uncomment the setInterval in displayNextLSLMessage or here
}


// --- Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial setup of canvas and screen buffer
    setCanvasAndCharDimensions();
    initScreenBuffer();

    // 2. Display initial boot messages (from Test 5)
    clearScreen();
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
    renderScreen();

    // 5. Add window resize listener (important for dynamic UIs in SL)
    window.addEventListener("resize", () => {
        writeLine("Window resized. Recalculating dimensions.", "gray");
        setCanvasAndCharDimensions();
        // screenBuffer contents will be re-rendered by renderScreen loop
    });
});
