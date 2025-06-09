// ===== NEW CODE: Socket.IO connection and update emitter =====
/*const socket = io();*/


// statemanager.js - NEW FILE

/*function loadMatchData() {
    const storedData = localStorage.getItem('cricketMatchData'); // Using a specific key
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            console.error("Error parsing match data from localStorage:", e);
            localStorage.removeItem('cricketMatchData'); // Clear corrupted data
            return null;
        }
    }
    return null; // No data found
}

/**
 * Saves the current match state to localStorage.
 * This function now captures ALL relevant game state variables.
 
function saveMatchData() {
    const dataToSave = {
        batsman1: batsman1,
        batsman2: batsman2,
        onStrikeName: onStrike.name,
        nonStrikerName: nonStriker.name,
        currentBowler: currentBowler,
        overBalls: overBalls,
        totalRuns: totalRuns,
        wickets: wickets,
        pendingWicket: pendingWicket,
        pendingBowlerModal: pendingBowlerModal,
        bowlers: bowlers,
        historyStack: historyStack,
        overSummaryHTML: document.getElementById('over-summary').innerHTML
    };
    localStorage.setItem('cricketMatchData', JSON.stringify(dataToSave));
    console.log("Match data saved to localStorage:", dataToSave); // For debugging
}

// Load initial state or set defaults
const initialMatchState = loadMatchData();
// Add this console.log after initialMatchState is determined
if (initialMatchState) {
    console.log("Match data loaded from localStorage:", initialMatchState);
} else {
    console.log("No match data found in localStorage. Starting with defaults.");
} */

window.initialMatchState = JSON.parse(localStorage.getItem("matchState"));// clear old state just for testing

// --- Initialize game state variables using loaded data or defaults ---
window.batsman1 = initialMatchState ? initialMatchState.batsman1 : { name: 'Player 1', runs: 0, balls: 0, fours: 0, sixes: 0 };
window.batsman2 = initialMatchState ? initialMatchState.batsman2 : { name: 'Player 2', runs: 0, balls: 0, fours: 0, sixes: 0 };
window.currentBowler = initialMatchState ? initialMatchState.currentBowler : 'Bowler 1';

window.onStrike = batsman1.name === (initialMatchState ? initialMatchState.onStrikeName : batsman1.name) ? batsman1 : batsman2;
window.nonStriker = onStrike === batsman1 ? batsman2 : batsman1;

window.overBalls = initialMatchState ? initialMatchState.overBalls : 0;
window.totalRuns = initialMatchState ? initialMatchState.totalRuns : 0;
window.wickets = initialMatchState ? initialMatchState.wickets : 0;
window.pendingWicket = initialMatchState ? initialMatchState.pendingWicket : false;
window.pendingBowlerModal = initialMatchState ? initialMatchState.pendingBowlerModal : false;

window.bowlers = initialMatchState && initialMatchState.bowlers ? initialMatchState.bowlers : {
    [currentBowler]: { overs: 0, runs: 0 }
};
window.addEventListener("load", () => {

// Ensure currentBowler is initialized in bowlers if it's new
if (!bowlers[currentBowler]) {
    bowlers[currentBowler] = { overs: 0, runs: 0 };
}


window.historyStack = initialMatchState ? initialMatchState.historyStack : [];

// Restore over summary HTML
if (initialMatchState && initialMatchState.overSummaryHTML) {
    document.getElementById('over-summary').innerHTML = initialMatchState.overSummaryHTML;
}

// Initialize localMatchState based on the loaded/default game state
window. localMatchState = {
    score: totalRuns,
    wickets: wickets,
    overs: `${Math.floor(Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0) + overBalls / 6)}.${overBalls % 6}`,
    batsman1: batsman1,
    batsman2: batsman2,
    bowler: currentBowler,
    balls: Array.from(document.querySelectorAll('#over-summary .ball')).map(b => b.textContent)
};
localStorage.setItem("matchState", JSON.stringify(localMatchState));


// Initial UI updates and emission after script loads and data is initialized
updateBatsmanUI();
updateScoreboard();
updateBowlerStats();
updateCRR();
emitUpdate(); // Emit initial state for Socket.IO clients (important for new connections)

initControlButtons();
setupSocketListeners(); 
});

//socket.js <-- NEW FILE


/*function emitUpdate() {
    const currentTotalOvers = Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0);
    const displayedOvers = `${Math.floor(currentTotalOvers + overBalls / 6)}.${overBalls % 6}`;

    socket.emit('update', {
        score: totalRuns,
        wickets,
        overs: displayedOvers,
        batsman1: batsman1,
        batsman2: batsman2,
        onStrike: onStrike.name,
        bowler: currentBowler,
        bowlerStats: bowlers[currentBowler],
        balls: Array.from(document.querySelectorAll('#over-summary .ball')).map(b => b.textContent)
    });
}


socket.on('update', (data) => {
    // Main score & overs
    document.querySelector('.score-display').textContent = `${data.score}/${data.wickets}`;
    document.querySelector('.over-display').textContent = `(${data.overs})`;

    // Batsman names (with * on striker)
    document.querySelector('.bat1-name').textContent =
        data.onStrike === data.batsman1.name ? data.batsman1.name + '*' : data.batsman1.name;
    document.querySelector('.bat2-name').textContent =
        data.onStrike === data.batsman2.name ? data.batsman2.name + '*' : data.batsman2.name;

    const rows = document.querySelectorAll('.score-table tbody tr');

    // Batsman 1 stats
    rows[0].children[1].textContent = data.batsman1.runs;
    rows[0].children[2].textContent = data.batsman1.balls;
    rows[0].children[3].textContent = data.batsman1.fours;
    rows[0].children[4].textContent = data.batsman1.sixes;
    rows[0].children[5].textContent =
        data.batsman1.balls > 0 ? ((data.batsman1.runs / data.batsman1.balls) * 100).toFixed(1) : '0.0';

    // Batsman 2 stats
    rows[1].children[1].textContent = data.batsman2.runs;
    rows[1].children[2].textContent = data.batsman2.balls;
    rows[1].children[3].textContent = data.batsman2.fours;
    rows[1].children[4].textContent = data.batsman2.sixes;
    rows[1].children[5].textContent =
        data.batsman2.balls > 0 ? ((data.batsman2.runs / data.batsman2.balls) * 100).toFixed(1) : '0.0';

    // Bowler info
    document.querySelector('.bowler-name').textContent = data.bowler;
    document.querySelector('.bow-runs').textContent = data.bowlerStats.runs;
    document.querySelector('.bow-overs').textContent = data.bowlerStats.overs.toFixed(1);

    // Economy calculation
    const bowledBalls = Math.floor(data.bowlerStats.overs) * 6 + (parseFloat(data.bowlerStats.overs.toString().split('.')[1] || 0));
    const economy =
        bowledBalls > 0 ? (data.bowlerStats.runs / (bowledBalls / 6)).toFixed(2) : '0.00';
    document.querySelector('.bow-eco').textContent = economy;

    // CRR (Current Run Rate)
    const totalBallsMatch = Math.floor(parseFloat(data.overs)) * 6 + (parseFloat(data.overs) % 1) * 10;
    const crr = totalBallsMatch > 0 ? (data.score / (totalBallsMatch / 6)).toFixed(2) : '0.00';
    document.querySelector('.runrate').textContent = crr;

    // Over Summary
    const summaryEl = document.getElementById('over-summary');
    summaryEl.innerHTML = '';
    data.balls.forEach((ball) => {
        const span = document.createElement('span');
        span.className = 'ball p-2 border rounded m-1';
        span.textContent = ball;
        summaryEl.appendChild(span);
    });
});*/



// const historyStack = []; // This is now initialized from `initialMatchState`



//update.js <-- FILE CHANGE

/*function updateBatsmanUI() {
    document.querySelector(".bat1-name").textContent = batsman1 === onStrike ? batsman1.name + "*" : batsman1.name;
    document.querySelector(".bat2-name").textContent = batsman2 === onStrike ? batsman2.name + "*" : batsman2.name;

    const rows = document.querySelectorAll(".score-table tbody tr");
    rows[0].children[1].textContent = batsman1.runs;
    rows[0].children[2].textContent = batsman1.balls;
    rows[0].children[3].textContent = batsman1.fours;
    rows[0].children[4].textContent = batsman1.sixes;
    rows[0].children[5].textContent = batsman1.balls > 0 ? ((batsman1.runs / batsman1.balls) * 100).toFixed(1) : "0.0";

    rows[1].children[1].textContent = batsman2.runs;
    rows[1].children[2].textContent = batsman2.balls;
    rows[1].children[3].textContent = batsman2.fours;
    rows[1].children[4].textContent = batsman2.sixes;
    rows[1].children[5].textContent = batsman2.balls > 0 ? ((batsman2.runs / batsman2.balls) * 100).toFixed(1) : "0.0";
}

function updateScoreboard() {
    const totalOvers = Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0) + overBalls / 6;
    document.querySelector(".score-display").textContent = `${totalRuns} - ${wickets}`;
    document.querySelector(".over-display").textContent = `(${Math.floor(totalOvers)}.${overBalls % 6})`;
}

function updateCRR() {
    const totalBalls = Object.values(bowlers).reduce((acc, b) => acc + b.overs * 6, 0) + overBalls;
    const oversFaced = totalBalls / 6;
    const crr = oversFaced > 0 ? (totalRuns / oversFaced).toFixed(2) : "0.00";
    document.getElementById("crrValue").textContent = crr;
}

function updateBowlerStats() {
    const stats = bowlers[currentBowler];
    document.querySelector(".bowler-name").textContent = currentBowler;
    document.querySelector(".bow-runs").textContent = stats.runs;
    document.querySelector(".bow-overs").textContent = `${stats.overs}.${overBalls}`;
    const totalBalls = stats.overs * 6 + overBalls;
    const economy = (stats.runs / (totalBalls / 6)).toFixed(1);
    document.querySelector(".bow-eco").textContent = isNaN(economy) ? "0.0" : economy;
} */


//statemanager.js  <-- FILE CHANGE

/*function saveState() {
    historyStack.push({
        batsman1: { ...batsman1 },
        batsman2: { ...batsman2 },
        onStrikeName: onStrike.name,
        totalRuns,
        wickets,
        overBalls,
        currentBowler,
        bowlers: JSON.parse(JSON.stringify(bowlers)),
        overHTML: document.getElementById("over-summary").innerHTML
    });
}

function restoreState() {
    if (historyStack.length === 0) {
        alert("Nothing to undo!");
        return;
    }
    const prev = historyStack.pop();
    batsman1 = { ...prev.batsman1 };
    batsman2 = { ...prev.batsman2 };
    onStrike = batsman1.name === prev.onStrikeName ? batsman1 : batsman2;
    nonStriker = onStrike === batsman1 ? batsman2 : batsman1;
    totalRuns = prev.totalRuns;
    wickets = prev.wickets;
    overBalls = prev.overBalls;
    currentBowler = prev.currentBowler;
    bowlers = JSON.parse(JSON.stringify(prev.bowlers));
    document.getElementById("over-summary").innerHTML = prev.overHTML;
    updateBatsmanUI();
    updateScoreboard();
    updateBowlerStats();
    updateCRR();
    // After updating matchData
    saveMatchData(); // <-- ADDED: Save state to localStorage after undo

    localMatchState.batsman1 = { ...batsman1 };
    localMatchState.batsman2 = { ...batsman2 };
    localMatchState.bowler = currentBowler; // It should be the string name
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate();
}*/


//runhandler.js  <-- NEW FILE

/*
function handleRun(run) {
    saveState();

    const isWicket = document.getElementById("defaultCheck1").checked;
    const isWide = document.getElementById("defaultCheck2").checked;
    const isNoBall = document.getElementById("defaultCheck3").checked;

    let extra = 0;
    let ballText = "";

    if (isWide || isNoBall) {
        extra = 1;
        totalRuns += extra + run;
        bowlers[currentBowler].runs += extra + run;
        onStrike.runs += run; // Runs on wide/no-ball go to batsman as well
        if (run === 4) onStrike.fours++;
        if (run === 6) onStrike.sixes++;
        ballText = (isWide ? "Wd" : "Nb") + (run > 0 ? "+" + run : "");
    } else {
        totalRuns += run;
        onStrike.runs += run;
        onStrike.balls++;
        bowlers[currentBowler].runs += run;
        if (run === 4) onStrike.fours++;
        if (run === 6) onStrike.sixes++;
        overBalls++;
        ballText = isWicket ? "W" : run;
        if (run % 2 === 1) [onStrike, nonStriker] = [nonStriker, onStrike];
        if (isWicket) {
            wickets++;
            pendingWicket = true;
            pendingBowlerModal = false;
            setTimeout(() => {
                const modal = new bootstrap.Modal(document.getElementById("wicketModal"));
                modal.show();
            }, 300);
        }
    }

    const ballDiv = document.createElement("span"); // Changed to span for consistency with other elements
    ballDiv.className = "ball p-2 border rounded m-1";
    ballDiv.textContent = ballText;
    document.getElementById("over-summary").appendChild(ballDiv);

    if (!isWide && !isNoBall && overBalls === 6) {
        overBalls = 0;
        bowlers[currentBowler].overs++;
        [onStrike, nonStriker] = [nonStriker, onStrike];
        if (pendingWicket) {
            pendingBowlerModal = true;
        } else {
            const newBowlerModal = new bootstrap.Modal(document.getElementById("newBowlerModal"));
            newBowlerModal.show();
        }
    }

    document.getElementById("defaultCheck1").checked = false;
    document.getElementById("defaultCheck2").checked = false;
    document.getElementById("defaultCheck3").checked = false;

    updateBatsmanUI();
    updateScoreboard();
    updateBowlerStats();
    updateCRR();
    // After updating matchData
    saveMatchData(); // <-- ADDED: Save state to localStorage after handling a run

    localMatchState.batsman1 = batsman1; // Assign objects directly
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
}*/


//wickethandler.js  <--NEW FILE

/*document.getElementById("wicketType").addEventListener("change", function () {
    const needsHelper = ["catch", "stumping"].includes(this.value);
    document.getElementById("helperField").classList.toggle("d-none", !needsHelper);
});

document.getElementById("wicketForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Check for all out
    if (wickets >= 10) {
        alert("All out! The innings has ended.");
        bootstrap.Modal.getInstance(document.getElementById("wicketModal")).hide();
        return;
    }

    const wicketType = document.getElementById("wicketType").value;
    const helper = document.getElementById("helperName").value.trim();
    const newBatsmanName = document.getElementById("newBatsmanName").value.trim();

    if (!newBatsmanName) return alert("Please enter a new batsman name.");

    const outInfo = helper ? `${wicketType} (${helper})` : wicketType;
    console.log(`${onStrike.name} is out: ${outInfo}`);

    if (wicketType === "runout") {
        const whoOut = prompt("Who was run out? Type 'striker' or 'non-striker':").toLowerCase();
        if (whoOut !== "striker" && whoOut !== "non-striker") {
            alert("Invalid input. Please type 'striker' or 'non-striker'.");
            return;
        }
        let outBatsman = whoOut === "striker" ? onStrike : nonStriker;

        if (outBatsman === batsman1) batsman1 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
        else batsman2 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };

        if (outBatsman === onStrike) { // If striker was out, new batsman becomes striker
            onStrike = (batsman1.name === newBatsmanName) ? batsman1 : batsman2;
            nonStriker = (onStrike === batsman1) ? batsman2 : batsman1;
        } else { // If non-striker was out, new batsman becomes non-striker
            nonStriker = (batsman1.name === newBatsmanName) ? batsman1 : batsman2;
            onStrike = (nonStriker === batsman1) ? batsman2 : batsman1;
        }
    } else {
        if (onStrike === batsman1) {
            batsman1 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
            onStrike = batsman1;
        } else {
            batsman2 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
            onStrike = batsman2;
        }
        nonStriker = onStrike === batsman1 ? batsman2 : batsman1;
    }

    updateBatsmanUI();
    bootstrap.Modal.getInstance(document.getElementById("wicketModal")).hide();
    document.getElementById("wicketForm").reset();
    document.getElementById("helperField").classList.add("d-none");
    pendingWicket = false;

    if (pendingBowlerModal) {
        pendingBowlerModal = false;
        const newBowlerModal = new bootstrap.Modal(document.getElementById("newBowlerModal"));
        newBowlerModal.show();
    }
    saveMatchData(); // <-- ADDED: Save state to localStorage after a wicket
    localMatchState.batsman1 = batsman1;
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
});*/


//bowlerHandler.js  <-- NEW FILE

/*document.getElementById("newBowlerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const newNameInput = document.getElementById("newBowlerInput");
    const newName = newNameInput.value.trim();
    if (newName !== "") {
        currentBowler = newName;
        if (!bowlers[currentBowler]) bowlers[currentBowler] = { overs: 0, runs: 0 };
        overBalls = 0;
        document.getElementById("over-summary").innerHTML = "";
        newNameInput.value = "";
        bootstrap.Modal.getInstance(document.getElementById("newBowlerModal")).hide();
        updateBowlerStats();
        saveMatchData(); // <-- ADDED: Save state to localStorage after new bowler
        localMatchState.batsman1 = batsman1;
        localMatchState.batsman2 = batsman2;
        localMatchState.bowler = currentBowler;
        localMatchState.score = totalRuns;
        localMatchState.wickets = wickets;
        localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
        localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
        emitUpdate(); // ===== NEW CODE =====
    }
});*/


//controlbuttons.js  <--NEW FILE

/*document.querySelectorAll(".run-btn").forEach((button) => {
    button.addEventListener("click", () => handleRun(parseInt(button.dataset.run)));
});

document.querySelector(".undo-btn").addEventListener("click", restoreState);

document.querySelector(".swap-btn").addEventListener("click", () => {
    saveState();
    [onStrike, nonStriker] = [nonStriker, onStrike];
    updateBatsmanUI();

    saveMatchData(); // <-- ADDED: Save state to localStorage after swap
    localMatchState.batsman1 = batsman1;
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
});

document.querySelector(".retire-btn").addEventListener("click", () => {
    saveState();
    onStrike.runs = 0;
    onStrike.balls = 0;
    onStrike.fours = 0;
    onStrike.sixes = 0;
    [onStrike, nonStriker] = [nonStriker, onStrike];
    updateBatsmanUI();

    saveMatchData(); // <-- ADDED: Save state to localStorage after retire
    localMatchState.batsman1 = batsman1;
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
});*/

