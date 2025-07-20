// RetroUI.js (This entire content goes into your external RetroUI.js file)

const canvas = document.getElementById("retroScreen");
const ctx = canvas.getContext("2d");

const COLS = 80;
const ROWS = 25;

let CHAR_WIDTH;
let CHAR_HEIGHT;
let FONT_SIZE;
const FONT_FAMILY = "monospace"; // Ensure this font is available or link a web font

// This will hold the LSL Script's granted URL.
// It will be set by the minimal HTML served by the LSL script itself.
let lslApiUrl = window.lslApiUrl || ''; // Access the global variable set by LSL-served HTML

// --- Communication setup for LSL API calls ---
async function callLSLAPI(path, method = 'GET', body = null) {
    if (!lslApiUrl) {
        console.error("LSL API URL not set. Cannot call API. (window.lslApiUrl is empty)");
        return null;
    }

    const options = { method: method };
    if (body) {
        options.body = body;
        options.headers = { 'Content-Type': 'text/plain' }; // LSL is expecting text for simple commands
    }

    try {
        const response = await fetch(`${lslApiUrl}${path}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text(); // LSL is currently sending plain text responses
        return data;
    } catch (error) {
        console.error(`Error calling LSL API at ${path}:`, error);
        writeLine(`LSL Error: ${error.message}`, "red");
        return null;
    }
}

// --- Retro Terminal Core Logic ---
let screenBuffer = [];
let cursorX = 0;
let cursorY = 0;
let frameCounter = 0;
let currentInputLine = "";
let acceptingInput = false;

function setCanvasAndCharDimensions() {
    // Check if canvas is actually mounted in the DOM
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    CHAR_WIDTH = canvas.width / COLS;
    CHAR_HEIGHT = canvas.height / ROWS;
    FONT_SIZE = Math.max(1, CHAR_HEIGHT * 0.8);
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    renderScreen(); // Redraw immediately on resize
}

function initScreenBuffer() {
    for (let y = 0; y < ROWS; y++) {
        screenBuffer[y] = [];
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = { char: " ", color: "#0F0" };
        }
    }
}

function printChar(char, col, row, color = "#0F0") {
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        screenBuffer[row][col] = { char: char, color: color };
    }
}

function printString(str, startCol, startRow, color = "#0F0") {
    let currentX = startCol;
    let currentY = startRow;
    for (let i = 0; i < str.length; i++) {
        if (currentX >= COLS) {
            currentX = 0;
            currentY++;
        }
        if (currentY >= ROWS) break;
        printChar(str[i], currentX, currentY, color);
        currentX++;
    }
    return { x: currentX, y: currentY }; // Return final cursor position
}

function clearScreen() {
    initScreenBuffer();
    cursorX = 0;
    cursorY = 0;
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

function writeLine(line, color = "#0F0") {
    // Ensure cursorY is within bounds, scroll if needed
    while (cursorY >= ROWS - 1) { // Leave last line for input
        scrollScreen();
        cursorY = ROWS - 2; // Adjust cursor after scroll
    }
    printString(line, 0, cursorY, color);
    cursorY++;
    cursorX = 0; // Move to beginning of next line
}

function renderScreen() {
    // Check if canvas context is available
    if (!ctx) return;

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

// --- Terminal Demo & Input Handling ---

async function startTerminalDemo() {
    clearScreen();
    acceptingInput = false;
    await callLSLAPI("/api/resetDemo"); // Tell LSL to reset its message index
    await displayNextLSLMessage();
}

async function displayNextLSLMessage() {
    const msg = await callLSLAPI("/api/nextMessage");
    if (msg === "DEMO_COMPLETE" || msg === null) {
        writeLine("Demo complete.");
        writeLine("C:\\\\> " + currentInputLine); // Prompt for input
        cursorX = "C:\\\\> ".length + currentInputLine.length;
        acceptingInput = true;
    } else {
        writeLine(msg);
        setTimeout(displayNextLSLMessage, 500); // Fetch next message after a delay
    }
}

async function handleCommand(command) {
    writeLine("C:\\\\> " + command); // Echo command
    const response = await callLSLAPI("/api/command", "POST", command);
    if (response) {
        response.split('\n').forEach(line => writeLine(line)); // Split multi-line responses
    } else {
        writeLine("Error communicating with LSL.", "red");
    }
    writeLine("C:\\\\> " + currentInputLine); // Prompt for next input
    cursorX = "C:\\\\> ".length + currentInputLine.length;
}

window.addEventListener("keydown", (e) => {
    if (!acceptingInput) return;

    if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9 .,!?_/\-]/)) { // Basic alphanumeric, space, some symbols
        currentInputLine += e.key;
    } else if (e.key === "Backspace") {
        currentInputLine = currentInputLine.slice(0, -1);
    } else if (e.key === "Enter") {
        e.preventDefault(); // Prevent new line in actual browser
        const commandToExecute = currentInputLine;
        currentInputLine = ""; // Clear input for next line
        handleCommand(commandToExecute);
    }
    // Update cursor based on current input line
    const prompt = "C:\\\\> ";
    printString(prompt + currentInputLine + " ".repeat(COLS - (prompt.length + currentInputLine.length)), 0, ROWS - 1);
    cursorX = prompt.length + currentInputLine.length;
});

// --- Initialization ---
// This function will be called once the DOM is ready and the script has loaded
document.addEventListener('DOMContentLoaded', () => {
    setCanvasAndCharDimensions();
    initScreenBuffer();
    renderScreen(); // Start the rendering loop

    if (lslApiUrl) {
        console.log("LSL API URL received from LSL-served HTML:", lslApiUrl);
        startTerminalDemo(); // Start the terminal demo once LSL URL is known
    } else {
        console.error("LSL API URL not found in window.lslApiUrl. Check your LSL script's G_HTML_TEMPLATE injection.");
        writeLine("Error: LSL API URL not found.", "red");
        writeLine("Check browser console for details.", "red");
    }
});

window.addEventListener("resize", () => {
    setCanvasAndCharDimensions();
});