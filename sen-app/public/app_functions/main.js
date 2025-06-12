/**
 * Loads match data from localStorage.
 * @returns {object|null} The parsed match data or null if not found/corrupted.
 */ 

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
